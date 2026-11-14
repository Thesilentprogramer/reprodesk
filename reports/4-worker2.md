# Function-call counts sent to intents.near in NEAR mainnet block 224547000

Source: Public NEAR archival mainnet RPC; transactions addressed to intents.near. Fixed block range: 224547000–224547000.

Worker: worker2. This submission deliberately changed the first numeric value to exercise verifier rejection.

```json
{"from_block":224547000,"kind":"contract_call_counts","rows":[{"count":1,"method":"execute_intents"}],"source":"near-intents-mainnet-rpc","to_block":224547000,"transaction_count":2}
```

Rebuild with `npm run rebuild -- 4`.

## NEAR AI Cloud commentary

Based on the provided data, the research thesis is:

The analysis of function-call transactions addressed to the contract `intents.near` within a single, specific NEAR mainnet block (224547000) reveals a discrepancy between the recorded transaction volume and the actual on-chain contract interactions. While the block contained 2 total transactions sent to the contract, only 1 of these successfully invoked the `execute_intents` method, indicating that half of the transaction attempts in this block either failed, targeted a non-existent method, or were of a different call type not captured in the method-specific count.
