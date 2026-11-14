import fs from 'node:fs';
import { connection, contractId, explorer, view } from './chain.js';

async function main() {
  const wasm = 'contract/target/wasm32-unknown-unknown/release/proofbounty_escrow.wasm';
  if (!fs.existsSync(wasm)) throw new Error(`Missing ${wasm}; run npm run build:contract`);
  const chain = await connection([contractId], false);
  const account = await chain.account(contractId);
  const deployed = await account.deployContract(fs.readFileSync(wasm));
  console.log(`contract deploy: ${explorer(deployed.transaction.hash)}`);
  try {
    await view<number>('next_task_id', {});
    console.log('contract already initialized');
  } catch {
    const initialized = await account.functionCall({ contractId, methodName: 'new', args: {}, gas: BigInt('30000000000000') });
    console.log(`contract init: ${explorer(initialized.transaction.hash)}`);
  }
  console.log(`contract: ${contractId}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
