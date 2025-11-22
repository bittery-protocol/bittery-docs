# VRF & Entropy Specification

## Abstract
This document specifies the entropy sources and verifiable random function (VRF) procedures used to select winners in Bittery rounds. The process is deterministic, reproducible, and anchored to Bitcoin block data to prevent bias.

## Motivation
Bitcoin does not provide native randomness. Bittery requires a transparent and replayable mechanism so that any party can derive the same random output from public inputs. Combining Bitcoin block hashes with a VRF ensures unpredictability before `end_block` and verifiability afterward.

## Specification
### Entropy Sources
- **Block Hash Seed**: The Bitcoin block hash at height `end_block` after `k_confirm` confirmations. In the event of a reorg, the new confirmed hash replaces the seed.
- **raw_rand()**: Optional deterministic randomness provided by the execution environment (e.g., ICP’s raw randomness) for additional entropy. Must be recorded for reproduction.
- **Commit–reveal (optional)**: If configured, participants may include commitments in bets; reveals occurring before DRAWING are concatenated into the entropy transcript. Validators MUST ignore reveals after DRAWING begins.

### VRF Input Construction
The VRF message `M` is constructed as:
```
M = concat(
  "Bittery-VRF",                // domain separator
  round_id,                      // bytes
  end_block_height (uint64 BE),
  end_block_hash (32 bytes),
  k_confirm (uint8),
  raw_rand() output if present,
  commit_reveal_transcript if present
)
```

### VRF Output
- The VRF is executed with a round-specific VRF key pair controlled by the ICP canister.
- The output is a 64-bit integer `R64` derived from the VRF hash output by taking the first 8 bytes as big-endian.
- The VRF proof MUST accompany `R64` and be verifiable against the public VRF key.

### Winner Mapping
Given `n` eligible tickets (expanded from `tid` counts), winners are selected by deterministic modular mapping:
```
for i in 0..(winners_needed-1):
  index_i = (R64 + i * c) mod n
```
Where `c` is a large odd constant (e.g., 0x9e3779b97f4a7c15) to ensure full-period cycling. Duplicate indices must be skipped to preserve unique winners; increment `i` until required winners are selected.

### Visualization Mapping (Powerball-style)
For user-facing visualization, `R64` can be expanded to five white balls and one red ball:
```
white1 = (R64 >> 0)  mod 69
white2 = (R64 >> 8)  mod 69
white3 = (R64 >> 16) mod 69
white4 = (R64 >> 24) mod 69
white5 = (R64 >> 32) mod 69
red    = (R64 >> 40) mod 26
```
This mapping is non-authoritative for payouts but provides a reproducible representation.

## Data Structures
- `VRFInput`: `{round_id, end_block_height, end_block_hash, k_confirm, raw_rand_opt, commit_reveal_transcript}`
- `VRFOutput`: `{R64, proof}`

## Validation
1. Verify the VRF proof against the public key and message `M`.
2. Ensure `end_block_hash` corresponds to the chain view with `k_confirm` confirmations after `end_block`.
3. Confirm `raw_rand()` and commit–reveal components (if used) are logged and identical across verifiers.
4. Confirm winner indices map to the frozen eligible ticket list without duplication.

## Rationale
Using the confirmed `end_block_hash` anchors randomness to Bitcoin while the VRF proof guarantees publicly verifiable derivation. The modular stepping approach yields uniform selection across ticket space without bias.

## Security Considerations
- **Bias resistance**: Waiting for confirmations reduces miner influence over `end_block_hash`. VRF proof prevents manipulation by the execution environment.
- **Reorg handling**: Recomputing with the new confirmed hash ensures consistency after chain reorganizations.
- **Transcript integrity**: All entropy inputs must be recorded to allow third parties to reproduce `R64`.
