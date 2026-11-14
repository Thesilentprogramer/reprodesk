# Corrected action type counts in NEAR mainnet blocks 130000000–130000001, AI Cloud report

Source: NEAR archival mainnet RPC. Fixed block range: 130000000–130000001.

Worker: worker1. The figures below come from the canonical query result.

```json
{"from_block":130000000,"kind":"action_counts","rows":[{"action":"AddKey","count":15},{"action":"CreateAccount","count":15},{"action":"Delegate","count":90},{"action":"FunctionCall","count":44},{"action":"Transfer","count":21}],"source":"near-mainnet-archival-rpc","to_block":130000001,"transaction_count":148}
```

Rebuild with `npm run rebuild -- 5`.

## NEAR AI Cloud commentary

Based on the provided data from NEAR archival mainnet RPC for blocks 130000000–130000001, the research thesis is: The distribution of on-chain actions within this specific two-block range reveals that Delegate actions were the most frequent, accounting for 48.6% of the 185 total actions, while FunctionCall and Transfer actions represented 23.8% and 11.4% respectively, indicating a period of concentrated governance or staking activity over general transactions and smart contract interactions.
