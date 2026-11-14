# Blockers to a deployed, end-to-end demo

1. **Testnet account and funds:** No testnet credential was present in `.env` or `~/.near-credentials`. Supply `NEAR_TESTNET_PARENT_ACCOUNT` and its matching `NEAR_TESTNET_PARENT_PRIVATE_KEY` in `.env`; fund the parent with about 7 testNEAR for six subaccounts, contract storage, gas and the bounty. The setup script can create child accounts but cannot create/fund the parent from nothing.
2. **NEAR AI Cloud key:** Supply `NEAR_AI_API_KEY` in `.env` with permission and credits for `https://cloud-api.near.ai/v1/chat/completions`. Set `NEAR_AI_MODEL` to an available model if the example model is unavailable. Worker and reviewer calls deliberately fail without this key.
3. **Git commits:** The environment permits source-file writes but denies `.git/index.lock`, so no commit can be created here. After Git write access is restored, commit the contract, agent runtime, then documentation as separate steps. No GitHub repo or push was attempted.

Optional features need separate credentials: `NEAR_MARKET_API_KEY` plus `POST_TO_AGENT_MARKET=true` to create a real USDC marketplace job; `ONE_CLICK_JWT` and a **user-executed** mainnet deposit transaction hash plus quote parameters to run the 1Click leg. Neither is needed for the testnet demo. No mainnet funds were spent.
