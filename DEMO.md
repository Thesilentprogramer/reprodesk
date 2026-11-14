# ReproDesk live testnet demo

Contract: [`reprodesk.proofbounty-38909.testnet`](https://testnet.nearblocks.io/address/reprodesk.proofbounty-38909.testnet)

Deployment: [contract WASM](https://testnet.nearblocks.io/txns/Haz5keEM8LkJb1CMhpsbfhctnicQrzx5eqCspDK9Mduu) · [initialization](https://testnet.nearblocks.io/txns/CJX1XtPN495T1BeLrY9edPMNjAPTg9EAquXveuPpKoRj). The contract account also received a [testNEAR storage top-up](https://testnet.nearblocks.io/txns/4zfMxYV2CzwCHivcue97fFnkYmTT2fgcuf8CGoVs2fht).

## Job 0: top five receiver accounts, mainnet blocks 130000000–130000001

Canonical result SHA-256: `293663fab8c54ddaa7ccebceb7b0b893b065cd25fda5a10be5915ecb57c1b347`.

- [Poster funded 0.2 testNEAR](https://testnet.nearblocks.io/txns/7WQuAyQaRh7TkP2toZiBdyXgH9d95vfe1J5tqx1G6c8v)
- [Worker2 submitted a deliberately changed count](https://testnet.nearblocks.io/txns/2KZPSwoeRZpxpThyJBB2cqUqHjT1ByWM5ipaCAt11JTi)
- [Verifier rejected worker2 after rerunning the query](https://testnet.nearblocks.io/txns/Dyr251VoNtgNF5gH5KHCcmGhEswyp9hBvgXstBvYGmkP)
- [Worker1 submitted the reproducible result](https://testnet.nearblocks.io/txns/EQvnXELYVRp6pAi82sHjjhGbVjUVPCQ1JARfxVSxQzJ2)
- [Verifier accepted and paid worker1](https://testnet.nearblocks.io/txns/AG1PpHGKYW3wRTACqMRvwJx2c2xEZzDQxxUE3jHPunDc)

## Job 1: action type counts, same mainnet blocks

Canonical result SHA-256: `845499a36afb688dfcffa6d90c6e7494e409f409fd8b586ff089a4e2d1fff0fb`.

- [Poster funded 0.2 testNEAR](https://testnet.nearblocks.io/txns/e3oAKyAvToB9EXXZywyfw7oo8icyQZb3eAkHSJ5HxCD)
- [Worker1 submitted](https://testnet.nearblocks.io/txns/58xvziokKedxzUD7JPpqsE4MyNR4j7MT8ehxWRogLXEE)
- [Verifier accepted and paid worker1](https://testnet.nearblocks.io/txns/76Upcfrunc8sk9PgMBaY9t5gawPuK6gqAdVU9u5YDfH3)

Rebuild locally: `npm run rebuild -- 0` or `npm run rebuild -- 1`. Dashboard: `web/index.html`.

## Follow-up: NEAR AI Cloud reports and Intents data

The requester received a [0.6 testNEAR top-up](https://testnet.nearblocks.io/txns/Fzha6pHRjqZQ7J5nNdWBYi4jpoLSiMPLsYpLq4wA7Qgx). Jobs 2–4 are new claims so their on-chain report hashes cover the actual NEAR AI Cloud commentary. The earlier paid jobs and report hashes remain intact.

### Job 2: top receiver accounts with AI commentary

Canonical result SHA-256: `293663fab8c54ddaa7ccebceb7b0b893b065cd25fda5a10be5915ecb57c1b347`.

- [Poster funded 0.2 testNEAR](https://testnet.nearblocks.io/txns/8mVmGNuzf2P8ASoDHzP1wQGnv8JoQwSp79Uy2dbLU9vG)
- [Worker2 submitted a changed result](https://testnet.nearblocks.io/txns/2Ey4zoBHs4tvcZxjWMXToFdyehdAGM8a6r8X6AE88cK7); [verifier rejected it](https://testnet.nearblocks.io/txns/6GXfuQaMjT15St6EEaUaTVMgjrDSEsuumpQnHfanMWwk)
- [Worker1 submitted the reproducible result](https://testnet.nearblocks.io/txns/EDpFkR2Uw5b53ZQ3DbyFMQ4iifHVK6e1LvaBvrCeY27a); [verifier accepted and paid](https://testnet.nearblocks.io/txns/H3czJD1KW5auiH9Yex1oA1zo7oX5ckNBwR3GzoCoTx7f)
- Reports: [accurate worker](reports/2-worker1.md), [changed submission](reports/2-worker2.md)

### Job 3: action type counts with AI commentary

Canonical result SHA-256: `845499a36afb688dfcffa6d90c6e7494e409f409fd8b586ff089a4e2d1fff0fb`.

- [Poster funded 0.2 testNEAR](https://testnet.nearblocks.io/txns/znatE2b2kgKZtwgHYCfF9YeKJWjUH5qUuc9BtoLwkPC)
- [Worker1 submitted](https://testnet.nearblocks.io/txns/6BFYsjm8gXTs3U2ngRcmzXJALF6sjBXxEqtZyXmKyq8B); [verifier accepted and paid](https://testnet.nearblocks.io/txns/6PXguJXQZEyPWS4PS8tmkGmBBpwaSakzr3icq72rWpa9)
- Report: [accurate worker](reports/3-worker1.md)

### Job 4: calls to `intents.near` in mainnet block 224547000

The read-only archival RPC query found one transaction addressed to `intents.near`, with one `execute_intents` function call. Canonical result SHA-256: `f2e0ec47ff4c240d07fbb79c1df1321fdd0d43b498bb260f1b403b5a143d4490`.

- [Poster funded 0.2 testNEAR](https://testnet.nearblocks.io/txns/4WA5sWA7CbrgrxJuXSFk8tYQPab3VtdNdiEzpJcJT39E)
- [Worker2 submitted a changed result](https://testnet.nearblocks.io/txns/EQHCXctNHSMHwd5c4bBrPP3MMVmrqkQU519whZB2CDyo); [verifier rejected it](https://testnet.nearblocks.io/txns/HADyAd33xEfBrGRdZuH9weznAJkhWS1zv3JSsDLEBsHq)
- [Worker1 submitted the reproducible result](https://testnet.nearblocks.io/txns/EYjHhdz5eaa2sEYBvbgZ3PaoHZyhCzkvKwgWughCLTMV); [verifier accepted and paid](https://testnet.nearblocks.io/txns/ctimpuvpnZcu8HX6HErjcBQ3xpdF1X6cgy1x3rPikCd)
- Reports: [accurate worker](reports/4-worker1.md), [changed submission](reports/4-worker2.md). Rebuild with `npm run rebuild -- 4`.

All five new report files contain NEAR AI Cloud commentary; each file's SHA-256 matches its submission's on-chain report hash. AI text is excluded from the deterministic result hashes above.
