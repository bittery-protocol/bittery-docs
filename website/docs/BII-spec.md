# Bittery Issuance Inscription (BII) Specification

## Abstract
This document defines the Bittery Issuance Inscription (BII) format that encodes the deterministic ruleset for a Bittery round. A BII is an Ordinals inscription that provides all parameters required by indexers and execution engines to bind Bitcoin bets to a round and to derive deterministic payout behavior. The format is versioned, reproducible, and designed for long-term archival on Bitcoin.

## Motivation
BII establishes a canonical, on-chain description of each round so that any verifier can reproduce eligibility, timing, payout splits, and rollover rules without trusting an operator. By standardizing the schema and validation requirements, BIIs enable:
- Transparent publication of round parameters.
- Stateless verification by indexers and the ICP final judge.
- Reproducible mapping from Bitcoin transactions to a round.
- Safe evolution through explicit versioning.

## Specification
A BII is a UTF-8 JSON document embedded in an Ordinals inscription. The top-level object MUST comply with the schema below. Unknown fields MUST be ignored for forward compatibility.

### Fields
- `version` (string, required): Semantic version for the BII schema. Supported baseline: `"1.0"`. Major version changes indicate breaking changes.
- `round_id` (string, required): Globally unique identifier for the round, recommended as lowercase hex of a 16-byte value or UUID without hyphens.
- `start_block` (integer, required): Bitcoin block height (inclusive) at which bets become eligible.
- `end_block` (integer, required): Bitcoin block height (inclusive) after which no new bets are accepted. MUST be greater than `start_block`.
- `min_bet_sats` (integer, required): Minimum bet amount in satoshis per entry.
- `max_bet_sats` (integer, required): Maximum bet amount in satoshis per entry.
- `min_tickets` (integer, required): Minimum number of tickets that must be sold for the round to be valid. If unmet, the round is eligible for refund logic defined in TSS settlement.
- `max_tickets` (integer, required): Maximum number of tickets accepted. Bets exceeding the cap are rejected by validators.
- `prize_pool_address` (string, required): Bech32 address generated from the round-specific TSS public key. All eligible bets must pay this address.
- `rollover` (boolean, required): Indicates whether unclaimed or residual funds roll into the next round defined by `rollover_target_round_id`.
- `rollover_target_round_id` (string, optional): Target round identifier when `rollover` is true. If absent while `rollover` is true, the residual is locked until operator intervention.
- `payout_policy` (object, required): Describes how the prize pool is distributed. Fields:
  - `winners` (array, required): Ordered list of winner brackets. Each element includes:
    - `count` (integer, required): Number of winners in this bracket.
    - `share_bps` (integer, required): Share of the prize pool in basis points allocated to this bracket.
  - `treasury_bps` (integer, required): Basis points of the pool allocated to treasury outputs defined below.
  - `issuer_bps` (integer, required): Basis points allocated to the issuer (round creator).
  - The sum of all `share_bps` values plus `treasury_bps` plus `issuer_bps` MUST equal 10,000.
- `treasury_outputs` (array, optional): List of outputs funded from `treasury_bps`. Each element:
  - `address` (string, required): Bitcoin address that receives the treasury allocation.
  - `weight_bps` (integer, required): Basis points of the treasury slice. Sum across elements MUST equal 10,000.
