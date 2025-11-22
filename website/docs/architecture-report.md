# Bittery Protocol Architecture (Field Report)

This page distills the latest architecture report used by the core team to brief integrators. It complements the concise `protocol-overview` doc with more narrative and operational notes.

## Layered Stack at a Glance
- **Bitcoin L1**: UTXO settlement for wagers, OP_RETURN metadata, payouts. Prize pool UTXO is TSS‑controlled.
- **Ordinals L2**: Hosts Bittery Issuance Inscription (BII) JSON and optional ticket NFTs.
- **Off-chain indexer**: Scans Bitcoin, decodes BTRY OP_RETURN payloads, enforces BII windows, builds candidate bet sets and Merkle roots.
- **ICP canister (final judge)**: Validates bets, executes VRF, selects winners, triggers TSS Bitcoin payouts.

```
L3: ICP (state machine, VRF, TSS payouts)
   ^  HTTP outcalls
   v
Off-chain indexer (scan + Merkle roots)
   ^
   v
L2: Ordinals metadata (BII, tickets)
   ^
   v
L1: Bitcoin (wagers, payouts, OP_RETURN)
```

## Bittery Issuance Inscription (BII)
- Publishes round rules on Ordinals before betting opens.
- Key fields: `round_id`, `prize_pool_address`, `tss_pubkey`, `min_bet_sats/max_bet_sats`, `min_tickets/max_tickets`, `start_block/end_block`, `payout_policy`, `rollover`, `metadata_hash`.
- Validation boundary: ICP re-checks protocol/version, address, block window, payout policy, and metadata hash against the BII payload observed on Ordinals.

## BTRY OP_RETURN Payloads (CBOR)
- Actions: **Init**, **Bet**, **Term**.
- Common keys: `v` (version), `g` (game id), `r` (round id), `op` (action).
- Bet payload adds `amt` and optional encoded `nums` per game rules.
- Term payload signals shutdown; payout handling follows the policy committed in Init (carry/refund/treasury), not overrideable by Term.

## Round Lifecycle (summary)
`OPEN → CLOSED → DRAWING → FINISHED` (see `round-lifecycle` for details). ICP waits `k_confirm` after `end_block`, ingests indexer roots, runs VRF, and signs payouts via TSS.

## Indexer ↔ ICP Flow (high level)
1. Indexers scan each Bitcoin block, derive per-round Merkle roots over candidate bets.
2. Roots and counts are posted to an indexer-canister; the main canister gathers ≥2/3 matching roots across indexers.
3. After `k_confirm` on the source blocks, accepted roots become `VerifiedBets` and the round advances to DRAWING → payout.
4. Reorg detection rolls back affected heights and re-requests roots.

## Security Posture
- **Bitcoin immutability** anchors wagers, payouts, and OP_RETURN.
- **Ordinals** fix round metadata and optional ticket NFTs.
- **ICP + TSS** ensure deterministic draw logic and exclusive control of prize funds.
- Indexers are untrusted; consensus on Merkle roots plus multi-source rechecks mitigates corruption.

## Operational Tips
- Monitor indexer scan progress, ingest success rate, VRF latency, and TSS signing time.
- Use ≥6 confirmations on `end_block` to reduce reorg exposure.
- Keep audit logs of `(block_height, block_hash)` for every verified bet; re-validate on reorg.
- For deployments, practice full round simulations (dfx + mock indexer) before mainnet.
