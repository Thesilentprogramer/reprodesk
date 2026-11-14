import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { accountId, contractId, credentialPath } from './chain.js';

// The coordinator's settlement is signed by the real @nearai/near-mcp server.
export async function settleWithMcp(taskId: number): Promise<string> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['node_modules/@nearai/near-mcp/dist/near-mcp.js', 'run'],
    env: { ...process.env, NEAR_NETWORK: 'testnet' } as Record<string, string>,
  });
  const client = new Client({ name: 'proofbounty-coordinator', version: '0.1.0' });
  await client.connect(transport);
  try {
    const available = await client.listTools();
    for (const name of ['system_import_account', 'contract_call_raw_function']) {
      if (!available.tools.some(tool => tool.name === name)) throw new Error(`NEAR MCP missing ${name}`);
    }
    const imported = await client.callTool({ name: 'system_import_account', arguments: {
      args: { op: 'import_from_file', filePath: credentialPath(accountId('coordinator')) },
    } });
    if (imported.isError) throw new Error(`MCP import failed: ${JSON.stringify(imported.content)}`);
    const result = await client.callTool({ name: 'contract_call_raw_function', arguments: {
      accountId: accountId('coordinator'), contractAccountId: contractId,
      methodName: 'settle', networkId: 'testnet', args: { task_id: taskId },
      gas: 100000000000000, attachedDeposit: 0,
    } });
    if (result.isError) throw new Error(`MCP settle failed: ${JSON.stringify(result.content)}`);
    const output = JSON.stringify(result.content);
    const hash = output.match(/[1-9A-HJ-NP-Za-km-z]{43,44}/)?.[0];
    if (!hash) throw new Error(`MCP settlement returned no transaction hash: ${output}`);
    return hash;
  } finally {
    await client.close();
  }
}