- `metadata_hash` (string, required): Lowercase hex-encoded SHA-256 digest of the exact BII JSON bytes (canonical UTF-8 without BOM). Used for integrity checks by indexers and ICP.
- `notes` (string, optional): Freeform human-readable description.

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Bittery Issuance Inscription",
  "type": "object",
  "required": [
    "version", "round_id", "start_block", "end_block",
    "min_bet_sats", "max_bet_sats", "min_tickets", "max_tickets",
    "prize_pool_address", "rollover", "payout_policy", "metadata_hash"
  ],
  "properties": {
    "version": {"type": "string", "pattern": "^\\d+\\.\\d+$"},
    "round_id": {"type": "string", "minLength": 8, "maxLength": 64},
    "start_block": {"type": "integer", "minimum": 0},
    "end_block": {"type": "integer", "minimum": 1},
    "min_bet_sats": {"type": "integer", "minimum": 1},
    "max_bet_sats": {"type": "integer", "minimum": 1},
    "min_tickets": {"type": "integer", "minimum": 0},
    "max_tickets": {"type": "integer", "minimum": 1},
    "prize_pool_address": {"type": "string"},
    "rollover": {"type": "boolean"},
    "rollover_target_round_id": {"type": "string"},
    "payout_policy": {
      "type": "object",
      "required": ["winners", "treasury_bps", "issuer_bps"],
      "properties": {
        "winners": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["count", "share_bps"],
            "properties": {
              "count": {"type": "integer", "minimum": 1},
              "share_bps": {"type": "integer", "minimum": 0, "maximum": 10000}
            }
          }
        },
        "treasury_bps": {"type": "integer", "minimum": 0, "maximum": 10000},
        "issuer_bps": {"type": "integer", "minimum": 0, "maximum": 10000}
      }
    },
    "treasury_outputs": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["address", "weight_bps"],
        "properties": {
          "address": {"type": "string"},
          "weight_bps": {"type": "integer", "minimum": 0, "maximum": 10000}
        }
      }
    },
    "metadata_hash": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
    "notes": {"type": "string"}
  }
}
```

### Constraints
- `end_block` MUST be greater than or equal to `start_block + 1`.
- `min_bet_sats` MUST be less than or equal to `max_bet_sats`.
- `min_tickets` MUST be less than or equal to `max_tickets`.
- `metadata_hash` MUST match the SHA-256 digest of the canonical JSON payload embedded in the inscription.
- When `rollover` is true, the residual pool after payouts MUST be directed according to `rollover_target_round_id` or remain unspendable until a subsequent BII defines handling.
- `payout_policy.winners` MAY be empty if the round is purely treasury/issuer funded; otherwise, each element’s `count` multiplied by expected tickets MUST not exceed `max_tickets` to avoid over-allocation.

### Versioning
- Major versions (X.0) MAY introduce incompatible fields. Indexers and ICP MUST reject BIIs with unknown major versions unless explicitly configured.
- Minor versions (1.x) MAY add optional fields; unknown optional fields MUST be ignored but preserved in integrity hashing.
- The `version` string MUST be included in `metadata_hash` calculation; changing the version changes the digest.

## Data Structures
- `BII` object: parsed JSON matching the schema.
- `RoundRuleSet`: internal representation containing normalized amounts, block heights, payout splits, and rollover parameters derived from the BII.

## Validation
Validators (indexer and ICP) MUST perform:
1. **Schema validation**: Ensure all required fields exist and types match.
2. **Integrity check**: Recompute SHA-256 over canonical JSON bytes and compare to `metadata_hash`.
3. **Temporal checks**: Ensure `start_block` and `end_block` ordering and reject bets outside the window.
4. **Amount bounds**: Reject bets whose satoshi amount is outside `[min_bet_sats, max_bet_sats]`.
5. **Ticket capacity**: Track total tickets and reject bets exceeding `max_tickets`.
6. **Prize address match**: Bet outputs MUST pay `prize_pool_address`.
7. **Rollover linkage**: If `rollover` is true, confirm `rollover_target_round_id` is present or mark state for locked residual.

## Rationale
Embedding the full ruleset in an Ordinals inscription ensures long-term availability and minimizes reliance on mutable off-chain state. The deterministic schema facilitates independent re-validation of any round. Basis point accounting prevents floating-point errors while enabling flexible split configurations.

## Security Considerations
- **Immutability**: The `metadata_hash` prevents tampering with round parameters after inscription.
- **Replay resistance**: Unique `round_id` combined with Bitcoin block anchoring prevents accidental reuse of BIIs across rounds.
- **Over-allocation**: Strict basis point sums and ticket caps prevent payouts exceeding the pool.
- **Interoperability risk**: Validators MUST reject unsupported major versions to avoid inconsistent interpretations.

## Example
```json
{
  "version": "1.0",
  "round_id": "b379fe5e9d2a4b74a1f3c2de9a8d11ee",
  "start_block": 850000,
  "end_block": 850287,
  "min_bet_sats": 10000,
  "max_bet_sats": 10000000,
  "min_tickets": 100,
  "max_tickets": 100000,
  "prize_pool_address": "bc1qexampleprizepooladdress000000000",
  "rollover": true,
  "rollover_target_round_id": "b379fe5e9d2a4b74a1f3c2de9a8d11ef",
  "payout_policy": {
    "winners": [
      {"count": 1, "share_bps": 6000},
      {"count": 5, "share_bps": 2000}
    ],
    "treasury_bps": 1000,
    "issuer_bps": 1000
  },
  "treasury_outputs": [
    {"address": "bc1qtreasury1example0000000000000000000", "weight_bps": 7000},
    {"address": "bc1qtreasury2example0000000000000000000", "weight_bps": 3000}
  ],
  "metadata_hash": "7f623af8f3b12dd51c7b6c4b9a1cd74b878b9ec4b23e1a77252b76f3e72d1c4d",
  "notes": "Example BII for demonstration"
}
```

### Round Binding
Indexers map bets to rounds by:
1. Locating BII inscriptions and extracting `round_id`, `start_block`, and `end_block`.
2. Selecting Bitcoin transactions paying `prize_pool_address` whose inclusion height is within `[start_block, end_block]`.
3. Parsing attached BTRY OP_RETURN payloads and ensuring `round_id` matches the BII.
4. Enforcing caps (`max_tickets`) and rejecting transactions outside amount bounds.
5. Emitting a candidate bet list for ICP final validation.
