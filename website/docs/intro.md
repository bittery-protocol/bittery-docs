# Bittery Protocol

Bitcoin is very good at keeping value and very limited at everything else.  
It does not run logic, it does not coordinate groups, and it does not settle disputes.  
It simply records what happened.  
For a long time this made lotteries on Bitcoin feel strangely incomplete—money could move on-chain, but the structure around it always had to sit somewhere else, usually in the hands of an operator people had no choice but to trust.

The arrival of Ordinals and Atomicals changed how people thought about Bitcoin data.  
Suddenly, a satoshi could carry meaning because someone had inscribed that meaning onto it.  
Art, text, identity, all pinned directly to a place in the ledger.  
It gave creators permanence, but permanence alone didn’t help them very much.  
Most inscriptions sit quietly after they are minted; unless a market keeps trading them, there is no ongoing participation, no recurring moment that brings creator and audience back together.

Lotteries work differently.  
A lottery round is not just a prize—it is an event.  
People remember where they were when they joined, which ticket they held, and what the artwork on it looked like.  
Old lottery stubs are kept for years after the draw, not because they might be sold, but because they mark a moment that meant something.  
Bittery tries to bring that feeling onto Bitcoin in a way that fits naturally with how Bitcoin works.

A round on Bittery is simply an inscription.  
It is a small document written to the chain that describes when the round begins, how it behaves, and what counts as a valid entry.  
Once written, it does not move or change; everyone shares the same starting point.  
A ticket is just a Bitcoin transaction that contains a short CBOR payload inside OP_RETURN.  
People who understand Ordinals or Atomicals will recognize the idea immediately:  
those systems attach meaning to a satoshi, and here the meaning is attached to the transaction itself.  
Nothing off-chain has to confirm it.  
Anyone reading the chain can see what round the ticket belongs to.

When rules and entries live on the chain, the rest becomes open territory.  
Different people can build different engines to actually run the round.  
One engine might perform a straightforward scan and compute a winner.  
Another might use verifiable randomness and threshold-signed payouts.  
Someone else might write a minimal script for private use.  
Bittery doesn’t decide how these engines should work; it only anchors the parts that must be shared—what the round says, what the tickets say, and how to check them against each other.

This also gives artists a clearer place in the process.  
Instead of producing content that waits for speculative trading, they create the visual identity of a round.  
Their work becomes part of the event itself.  
When someone participates, they aren’t just buying a chance at a payout; they are creating a record tied to that artwork, a small artifact of a specific moment.  
It shifts the focus from price to presence.

Bittery stays intentionally small.  
It isn’t a platform or a service.  
It doesn’t manage users or hold funds or promise to stay online.  
It describes a structure that anyone can adopt in their own way.  
The inscription fixes the rules, the transaction declares the entry, and everything else—verification, execution, payout—can be built and rebuilt by whoever needs it.

## Why Bittery Is a Protocol

Bittery is a protocol because the parts that matter should not belong to anyone.  
Applications disappear when their operators move on; a protocol continues as long as people can read and interpret it.  
If the round description is on Bitcoin and the entries are on Bitcoin, the outcome can be reproduced by anyone who looks.  
No website has to survive for the system to make sense.

By limiting itself to formats and rules, Bittery avoids becoming a product.  
It leaves room for many implementations, each with its own assumptions and trade-offs.  
What ties them together is the chain itself.  
If the data matches the rules, the result is valid.  
If it doesn’t, it isn’t.  
Nothing else has authority.

The protocol exists so that issuing a round never requires permission,  
and verifying a round never requires trust.
