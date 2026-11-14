import 'dotenv/config';
import { connect, keyStores, KeyPair, utils } from 'near-api-js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const roles = ['requester', 'worker1', 'worker2', 'reviewer', 'coordinator'] as const;
export type Role = typeof roles[number];
export const parentId = process.env.NEAR_TESTNET_PARENT_ACCOUNT ?? '';
export const contractId = process.env.CONTRACT_ACCOUNT || (parentId ? `contract.${parentId}` : '');
export const rpcUrl = process.env.NEAR_RPC_URL || 'https://rpc.testnet.near.org';
export const credentialDir = path.join(os.homedir(), '.near-credentials', 'proofbounty');
export const accountId = (role: Role) => `${role}.${parentId}`;
export const explorer = (hash: string) => `https://testnet.nearblocks.io/txns/${hash}`;
export const near = (amount: string) => utils.format.parseNearAmount(amount)!;

export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required. See .env.example and BLOCKERS.md.`);
  return value;
}

export function credentialPath(id: string, scoped = false): string {
  return path.join(credentialDir, `${id}${scoped ? '.function' : ''}.json`);
}

function keyName(id: string): string { return id === parentId ? 'NEAR_TESTNET_PARENT_PRIVATE_KEY' : `NEAR_KEY_${id.split('.')[0].toUpperCase()}`; }
export function saveKey(id: string, key: KeyPair): void {
  const name = keyName(id);
  if (process.env[name] === key.toString()) return;
  const filename = path.join(process.cwd(), '.env');
  const lines = fs.readFileSync(filename, 'utf8').split('\n').filter(line => !line.startsWith(`${name}=`));
  lines.push(`${name}=${key.toString()}`);
  fs.writeFileSync(filename, lines.filter(Boolean).join('\n') + '\n', { mode: 0o600 });
  process.env[name] = key.toString();
}
export function loadKey(id: string, _scoped = false): KeyPair {
  const value = process.env[keyName(id)];
  if (!value) throw new Error(`Missing ${keyName(id)} in .env; run npm run setup`);
  return KeyPair.fromString(value);
}

export async function connection(ids: string[], scoped = true) {
  const keyStore = new keyStores.InMemoryKeyStore();
  for (const id of ids) await keyStore.setKey('testnet', id, loadKey(id, scoped));
  return connect({ networkId: 'testnet', nodeUrl: rpcUrl, keyStore, headers: {} } as Parameters<typeof connect>[0]);
}

export async function call(role: Role, methodName: string, args: object, deposit = '0') {
  const nearConnection = await connection([accountId(role)], false);
  const signer = await nearConnection.account(accountId(role));
  const result = await signer.functionCall({ contractId, methodName, args, gas: BigInt('100000000000000'), attachedDeposit: BigInt(deposit) });
  if (result.status && typeof result.status === 'object' && 'Failure' in result.status) throw new Error(`${methodName} failed: ${JSON.stringify(result.status)}`);
  console.log(`${role}.${methodName}: ${explorer(result.transaction.hash)}`);
  return result;
}

export async function view<T>(methodName: string, args: object): Promise<T> {
  const nearConnection = await connect({ networkId: 'testnet', nodeUrl: rpcUrl, keyStore: new keyStores.InMemoryKeyStore(), headers: {} } as Parameters<typeof connect>[0]);
  const account = await nearConnection.account(contractId);
  return account.viewFunction({ contractId, methodName, args }) as Promise<T>;
}

export async function balance(id: string): Promise<bigint> {
  const nearConnection = await connect({ networkId: 'testnet', nodeUrl: rpcUrl, keyStore: new keyStores.InMemoryKeyStore(), headers: {} } as Parameters<typeof connect>[0]);
  const state = await (await nearConnection.account(id)).state();
  return BigInt(state.amount);
}
