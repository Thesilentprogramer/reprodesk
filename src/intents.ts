import { OneClickService, OpenAPI, QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript';
import { required } from './chain.js';
import { createInterface } from 'node:readline/promises';

export async function optionalMainnetIntents() {
  if (process.env.ENABLE_MAINNET_INTENTS !== 'true') return;
  OpenAPI.TOKEN = required('ONE_CLICK_JWT');
  const request: QuoteRequest = {
    dry: false,
    swapType: QuoteRequest.swapType.EXACT_INPUT,
    slippageTolerance: 100,
    originAsset: required('ONE_CLICK_ORIGIN_ASSET'),
    destinationAsset: required('ONE_CLICK_DESTINATION_ASSET'),
    amount: required('ONE_CLICK_AMOUNT_BASE_UNITS'),
    depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
    refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
    recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
    refundTo: required('ONE_CLICK_REFUND_TO'),
    recipient: required('ONE_CLICK_RECIPIENT'),
    deadline: new Date(Date.now() + 15 * 60_000).toISOString(),
  };
  const quote = await OneClickService.getQuote(request);
  const depositAddress = quote.quote?.depositAddress;
  if (!depositAddress) throw new Error('1Click returned no deposit address');
  console.log(`1Click mainnet quote: ${JSON.stringify(quote)}`);
  // Deposit submission requires a separately signed mainnet transfer by the operator.
  // This code cannot silently spend real funds; the opt-in flag alone only permits quoting.
  let txHash = process.env.ONE_CLICK_DEPOSIT_TX_HASH;
  if (!txHash) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      txHash = (await rl.question(`Send the quoted asset to ${depositAddress} from your own mainnet wallet, then paste the deposit tx hash: `)).trim();
    } finally { rl.close(); }
  }
  if (!txHash) throw new Error('No mainnet deposit transaction hash supplied');
  await OneClickService.submitDepositTx({ depositAddress, txHash });
  console.log(`1Click deposit tx: https://nearblocks.io/txns/${txHash}`);
  for (let attempt = 0; attempt < 60; attempt++) {
    const status = await OneClickService.getExecutionStatus(depositAddress);
    console.log(`1Click status: ${status.status}`);
    if (status.status === 'SUCCESS') return;
    if (status.status === 'REFUNDED' || status.status === 'FAILED') throw new Error(`1Click terminal status ${status.status}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('1Click status timed out; check deposit address manually');
}
