# Security Model

## Abstract
This document outlines the security assumptions, threat model, and mitigations employed by the Bittery Protocol. It covers the roles of Bitcoin L1, Ordinals inscriptions, off-chain indexers, the ICP final judge, and TSS-based payouts.

## Motivation
A formal security model clarifies what each component must guarantee and how the protocol maintains integrity in the presence of adversarial actors. It ensures implementers align on replay protection, reorg handling, and auditability.

## Specification
### Trust Minimization
- **Bitcoin L1**: Provides immutable transaction ordering and settlement for bets and payouts.
- **Ordinals**: Stores BIIs immutably as inscriptions; integrity enforced via `metadata_hash`.
- **Indexers**: Untrusted but reproducible data sources; cross-validated via Merkle-root consensus.
- **ICP Final Judge**: Deterministic validator that enforces BII rules, performs VRF, and coordinates TSS payouts.
- **TSS Committee**: Holds distributed key shares to authorize spending without single-key custody.

### Threats and Mitigations
- **Replay of bets**: Mitigated by `(g, r)` deduplication and `(txid, vout)` uniqueness checks.
- **Chain reorgs**: Mitigated by `k_confirm` waiting period and recomputation of eligibility and VRF inputs on reorg.
- **Malformed OP_RETURN**: CBOR schema validation rejects malformed payloads; size limits prevent resource exhaustion.
- **Adversarial indexers**: Multi-indexer Merkle-root consensus prevents a single indexer from censoring or injecting bets.
- **Payout tampering**: TSS signatures validated against round public key; output ordering and basis point checks ensure correct distribution.
- **Rollover misuse**: Rollover outputs remain under TSS control and are linked to target round IDs.

### Auditability
- Full reproduction from public data: BII content, Bitcoin transactions, and VRF proofs enable independent recomputation of winners and payouts.
- Indexer APIs expose candidate bets with CBOR hex for inspection.
- ICP stores VRF outputs, payout transactions, and state transitions to provide a verifiable audit trail.

## Data Structures
- `AuditRecord`: `{round_id, bii_hash, candidate_bets_root, vrf_output, payout_txid}`
- `SecurityConfig`: `{k_confirm, max_op_return_size, tss_threshold}`

## Validation
Security-critical validations include:
1. Schema and hash checks on BII and BTRY payloads.
2. Confirmation depth enforcement before randomness and payout execution.
3. TSS signature verification on payouts and rollover spends.
4. Deduplication and window enforcement for bets.

## Rationale
Separating data publication (Bitcoin/Ordinals), observation (indexers), and execution (ICP) limits the trust placed in any single component. Deterministic rules allow any party to verify the protocol’s behavior against on-chain evidence.

## Security Considerations
- **Liveness vs. safety**: Preference is given to safety; delayed VRF or TSS signing halts progress but prevents inconsistent state.
- **Key management**: TSS key shares must be generated and stored securely; compromise of threshold shares endangers funds.
- **Economic attacks**: Fee spikes or dust outputs could reduce payout accuracy; fee estimation and dust handling rules mitigate this.
- **Data availability**: If inscriptions or blocks become temporarily unavailable, cached `metadata_hash` and Merkle proofs allow reconstruction when data is restored.
