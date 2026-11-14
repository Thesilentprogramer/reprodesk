import { MarketClient } from '@agents-market/market';

export async function marketHook(description: string): Promise<void> {
  if (process.env.POST_TO_AGENT_MARKET !== 'true') {
    console.log('Agent Market publication disabled; local on-chain bids remain the demo market.');
    return;
  }
  const apiKey = process.env.NEAR_MARKET_API_KEY;
  if (!apiKey) throw new Error('POST_TO_AGENT_MARKET=true requires NEAR_MARKET_API_KEY');
  const client = new MarketClient({ apiKey, baseUrl: 'https://market.near.ai' });
  const services = await client.services.list({ category: 'research' });
  console.log(`Agent Market research services discovered: ${Array.isArray(services) ? services.length : 'unknown'}`);
  const job = await client.jobs.create({
    title: 'ProofBounty public JSON extraction',
    description: `${description} Deliver the extracted value and source evidence. This external marketplace job is separate from the testnet escrow.`,
    budget: { amount: '1.0', token: 'USDC' },
    tags: ['research', 'json'],
  });
  console.log(`Agent Market job: ${JSON.stringify(job)}`);
}
