# Validation Rules

## Abstract
This document defines the deterministic validation logic executed by the ICP final judge when processing Bittery rounds. The rules ensure that every accepted bet and payout is reproducible from on-chain data and the published BII.

## Motivation
Clear validation rules prevent ambiguity between indexer outputs and final execution. By detailing each constraint, independent implementations can achieve identical results while detecting malformed or adversarial inputs.

## Specification
Validation operates on the candidate bet set produced by indexers and verified against Bitcoin full-node data. All checks are deterministic and must be applied in the order described.

### Bet Validation
1. **UTXO verification**: Confirm the referenced transaction exists on the active chain with at least `k_confirm` confirmations at DRAWING time. Validate output value and script type.
2. **Prize address match**: Ensure the transaction pays `prize_pool_address` exactly as specified in the BII.
3. **Amount bounds**: The output amount must satisfy `min_bet_sats ≤ amount ≤ max_bet_sats` and match the `amt` declared in the BTRY payload.
4. **Round window**: The block height containing the transaction must be within `[start_block, end_block]`.
5. **Round identifier**: `payload.r` must equal `BII.round_id`.
6. **Ticket count**: `tid` defaults to 1 if absent. Reject if `tid < 1` or cumulative tickets exceed `max_tickets`.
7. **Replay protection**: Reject bets with duplicate `(g, r)` tuples or duplicate `(txid, vout)` references.
8. **OP_RETURN uniqueness**: Reject transactions containing multiple OP_RETURN outputs or non-canonical BTRY encodings.
9. **Malformed payloads**: Reject if CBOR decoding fails, required keys are missing, or unsupported `v`/`op` values are present.

### Round Validation
1. **BII integrity**: Recompute `metadata_hash` and enforce version compatibility.
2. **Ticket floor**: If `min_tickets` is not met by the end of CLOSED, mark the round for refund handling as defined in TSS settlement.
3. **Rollover accounting**: Track residual funds designated for rollover; ensure they are excluded from current-round payouts.
4. **VRF input freeze**: At transition to DRAWING, freeze the ordered eligible bet set and the block hash seed set. Any later reorg triggers recomputation and invalidates prior randomness.

### Payout Validation
1. **Winner selection**: Derive winner indices using VRF as defined in the VRF specification. Ensure indices map to the frozen bet list.
2. **Amount distribution**: Compute prize splits using `payout_policy`. Sum of all outputs MUST equal the prize pool minus fees, respecting basis point allocations.
3. **TSS signature verification**: Verify the payout transaction carries valid threshold signatures from the configured TSS key set.
4. **Change handling**: Confirm any change output returns to the designated change address or rollover address specified for the round.
5. **Double-spend check**: Ensure inputs funding the payout transaction are unspent at time of broadcast.

## Data Structures
- `ValidatedBet`: {txid, vout, amount, ticket_count, payload}
- `RoundContext`: {bii, eligible_bets, block_hash_seed, vrf_output}

## Rationale
Applying strict validation at the ICP layer ensures the protocol remains stateless and reproducible. Replay and duplication checks prevent inflation of ticket counts, while block-based constraints tie eligibility to immutable chain history.

## Security Considerations
- **Adversarial payloads**: Strict schema enforcement and OP_RETURN uniqueness mitigate malformed data attacks.
- **Replay and duplication**: Deduplication on both `(g, r)` and `(txid, vout)` prevents replays across forks or mempool rebroadcasts.
- **Reorg resilience**: Freezing inputs at DRAWING and recomputing upon reorg preserves consistency across verifiers.
- **TSS assurance**: Verifying threshold signatures ensures only authorized key shares can spend the prize pool.
