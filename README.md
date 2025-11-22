# Bittery Protocol Docs

This repository hosts the Docusaurus-powered documentation site for the Bittery Protocol.

## Getting started
1. Install Node.js 20.
2. Install pnpm (v9 or later recommended).
3. Install dependencies from the `website` directory:
   ```bash
   cd website
   pnpm install --no-frozen-lockfile
   ```
   If the npm registry is blocked in your environment, configure an alternate registry mirror before installing.
4. Start the local dev server:
   ```bash
   pnpm run start
   ```

Documentation content lives under `website/docs/` with BLIP proposals in `website/blip/`. Update `website/sidebars.js` to wire new pages into navigation.
