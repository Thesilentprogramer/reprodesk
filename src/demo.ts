import { accountId, balance, call, contractId, explorer, near, parentId, required, view } from './chain.js';
import { reason, sha256, sourceValue } from './ai.js';
import { marketHook } from './market.js';
import { settleWithMcp } from './mcp.js';
import { optionalMainnetIntents } from './intents.js';

type Task = { id: number; winner: string | null; escrow_yocto: string; bids: { worker: string; amount_yocto: string }[]; verdict: boolean | null; settled: boolean };

async function main() {
  if (!parentId || !contractId) throw new Error('Configure NEAR_TESTNET_PARENT_ACCOUNT and CONTRACT_ACCOUNT');
  required('NEAR_AI_API_KEY');
  const sourceUrl = process.env.SOURCE_URL || 'https://jsonplaceholder.typicode.com/todos/1';
  const field = process.env.SOURCE_FIELD || 'title';
  const description = `Extract the exact ${field} field from ${sourceUrl}`;
  const before = await view<number>('next_task_id', {});
  await call('requester', 'post_task', {
    reviewer: accountId('reviewer'), coordinator: accountId('coordinator'),
    description, source_url: sourceUrl, expected_field: field,
  }, near('0.3'));
  const taskId = Number(before);
  if (!await view<Task>('get_task', { task_id: taskId })) throw new Error('Posted task not visible on chain');
  await call('worker1', 'bid', { task_id: taskId, amount_yocto: near('0.2') });
  await call('worker2', 'bid', { task_id: taskId, amount_yocto: near('0.25') });
  await call('coordinator', 'select_winner', { task_id: taskId });
  const task = await view<Task>('get_task', { task_id: taskId });
  if (task.winner !== accountId('worker1')) throw new Error('Unexpected on-chain winner');
  const { raw, value: truth } = await sourceValue(sourceUrl, field);
  const worker1 = await reason('worker1', `JSON: ${raw}\nExtract ${field}. Return just the field value.`);
  const worker2 = await reason('worker2', `Independently inspect this JSON: ${raw}\nWhat is ${field}? Return just the value.`);
  console.log(`Worker outputs: ${JSON.stringify({ worker1, worker2 })}`);
  await call('worker1', 'submit', { task_id: taskId, result_hash: sha256(worker1) });
  const aiVerdict = await reason('reviewer', `Expected field ${field} has value ${JSON.stringify(truth)}. Worker submission is ${JSON.stringify(worker1)}. Return exactly ACCEPT or REJECT.`);
  if (!['ACCEPT', 'REJECT'].includes(aiVerdict)) throw new Error(`Reviewer returned invalid verdict ${aiVerdict}`);
  const accepted = aiVerdict === 'ACCEPT' && worker1 === truth;
  const evidence = JSON.stringify({ sourceUrl, field, sourceHash: sha256(raw), workerHash: sha256(worker1), truth, aiVerdict, accepted });
  await call('reviewer', 'review', { task_id: taskId, accepted, evidence_hash: sha256(evidence) });
  const payee = accepted ? task.winner : accountId('requester');
  const expectedDelta = BigInt(near(accepted ? '0.2' : '0.3'));
  const beforeBalance = await balance(payee);
  const settleHash = await settleWithMcp(taskId);
  console.log(`coordinator.settle via NEAR MCP: ${explorer(settleHash)}`);
  const final = await view<Task>('get_task', { task_id: taskId });
  if (!final.settled || final.verdict !== accepted) throw new Error('Final on-chain state did not confirm settlement');
  let afterBalance = beforeBalance;
  for (let attempt = 0; attempt < 10; attempt++) {
    afterBalance = await balance(payee);
    if (afterBalance - beforeBalance >= expectedDelta) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (afterBalance - beforeBalance < expectedDelta) throw new Error(`Settlement transaction did not credit ${payee} as expected`);
  console.log(`Verified ${payee} balance delta: ${afterBalance - beforeBalance} yoctoNEAR`);
  console.log(`Task ${taskId}: ${JSON.stringify({ winner: final.winner, accepted, escrow_yocto: final.escrow_yocto })}`);
  await marketHook(description);
  await optionalMainnetIntents();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
