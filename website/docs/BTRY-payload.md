# BTRY OP_RETURN Payload Specification

## Abstract
This document specifies the CBOR-encoded BTRY payload embedded in Bitcoin OP_RETURN outputs. BTRY payloads convey deterministic metadata for initializing rounds, placing bets, and signaling termination. The schema ensures versioned, reproducible parsing across indexers and execution environments.

## Motivation
Bitcoin lacks native smart contract logic. BTRY payloads supply structured metadata that binds a transaction to a Bittery round, describing the action taken and parameters required for validation. A compact CBOR map keeps fees predictable while enabling extensibility through versioned keys.

## Specification
BTRY payloads are encoded as CBOR major type 5 (map). Keys are small integers to minimize size. Unknown keys MUST be ignored by parsers for forward compatibility. All amounts are integers in satoshis unless stated otherwise.

### Common Keys
- `v` (unsigned int, required): Payload version. Baseline value: `1`. Major bumps indicate breaking changes.
- `op` (unsigned int, required): Operation code. Defined values:
  - `0`: Init (round publication reference)
  - `1`: Bet
  - `2`: Terminate (issuer signal or end-of-round anchor)
- `g` (byte string, optional): Global identifier for idempotency (32 bytes recommended). Used with `r` to prevent replay.
- `r` (byte string, required for Bet/Term): Round identifier (matching BII `round_id`). For Init, `r` references the announced round id.
- `ts` (unsigned int, optional): Unix timestamp when the payload was created (advisory only).

### Operation-Specific Fields
- **Init (`op=0`)**
  - `bii` (byte string, optional): SHA-256 hash of the BII inscription content. Allows OP_RETURN announcement to prove BII integrity.
  - `addr` (text, optional): Prize pool address preview; MUST match the BII field if provided.
- **Bet (`op=1`)**
  - `amt` (unsigned int, required): Declared bet amount in satoshis. MUST equal the value sent to `prize_pool_address`.
  - `nums` (array, optional): Chosen numbers for visualization. Each element unsigned int. Maximum length 16. Validators do not interpret; used only for UI.
  - `tid` (unsigned int, optional): Ticket count for multi-ticket bets. Defaults to 1. Validators MUST ensure total tickets do not exceed BII `max_tickets`.
- **Terminate (`op=2`)**
  - `reason` (text, optional): Freeform rationale (e.g., round aborted).
  - `sig` (byte string, optional): Optional issuer attestation (implementation-defined) to authenticate termination notices.

### Encoding Rules
- CBOR canonical ordering (sorted by key) SHOULD be used to guarantee deterministic hashes.
- The OP_RETURN script MUST begin with `OP_RETURN <cbor_bytes>` with a maximum total script size of 80 bytes on Bitcoin mainnet unless using extensions that permit larger payloads; implementations SHOULD target ≤80 bytes.
- The `amt` value MUST equal the sum of all outputs to `prize_pool_address` within the transaction for this bet.
- `g` + `r` uniquely identify the bet attempt; duplicate pairs MUST be rejected by validators.

### Examples
#### Bet Payload (CBOR diagnostic)
```
{
  1: 1,        // v = 1
  2: 1,        // op = Bet
  3: h'6f726f756e643132', // r = "round12"
  4: h'01aa',  // g = random id
  5: 150000,   // amt
  6: [5, 12, 23, 34, 45], // nums
  7: 1         // tid
}
```

#### Bet Payload Hex
Canonical CBOR encoding for the above example:
```
a7               # map(7)
01 01            # 1:1 (v)
02 01            # 2:1 (op=Bet)
03 486f726f756e643132 # 3:h"6f726f756e643132" (r)
04 4201aa        # 4:h"01aa" (g)
05 1a000249f0    # 5:150000 (amt)
06 8505180c1817 1822182d # 6:[5,12,23,34,45]
07 01            # 7:1 (tid)
```

### Versioning and Backwards Compatibility
- Parsers MUST support `v=1` and ignore unknown keys ≥8.
- When a new major version is introduced, the `v` field MUST change and incompatible payloads MUST be rejected unless explicitly opted in.
- Optional fields MAY be added with new integer keys; existing validators MUST ignore unknown keys but continue enforcing known constraints.

## Data Structures
- `BTRYPayload`: Internal representation after decoding CBOR, containing version, op, identifiers, amounts, and auxiliary data.
- `BetAction`: Subset of fields required to evaluate bet eligibility: `{round_id, amount, ticket_count, entropy_inputs}`.

## Validation
1. Decode CBOR map; reject non-map or missing required keys.
2. Verify `v` is supported.
3. Verify `op` is one of {0,1,2}.
4. For Bet operations, ensure `amt` matches transaction outputs to `prize_pool_address` and satisfies BII bounds.
5. Enforce replay protection: reject duplicate `(g, r)` pairs.
6. Enforce `tid` ≥ 1 and cumulative tickets ≤ BII `max_tickets`.
7. Ensure OP_RETURN is unique within the transaction and that only one BTRY payload is present.

## Rationale
A compact CBOR map minimizes transaction size while keeping clear semantics via small integer keys. Explicit operation codes allow a single parser to handle multiple lifecycle events. Ignoring unknown keys ensures future extensibility without breaking older validators.

## Security Considerations
- **Replay protection**: The `(g, r)` tuple prevents duplicate processing of the same bet attempt.
- **Amount binding**: Explicit `amt` ensures metadata cannot lie about the satoshi value, enabling reproducible validation.
- **Integrity**: Canonical CBOR ordering enables deterministic hashing for audits.
- **Abuse mitigation**: Validators MUST reject payloads exceeding the size limit or containing malformed types to avoid resource exhaustion.

## Termination Semantics
Terminate (`op=2`) is an advisory signal. ICP final judge MUST corroborate termination against BII state (e.g., expired round, issuer authorization) before concluding the round.
