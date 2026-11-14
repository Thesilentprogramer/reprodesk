import { KeyPair, utils } from 'near-api-js';
import { accountId, connection, contractId, explorer, near, parentId, required, roles, saveKey } from './chain.js';

async function main() {
  if (!parentId.endsWith('.testnet')) throw new Error('NEAR_TESTNET_PARENT_ACCOUNT must end with .testnet');
  const parentKey = KeyPair.fromString(required('NEAR_TESTNET_PARENT_PRIVATE_KEY'));
  saveKey(parentId, parentKey);
  const chain = await connection([parentId], false);
  const parent = await chain.account(parentId);
  const ids = [...roles.map(accountId), contractId];
  for (const id of ids) {
    const envName = `NEAR_KEY_${id.split('.')[0].toUpperCase()}`;
    const key = process.env[envName] ? KeyPair.fromString(process.env[envName]) : KeyPair.fromRandom('ed25519');
    if (!process.env[envName]) saveKey(id, key);
    try {
      await (await chain.account(id)).state();
      console.log(`${id}: exists`);
    } catch {
      const amount = id === contractId ? near('6.7') : id.startsWith('requester.') ? near('0.8') : near('0.3');
      const receipt = await parent.createAccount(id, key.getPublicKey(), BigInt(amount));
      console.log(`created ${id}: ${explorer(receipt.transaction.hash)}`);
    }

  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
