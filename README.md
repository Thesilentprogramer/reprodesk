# ProofBounty

ProofBounty is a five-agent task market on NEAR testnet. A requester treasury escrows testNEAR; two workers bid; a coordinator selects the cheapest bid; a reviewer checks a public JSON fact; and the contract pays the winner or refunds the treasury. Transactions, rather than a local simulation, are the demo state machine.

## Architecture

| Role | Own testnet account | On-chain action |
| --- | --- | --- |
| Requester treasury | `requester.<parent>.testnet` | `post_task` with 0.3 testNEAR escrow |
| Worker 1 | `worker1.<parent>.testnet` | bid 0.2 and submit SHA-256 result hash |
| Worker 2 | `worker2.<parent>.testnet` | bid 0.25 and independently reason about source |
| Reviewer | `reviewer.<parent>.testnet` | deterministic source check plus NEAR AI Cloud verdict, then `review` |
| Coordinator | `coordinator.<parent>.testnet` | select lowest bid; use `@nearai/near-mcp` to sign `settle` |

The Rust contract stores the task, bids, selected worker, result hash, review evidence hash, verdict and settlement flag. Successful settlement sends the bid amount to the worker and unused escrow to the requester. Rejection returns escrow to the requester. A second settlement fails. The contract pays with **testNEAR**, not NEAR Intents.

NEAR AI Cloud handles independent worker extraction and reviewer judgment through its [OpenAI-compatible chat endpoint](https://docs.near.ai/api-reference/chat/create-chat-completion). The reviewer also compares exact strings to the fetched JSON value, so a model's mistaken acceptance cannot release the bounty. If inference fails, the demo throws; it never fabricates a worker result.

## Setup

Prerequisites: Node 20+, Rust with `wasm32-unknown-unknown`, a funded testnet parent account with at least roughly 7 testNEAR, and a NEAR AI Cloud API key. Keep all secret values in `.env` or `~/.near-credentials`; `.env.example` is the only environment file intended for Git.

```sh
cp .env.example .env
# Fill NEAR_TESTNET_PARENT_ACCOUNT, NEAR_TESTNET_PARENT_PRIVATE_KEY, NEAR_AI_API_KEY.
npm install
rustup target add wasm32-unknown-unknown
npm run build:contract
npm run setup
npm run deploy
npm run demo
```

`npm run setup` creates `contract`, `requester`, `worker1`, `worker2`, `reviewer`, and `coordinator` subaccounts under the parent. It saves private keys with mode 0600 in `~/.near-credentials/proofbounty`. Workers, reviewer and coordinator receive function-call access keys restricted to this contract and their own methods. The requester signs its deposit-bearing call with its full key because NEAR function-call keys cannot attach a deposit. `npm run deploy` deploys the WASM to the contract subaccount and initializes it. Rerunning setup reuses existing keys/accounts. `npm run demo` prints a testnet explorer link for each transaction and checks final on-chain state. The NEAR MCP server signs the settlement transaction with the coordinator account.

Run `npm run typecheck` and `cargo test --manifest-path contract/Cargo.toml` for local checks. For a machine without Rust in `PATH`, use a Rust installation in a custom `RUSTUP_HOME` and `CARGO_HOME`.

## External integrations

- **Agent Market:** The official [market SDK](https://github.com/nearai/agents-market-sdk/blob/main/packages/market/README.md) supports service discovery and job creation. `src/market.ts` calls both when `POST_TO_AGENT_MARKET=true` and `NEAR_MARKET_API_KEY` is set. This creates a separate USDC marketplace job and is disabled by default; its payment is not the testnet escrow.
- **NEAR Intents 1Click:** `src/intents.ts` uses the [1Click SDK](https://github.com/defuse-protocol/one-click-sdk-typescript) only when `ENABLE_MAINNET_INTENTS=true`. It requests a live quote, prompts for an operator-executed mainnet deposit transaction hash (or reads `ONE_CLICK_DEPOSIT_TX_HASH`), submits it, and polls until `SUCCESS`, `REFUNDED`, or `FAILED`. It does not sign a mainnet deposit itself. This optional leg is separate from testnet settlement. Do not enable it without reviewing the asset, amount, refund and recipient.
- **NEAR MCP:** The [official server](https://github.com/nearai/near-mcp) imports the coordinator key from the local credential file and signs the real contract `settle` call. The demo discovers required MCP tools at runtime and fails if unavailable.

## Track fit

| Track | Implemented evidence |
| --- | --- |
| AI Swarms | Five accounts coordinate on-chain bidding, selection, review and payout. |
| Agent Economy | Workers compete for a priced job; optional real Agent Market publishing/discovery hook. |
| Autonomous Business | Requester treasury posts a narrow task, escrows its budget and receives unused funds or a refund. |

The current public source is `https://jsonplaceholder.typicode.com/todos/1`, field `title`. Override `SOURCE_URL` and `SOURCE_FIELD` for another JSON object with a scalar field. Worker output and review evidence are hashed on-chain; the CLI prints the full worker outputs locally. A trusted reviewer remains a limit of this design; hashes prove what was committed, not independent model execution.

See [BLOCKERS.md](BLOCKERS.md) for required external credentials and [PROGRESS.md](PROGRESS.md) for verified status.
