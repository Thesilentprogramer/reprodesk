# ReproDesk progress

- 2026-11-14 22:45 IST: Inspected existing escrow, signing, and test setup; confirmed archival mainnet RPC responds for historical block 130000000.
- 2026-11-14 22:47 IST: Implemented ReproDesk contract jobs, submissions, verifier hash comparison, payout/refund, views, events, and unit tests.
- 2026-11-14 22:49 IST: Added canonical historical mainnet RPC queries and rebuild CLI; configured new testnet contract account.
- 2026-11-14 22:52 IST: Contract unit tests (3) and TypeScript typecheck pass; added RPC-only static dashboard. Live build and deployment underway.
- 2026-11-14 22:56 IST: Created testnet agent and contract accounts; deployed and initialized ReproDesk. Deployment required a 4.2 testNEAR storage top-up, and posting required a 0.5 testNEAR requester top-up. Corrected fresh setup funding levels.
- 2026-11-14 23:01 IST: Live job 0 posted; worker2 tampered submission rejected, worker1 accurate submission paid. Live job 1 posted and worker1 paid. Switched historical reads to FastNEAR archival after old NEAR archival endpoint returned a deprecation error. Generated keys moved to gitignored .env and credential file copies removed. Transaction ledger saved in DEMO.md.
- 2026-11-14 23:02 IST: `npm run rebuild -- 0` reproduced the exact paid result hash; final `npm run typecheck` and three contract tests passed. Recorded optional NEAR AI Cloud HTTP 401 fallback and omitted adapters in BLOCKERS.md.
