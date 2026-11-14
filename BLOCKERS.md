# ReproDesk blockers and limitations

The core live demo is complete: both testnet bounties paid after hash matches, and one tampered submission was rejected.

- The configured NEAR AI Cloud key returned HTTP 401. Reports therefore say explicitly that they use the deterministic template. Data hashes and verification do not depend on AI prose.
- The optional BigQuery and Intents Explorer adapters are not implemented. The live demo uses public FastNEAR archival RPC with no API key. No BigQuery or Intents results are claimed.
- The verifier is independent at the account and query execution level, but the contract trusts that registered verifier to fetch mainnet data honestly. Reports have on-chain SHA-256 hashes and local Markdown files; they are not pinned to IPFS.
