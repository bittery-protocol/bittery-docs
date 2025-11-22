# Bittery Protocol Docs

This repository hosts the Docusaurus-powered documentation site for the Bittery Protocol.

## Getting started
1. Install Node.js 18.
2. Install dependencies from the `website` directory:
   ```bash
   cd website
   npm install
   ```
   If the npm registry is blocked in your environment, configure an alternate registry mirror before installing.
3. Start the local dev server:
   ```bash
   npm run start
   ```

Documentation content lives under `website/docs/` with BLIP proposals in `website/blip/`. Update `website/sidebars.js` to wire new pages into navigation.
