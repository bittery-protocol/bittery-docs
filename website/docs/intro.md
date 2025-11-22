# Bittery Protocol

Bittery is a Bitcoin-native, verifiable lottery protocol built across three layers:

- **Bitcoin L1** — settlement layer for bets, payouts, OP_RETURN metadata, and prize pool UTXOs.
- **Ordinals L2** — metadata layer for round issuance (Bittery Issuance Inscription, BII) and optional NFT ticket collections.
- **ICP Canister Execution Layer** — deterministic “final judge” that validates bets, executes VRF randomness, selects winners, and performs TSS-based Bitcoin payouts.

Unlike traditional smart contract systems, Bittery is designed specifically for Bitcoin’s constraints by combining structured Bitcoin transactions, Ordinals metadata, an off-chain indexer, and a verifiable execution environment.

This documentation contains:

- The complete Bittery Protocol specification
- BII metadata standard
- BTRY OP_RETURN payload definition
- Indexer consensus rules
- Round lifecycle state machine
- VRF entropy specification
- TSS payout mechanism
- Security model and storage model
- BLIP improvement proposal system
