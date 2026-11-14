import { createHash } from 'node:crypto';
export type QuerySpec = { source: 'near-mainnet-archival-rpc'; kind: 'top_receivers' | 'action_counts'; from_block: number; to_block: number };
export const canonical = (x: unknown): string => JSON.stringify(x, (_k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b))) : v);
export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const endpoint = process.env.MAINNET_ARCHIVAL_RPC || 'https://archival-rpc.mainnet.fastnear.com';
async function rpc(method: string, params: object): Promise<any> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const r = await fetch(endpoint, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({jsonrpc:'2.0',id:'reprodesk',method,params}), signal: AbortSignal.timeout(20000) }); const j: any = await r.json(); if (j.error) throw Error(JSON.stringify(j.error)); return j.result; }
    catch (e) { if (attempt === 2) throw e; await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1))); }
  }
}
export async function runQuery(spec: QuerySpec) {
  if (spec.source !== 'near-mainnet-archival-rpc' || !['top_receivers','action_counts'].includes(spec.kind) || !Number.isInteger(spec.from_block) || !Number.isInteger(spec.to_block) || spec.to_block < spec.from_block || spec.to_block - spec.from_block > 3) throw Error('Unsupported query spec');
  const blocks = await Promise.all(Array.from({length:spec.to_block-spec.from_block+1},(_,i)=>rpc('block',{block_id:spec.from_block+i})));
  const chunks = await Promise.all(blocks.flatMap((b:any)=>b.chunks.map((c:any)=>rpc('chunk',{chunk_id:c.chunk_hash}))));
  const txs = chunks.flatMap((c:any)=>c.transactions || []);
  let rows: object[];
  if (spec.kind === 'top_receivers') { const counts = new Map<string,number>(); for (const tx of txs) counts.set(tx.receiver_id,(counts.get(tx.receiver_id)||0)+1); rows = [...counts].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,5).map(([receiver_id,transactions])=>({receiver_id,transactions})); }
  else { const counts = new Map<string,number>(); for (const tx of txs) for (const action of tx.actions) { const kind=Object.keys(action)[0]; counts.set(kind,(counts.get(kind)||0)+1); } rows=[...counts].sort((a,b)=>a[0].localeCompare(b[0])).map(([action,count])=>({action,count})); }
  const result = { source: spec.source, kind: spec.kind, from_block:spec.from_block, to_block:spec.to_block, transaction_count:txs.length, rows };
  return { result, canonical_json:canonical(result), hash:sha256(canonical(result)) };
}
