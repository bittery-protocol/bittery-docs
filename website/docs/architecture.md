# Protocol Architecture

Bittery uses a modular 3-layer architecture built specifically to overcome Bitcoin’s lack of programmability while maintaining full transparency.

```
(BTC) Bitcoin Layer
├── Bets (UTXO → prize_pool_address)
├── BTRY OP_RETURN payloads
├── Payouts (TSS-signed)
└── BII stored as an Ordinals inscription

(ORDINALS) Metadata Layer
├── BII (ruleset)
└── Optional NFT ticket collections

(INDEXER) Off-chain Layer
├── Bitcoin block scanner
├── OP_RETURN parser (CBOR)
├── BII metadata loader
├── Round association
└── Candidate bet list

(ICP) Execution Layer — “Final Judge”
├── Bitcoin UTXO verification
├── Rule validation (BII)
├── VRF randomness (64-bit)
├── Winner selection
├── TSS-signed payout generation
└── Round summary storage

```

## Key Properties

### **Bitcoin-first**
All bets and payouts occur as Bitcoin transactions.

### **Verifiable & Reproducible**
Every bet and payout can be reproduced from chain data.

### **Execution-separated**
ICP executes validation and randomness; Bitcoin provides immutability.

### **Indexer-agnostic**
Indexers only provide candidate data; ICP verifies everything.

### **Stateless-by-design**
All round rules are encoded in BII, independent from indexer or execution environment.

### **Open standard**
The protocol is defined through BLIP documents, not implementation.

This architecture allows Bittery to define trust-minimized games on Bitcoin without requiring Bitcoin scripting extensions or L2 smart contracts.
