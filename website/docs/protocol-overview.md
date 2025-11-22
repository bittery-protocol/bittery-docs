# Protocol Overview

Bittery is a deterministic and verifiable lottery protocol designed to operate on Bitcoin.  
It solves the fundamental limitations of Bitcoin-only systems:

- Bitcoin cannot execute on-chain logic.
- Bitcoin cannot generate verifiable randomness.
- Bitcoin UTXO validation is expensive and slow.
- Ordinals metadata sits on-chain but has no execution engine.
- No native platform supports fair lottery execution on Bitcoin.

Bittery combines four layers:

1. **Bitcoin Layer**  
   - Bets are UTXO transfers to a prize pool address.  
   - Bets embed metadata using BTRY OP_RETURN CBOR payloads.  
   - Payouts are TSS-signed Bitcoin transactions.  
   - All financial activity is final and publicly auditable.

2. **Ordinals Metadata Layer**  
   - Each round is defined by a “Bittery Issuance Inscription” (BII).  
   - BII contains the rules, parameters, limits, and metadata for the round.  
   - Optional: per-round ticket NFTs for user-facing representation.

3. **Off-chain Indexer Layer**  
   - Scans blocks for bets and BIIs.
   - Extracts OP_RETURN metadata.
   - Validates formatting, block heights, and round association.
   - Produces a candidate bets list.

4. **ICP Execution Layer (Final Judge)**  
   - Fully validates each bet by checking Bitcoin UTXOs.
   - Enforces round rules from BII.
   - Generates randomness via VRF.
   - Selects winners deterministically.
   - Executes prize payout via Bitcoin-TSS.

### Why Bittery?

Bittery aims to be the first general-purpose, reproducible, and verifiable Bitcoin lottery protocol.  
The system is:

- Trust-minimized  
- Fully auditable  
- Upgradeable via BLIPs  
- Legally modular (protocol ≠ operator)  
- Globally usable  

It is not a gambling platform but a **protocol standard**.
