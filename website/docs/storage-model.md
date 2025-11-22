# Storage Model

## Abstract
This document describes how Bittery protocol data is stored across Bitcoin, indexers, and the ICP execution environment. It specifies what artifacts are persisted, how they can be reconstructed, and how auditors can verify state.

## Motivation
Decentralized protocols rely on multiple storage layers. Defining the storage model ensures that data availability issues or component failures do not compromise verifiability or recovery.

## Specification
### Bitcoin Layer
- Stores bet transactions funding `prize_pool_address`.
- Stores BTRY OP_RETURN payloads within those transactions.
- Stores BII as Ordinals inscriptions (immutable JSON).
- Stores payout transactions signed via TSS, including rollover outputs.

### Indexer Layer
- Maintains a local copy of Bitcoin blocks and mempool (optional).
- Caches parsed BII documents and verified `metadata_hash` values.
- Stores candidate bet lists with CBOR hex, along with Merkle trees for consensus.
- Exposes serialized artifacts via HTTP endpoints (`bets.json`, `root.json`).

### ICP Execution Layer
- Persists:
  - `VerifiedBets`: the frozen set of eligible bets at DRAWING time.
  - `RoundState`: state machine status, block references, and confirmation depth.
  - `VRFOutput`: `R64` and proof for each round.
  - `PayoutRecord`: payout transaction hex, `txid`, and settlement status.
  - `AuditLog`: hashes of inputs/outputs for traceability.

## Reconstruction Rules
- From Bitcoin alone: any party can reconstruct bet transactions and BTRY payloads, verify payouts, and fetch the BII inscription via Ordinals indexers.
- From indexer data: using `bets.json` and `root.json`, a verifier can rebuild the candidate set and compare Merkle proofs against the published root.
- From ICP state: auditors can recompute VRF inputs and outputs, reconstruct payout amounts, and confirm they match on-chain transactions.
- In the event of indexer loss, ICP state combined with Bitcoin data is sufficient to regenerate Merkle trees; conversely, if ICP state is lost, Bitcoin + indexer data can rebuild round context except private randomness components, which must be logged.

## Audit Paths
1. **Bet path**: `BII` → Bitcoin bet tx → BTRY payload → indexer candidate entry → ICP validated bet.
2. **Randomness path**: `end_block_hash` + `raw_rand()` + optional commits → VRF proof → `R64` → winner indices.
3. **Payout path**: validated bets → payout plan → TSS-signed transaction → Bitcoin settlement → ICP `PayoutRecord`.

## Rationale
Distributing storage ensures no single component is critical for long-term verifiability. Explicit reconstruction paths allow independent auditors to reproduce every round outcome using public data and minimal ICP metadata.

## Security Considerations
- **Data availability**: Reliance on Bitcoin for canonical data ensures recoverability even if indexers fail.
- **Integrity**: `metadata_hash`, Merkle roots, and VRF proofs bind data to immutable hashes.
- **Privacy**: All stored data is public and non-sensitive; no private keys are written to persistent storage.
