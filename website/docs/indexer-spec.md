# Indexer Specification

## Abstract
This document specifies the responsibilities, data extraction rules, and consensus expectations for Bittery indexers. Indexers observe Bitcoin blocks, detect BII inscriptions and BTRY OP_RETURN payloads, and produce deterministic candidate bet sets for consumption by the ICP final judge.

## Motivation
Independent indexers provide redundancy and transparency by reproducing the same candidate bet set from public chain data. A consistent extraction and consensus process mitigates the risk of adversarial or faulty indexers influencing the round outcome.

## Specification
### Block Scanning
- Indexers MUST track the best-known Bitcoin chain with standard reorg handling.
- For every new block, indexers parse all transactions to detect:
  - **BII inscriptions**: Ordinals inscriptions with JSON matching the BII specification.
  - **BTRY OP_RETURN** outputs: Scripts beginning with `OP_RETURN` followed by CBOR map.

### BTRY Extraction Rules
- Only one OP_RETURN output per transaction is considered. Transactions with multiple OP_RETURNs SHOULD mark the bet as invalid.
- The payload MUST decode to a CBOR map following the BTRY specification.
- For Bet (`op=1`) operations:
  - Identify the output paying `prize_pool_address` from the referenced BII.
  - Record `txid`, `vout`, `amount`, `block_height`, decoded payload fields, and raw CBOR hex.
- For Init (`op=0`) and Terminate (`op=2`), record the announcement for audit but do not treat it as a bet.

### Applying BII Constraints
Indexers MUST bind each Bet payload to a BII by matching `r` to `round_id` and checking:
1. `block_height` within `[start_block, end_block]`.
2. Output value to `prize_pool_address` within `[min_bet_sats, max_bet_sats]`.
3. Cumulative tickets do not exceed `max_tickets`.
4. One-to-one correspondence between `amt` and the value sent to the prize pool output.
5. Deduplicate by `(g, r)` to avoid replayed transactions.

### Multi-Indexer Consensus
- Indexers produce a Merkle root over the ordered candidate bet list for a round. Ordering is by `(block_height, txid, vout)`.
- Consensus is achieved when at least 2/3 of indexers (by configured quorum) publish identical roots for the same round and chain tip (identified by `end_block_hash`).
- Divergent roots must trigger re-sync and diffing; ICP final judge SHOULD require a supermajority root before accepting the candidate set.

### API Exposure
Indexers MUST expose HTTP endpoints for reproducibility:
- `/round/<round_id>/bets.json`: Returns the ordered candidate bet list with fields:
  - `round_id`
  - `block_height`
  - `txid`
  - `vout`
  - `amount`
  - `cbor_hex`
  - `decoded` (JSON map of BTRY payload)
  - `ticket_count`
  - `merkle_proof` (optional) proving inclusion in the indexer’s Merkle root
- `/round/<round_id>/root.json`: Returns `{ "round_id", "merkle_root", "end_block_hash", "indexer_id", "timestamp" }`.

### Expected Fields
Each bet entry in `bets.json` MUST include:
- `txid` (hex string)
- `vout` (integer)
- `amount` (integer, satoshis)
- `block_height` (integer)
- `round_id` (string)
- `op` (integer)
- `amt` (integer)
- `tid` (integer, default 1)
- `g` (hex string if present)
- `nums` (array of integers if present)
- `cbor_hex` (hex string)

## Data Structures
- `CandidateBet`: {txid, vout, amount, block_height, payload, ticket_count}
- `IndexerMerkleTree`: Merkle tree over `CandidateBet` serialization for consensus.

## Validation
Indexers MUST:
1. Validate BII integrity and cache `round_id` to `prize_pool_address` mappings.
2. Enforce BTRY decoding and discard malformed payloads.
3. Apply BII constraints during candidate generation.
4. Recompute Merkle roots after reorgs affecting the bet set.

## Rationale
Standardizing indexer behavior ensures that the ICP final judge can rely on independently derived candidate sets rather than a single source of truth. Merkle-root consensus offers a lightweight agreement mechanism without introducing new trust assumptions.

## Security Considerations
- **Adversarial indexers**: Supermajority roots mitigate single-indexer corruption.
- **Reorgs**: Candidate sets must be recomputed on chain reorganization to avoid stale data.
- **Payload abuse**: Strict CBOR parsing and OP_RETURN limits reduce resource strain from malformed transactions.
