# Progress — 13 Nov 2026

## Built

- Rust NEAR escrow contract: task posting with attached deposit; competing bids; cheapest-bid selection; result hash; reviewer verdict; payout/refund and one-time settlement.
- Five-role TypeScript testnet account setup with local 0600 credential storage and scoped function-call keys where deposits do not require a full key.
- NEAR AI Cloud worker/reviewer calls, exact-value acceptance check, real near-api-js signed calls, NEAR MCP settlement call, optional Agent Market and mainnet 1Click adapters.
- One-command `npm run demo` orchestration and explorer links for its on-chain calls.
- `npm run typecheck` passes; three Rust unit tests pass; the release WASM builds (232 KB).
- A live local NEAR MCP server handshake exposes `system_import_account` and `contract_call_raw_function`.

## Transaction hashes

None. No funded testnet parent account or NEAR AI Cloud key was available, so deployment and the real transaction path could not be run. No testnet execution is claimed.

## Incomplete or unverified

- No deployed contract or end-to-end transaction verification yet.
- Agent Market hook is implemented but unrun without an API key; no job was posted.
- Mainnet 1Click quote/deposit status code is implemented but unrun and requires a separately signed deposit. No mainnet spend occurred.
- No dashboard; the CLI is the demo surface.

## Next

Provide the two required credentials in `.env`, run `npm run setup`, `npm run deploy`, then `npm run demo`. Capture every printed testnet hash here and verify the winner balance change. Restore Git write access and make the three small commits. The deadline is 14 Nov 2026 at 23:59 UTC.
