# Indexer → Canister Flow (per Bitcoin block)

This page summarizes the operational flow between off-chain indexers, the indexer-canister, and the main canister. It is derived from the latest engineering runbook.

## Overview
- **Cadence**: On every Bitcoin block, indexers scan BTRY OP_RETURNs and prize outputs, group by `round_id`, and compute Merkle roots.
- **Upload path**: Indexers send a block summary to `indexer-canister`; the main canister pulls/receives these summaries.
- **Multi-game support**: A block can carry multiple rounds/plays; summaries are aggregated per `round_id`.
- **Reorg handling**: Track `(block_height, block_hash)`; if a reorg is detected, rollback affected heights and re-fetch.

## Sequence (per block)
```
[Bitcoin block N]
    |
    v
Index scan
  - Parse BTRY (Init/Bet/Term)
  - Drop invalid entries (amount/window/duplicate ticket)
  - Group by round_id, produce {round_id, root, count, total_amt, block_height, block_hash}
    |
    v
Upload to indexer-canister
  submit_block_summary(height, block_hash, entries[])
    |
    v
Main canister pull/subscribe
  - Collect roots per block/round from multiple indexers
  - ≥2/3 matching roots -> accept; else dispute path with extra data sources
  - Mark pending until K confirmations
    |
    v  (block reaches K confs)
Finalize
  - Write VerifiedBets (round_id -> root/count/height/hash)
  - Update round counters/amounts
    |
    v
Draw/settle once round closed and data sufficient
```

## Key Rules
- **One report per block**: Consolidate all rounds for the block to reduce calls; if sharded, use a block-level nonce when merging.
- **Confirmation delay**: Main canister only accepts after `k_confirm` (recommended 6) to limit reorg risk.
- **Multi-source consensus**: Require N indexers; accept roots when ≥2/3 match. Otherwise trigger dispute checks using multiple Bitcoin data sources.
- **Uniqueness**: Bet key uses `(txid:vout)` or `(g,r)`; duplicates are dropped.
- **Term policy**: Term is only a signal; residual pot follows Init-fixed `po/tr` and cannot be changed by Term.

## API Sketch
- `submit_block_summary(height, block_hash, entries)` where `entries` contain `{round_id, merkle_root, count, total_amt, block_hash}`.
- `get_round_snapshots(round_id, from_height?, to_height?)` for audits.
- `get_block(height)` returns per-round roots aggregated for that height.

## Failure & Reorg Handling
- Detect hash changes for any recorded height; rollback the affected window and request fresh summaries.
- Re-run consensus on the recomputed roots; only proceed when ≥2/3 agree.
- Log incidents for audit; keep full winner lists/VRF transcript/tx construction details in an archive canister with paged queries.
