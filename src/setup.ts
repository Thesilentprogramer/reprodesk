import { KeyPair, utils } from 'near-api-js';
import fs from 'node:fs';
import { accountId, connection, contractId, credentialPath, explorer, near, parentId, required, roles, saveKey } from './chain.js';

async function main() {
  if (!parentId.endsWith('.testnet')) throw new Error('NEAR_TESTNET_PARENT_ACCOUNT must end with .testnet');
  const parentKey = KeyPair.fromString(required('NEAR_TESTNET_PARENT_PRIVATE_KEY'));
  saveKey(parentId, parentKey);
  const chain = await connection([parentId], false);
  const parent = await chain.account(parentId);
  const ids = [...roles.map(accountId), contractId];
  for (const id of ids) {
    const keyFile = credentialPath(id);
    const key = fs.existsSync(keyFile) ? KeyPair.fromString(JSON.parse(fs.readFileSync(keyFile, 'utf8')).private_key) : KeyPair.fromRandom('ed25519');
    if (!fs.existsSync(keyFile)) saveKey(id, key);
    try {
      await (await chain.account(id)).state();
      console.log(`${id}: exists`);
    } catch {
      const amount = id === contractId ? near('4') : near('0.5');
      const receipt = await parent.createAccount(id, key.getPublicKey(), BigInt(amount));
      console.log(`created ${id}: ${explorer(receipt.transaction.hash)}`);
    }
    if (id === contractId) continue;
    const scopedFile = credentialPath(id, true);
    if (fs.existsSync(scopedFile)) continue;
    const functionKey = KeyPair.fromRandom('ed25519');
    const fullChain = await connection([id], false);
    const agent = await fullChain.account(id);
    const methods = id.startsWith('requester.') ? ['post_task'] : id.startsWith('worker') ? ['bid', 'submit'] : id.startsWith('reviewer.') ? ['review'] : ['select_winner', 'settle'];
    const receipt = await agent.addKey(functionKey.getPublicKey(), contractId, methods, BigInt(near('0.1')));
    saveKey(id, functionKey, true);
    console.log(`scoped key ${id}: ${explorer(receipt.transaction.hash)}`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
