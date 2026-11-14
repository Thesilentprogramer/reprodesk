# Action type counts in NEAR mainnet blocks 130000000–130000001

Source: NEAR archival mainnet RPC. Fixed block range: 130000000–130000001.

Worker: worker1. The figures below come from the canonical query result.

```json
{"from_block":130000000,"kind":"action_counts","rows":[{"action":"0","count":15},{"action":"AddKey","count":15},{"action":"Delegate","count":90},{"action":"FunctionCall","count":44},{"action":"Transfer","count":21}],"source":"near-mainnet-archival-rpc","to_block":130000001,"transaction_count":148}
```

Rebuild with `npm run rebuild -- 1`.

## Write-up mode

Deterministic template; NEAR AI Cloud request failed: Error: HTTP 401.
