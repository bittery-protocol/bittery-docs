# Repository Guidelines

## Project Structure & Module Organization
- Root directory stores high-level docs (`README.md`, `AGENTS.md`) and DNS config (`CNAME`).
- All buildable code lives under `website/`, a Docusaurus 3 app. Key folders: `docs/` for protocol docs, `blip/` for Bittery improvement proposals, `src/pages` for React pages, `src/css` for global styles, and `static/` for assets copied verbatim to the build output.
- Navigation is configured in `website/sidebars.js`; update it whenever you add or rename content to keep the UI coherent.

## Build, Test, and Development Commands
- `pnpm install --no-frozen-lockfile` (run inside `website/`) installs dependencies using Node.js 20.
- `pnpm run start` launches the Docusaurus dev server with hot reload at `http://localhost:3000`.
- `pnpm run build` creates the production static bundle in `website/build/` and should complete with zero warnings before merging.
- `pnpm run serve` previews the last production build locally.
- `pnpm run prettier` checks formatting; use `pnpm run prettier:fix` before committing to auto-format staged files.

## Coding Style & Naming Conventions
- JavaScript/TypeScript and Markdown/MDX files are formatted by Prettier (2-space indent, single quotes per default rules).
- Organize MDX front matter with `title`, `sidebar_label`, and `slug`; file names should stay kebab-case (e.g., `intro-to-liquidity.mdx`).
- Keep React components functional and colocate page-specific styles under `src/css/` when shared across pages.

## Testing & Verification
- There is no bespoke test harness; the required checks are `pnpm run build` (ensures MDX validity, link integrity, and type-safe config) and `pnpm run prettier`.
- When adding complex diagrams or embeds, verify them in both dev and production builds because some plugins only execute during SSR.

## Commit & Pull Request Guidelines
- Follow conventional, action-focused commit subjects (imperative mood, ~65 characters). Group related doc edits into one commit instead of many tiny commits.
- PRs should describe the scope, list affected sections (e.g., `docs/liquidity/*.mdx`), and include screenshots or GIFs for UI-affecting changes.
- Link issues or BLIPs when relevant, note any follow-up tasks, and confirm you ran `pnpm run build` plus formatting checks before requesting review.

## Security & Configuration Tips
- Never commit secrets; environment variables for previews belong in your shell, not the repo.
- Pin any new third-party plugins in `package.json` and justify their necessity in the PR body.
