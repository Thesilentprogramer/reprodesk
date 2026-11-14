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
