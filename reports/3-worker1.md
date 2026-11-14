# Action type counts in NEAR mainnet blocks 130000000–130000001, AI Cloud report

Source: NEAR archival mainnet RPC. Fixed block range: 130000000–130000001.

Worker: worker1. The figures below come from the canonical query result.

```json
{"from_block":130000000,"kind":"action_counts","rows":[{"action":"0","count":15},{"action":"AddKey","count":15},{"action":"Delegate","count":90},{"action":"FunctionCall","count":44},{"action":"Transfer","count":21}],"source":"near-mainnet-archival-rpc","to_block":130000001,"transaction_count":148}
```

Rebuild with `npm run rebuild -- 3`.

## NEAR AI Cloud commentary

Based on the provided data from NEAR mainnet blocks 130000000–130000001, the research thesis is: **Delegation actions were the most frequent, accounting for 48.6% of all actions, which indicates a high level of staking-related activity during this specific two-block interval, while standard transfers and function calls represented a smaller proportion of network operations.**
