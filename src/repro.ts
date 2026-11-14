import fs from 'node:fs';
import { accountId, call, contractId, near, view } from './chain.js';
import { canonical, runQuery, sha256, type QuerySpec } from './data.js';
const jobs: { claim:string; spec:QuerySpec }[] = [
 {claim:'Top five transaction receiver accounts in NEAR mainnet blocks 130000000–130000001',spec:{source:'near-mainnet-archival-rpc',kind:'top_receivers',from_block:130000000,to_block:130000001}},
 {claim:'Action type counts in NEAR mainnet blocks 130000000–130000001',spec:{source:'near-mainnet-archival-rpc',kind:'action_counts',from_block:130000000,to_block:130000001}}
];
async function writeReport(id:number, claim:string, spec:QuerySpec, result:unknown, worker:string, tampered:boolean):Promise<string> {
 const template=`# ${claim}\n\nSource: NEAR archival mainnet RPC. Fixed block range: ${spec.from_block}–${spec.to_block}.\n\nWorker: ${worker}. ${tampered?'This submission deliberately changed the first numeric value to exercise verifier rejection.':'The figures below come from the canonical query result.'}\n\n\`\`\`json\n${canonical(result)}\n\`\`\`\n\nRebuild with \`npm run rebuild -- ${id}\`.\n`;
 let text=template;
 if (process.env.NEAR_AI_API_KEY) {
  try { const response=await fetch('https://cloud-api.near.ai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${process.env.NEAR_AI_API_KEY}`},body:JSON.stringify({model:process.env.NEAR_AI_MODEL||'deepseek-ai/DeepSeek-V3.1',temperature:0,messages:[{role:'system',content:'Write a concise research thesis strictly using the supplied numbers. Do not invent facts.'},{role:'user',content:template}]})}); if (!response.ok) throw Error(`HTTP ${response.status}`); const body:any=await response.json(); text+=`\n## NEAR AI Cloud commentary\n\n${body.choices?.[0]?.message?.content||'(empty response)'}\n`; }
  catch(e) { text+=`\n## Write-up mode\n\nDeterministic template; NEAR AI Cloud request failed: ${String(e)}.\n`; }
 } else text+='\n## Write-up mode\n\nDeterministic template; NEAR_AI_API_KEY was not set.\n';
 fs.mkdirSync('reports',{recursive:true}); const path=`reports/${id}-${worker}.md`; fs.writeFileSync(path,text); return sha256(text);
}
for (const entry of jobs) {
 const specJson=canonical(entry.spec); const existing=(await view<any[]>('get_jobs',{})).find(j=>j.query_spec_json===specJson && j.claim_text===entry.claim);
 const id=existing ? existing.id : Number(await view<number>('next_job_id',{}));
 if (existing?.status==='paid') { console.log(`Job ${id} already paid`); continue; }
 if (!existing) await call('requester','post_job',{claim_text:entry.claim,query_spec_json:specJson,deadline:Date.now()*1_000_000+3_600_000_000_000},near('0.2'));
 const data=await runQuery(entry.spec); console.log(`Job ${id} canonical result hash: ${data.hash}`);
 const order=id%2===0?['worker2','worker1']:['worker1','worker2'];
 for (const worker of order) {
  const prior=(await view<any>('get_job',{job_id:id})).submissions.find((s:any)=>s.worker===accountId(worker as 'worker1'|'worker2'));
  if (prior) { console.log(`Job ${id} ${worker} already ${prior.status}`); if (prior.status==='pending') { const fresh=await runQuery(entry.spec); await call('reviewer','verify',{job_id:id,submission_id:prior.id,recomputed_result_hash:fresh.hash}); const updated=await view<any>('get_job',{job_id:id}); if (updated.status==='paid') break; } continue; }
  const tampered=worker==='worker2' && id%2===0;
  const result:any=structuredClone(data.result); if (tampered) { if (result.rows[0].transactions !== undefined) result.rows[0].transactions+=1; else result.transaction_count+=1; }
  const resultHash=sha256(canonical(result)); const reportHash=await writeReport(id,entry.claim,entry.spec,result,worker,tampered);
  const before=await view<{submissions:unknown[]}>('get_job',{job_id:id}); const subId=before.submissions.length;
  await call(worker as 'worker1'|'worker2','submit',{job_id:id,query_spec_hash:sha256(specJson),result_hash:resultHash,report_cid_or_hash:reportHash});
  // The verifier independently fetches and hashes the pinned chain data.
  const fresh=await runQuery(entry.spec); await call('reviewer','verify',{job_id:id,submission_id:subId,recomputed_result_hash:fresh.hash});
  const state=await view<{status:string;submissions:{status:string}[]}>('get_job',{job_id:id}); console.log(`Job ${id} / ${accountId(worker as 'worker1'|'worker2')}: ${state.submissions[subId].status}`);
  if (state.status==='paid') break;
 }
}
console.log(`Contract: ${contractId}`);
