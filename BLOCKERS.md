# ReproDesk blockers and limitations

The core live demo is complete: both testnet bounties paid after hash matches, and one tampered submission was rejected.

- The Intents Explorer transactions API requires a partner JWT, which is unavailable. Job 4 instead reads transactions addressed to `intents.near` from public mainnet archival RPC. This measures contract calls in a fixed block, not Explorer swap status or cross-chain settlement. The optional BigQuery adapter remains unimplemented.
- NEAR AI Cloud commentary is included in the new worker reports for jobs 2–4. Data result hashes and verification do not depend on AI prose.
- The verifier is independent at the account and query execution level, but the contract trusts that registered verifier to fetch mainnet data honestly. Reports have on-chain SHA-256 hashes and local Markdown files; they are not pinned to IPFS.
