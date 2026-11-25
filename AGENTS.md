# AGENTS.md

Single source of instructions for AI coding agents working in this repo. `CLAUDE.md` only imports this file.

## Project

FHEdback is a confidential on-chain survey platform built on Zama FHEVM. Answers are encrypted client-side, aggregate statistics are computed homomorphically, and individual answers are never decrypted. It won the Zama Developer Program (October 2025).

**Status: frozen.** The project targets FHEVM v0.9 with `@zama-fhe/relayer-sdk` 0.3.0-5 on Sepolia. Zama's testnet relayer has since changed, so the live demo can no longer encrypt or decrypt. Do not upgrade the FHEVM stack unless the maintainer explicitly asks; dependency versions are pinned on purpose.

## Layout

- `contracts/`: Hardhat project (Solidity ^0.8.24). `ConfidentialSurvey_Factory` deploys one `ConfidentialSurvey` per survey. Scaffold derived from Zama's `fhevm-hardhat-template` (BSD-3-Clause-Clear, see `contracts/LICENSE`).
- `frontend/`: Vite + React 19 + TanStack Router + wagmi/RainbowKit + Tailwind 4. Survey metadata in Firebase. Relayer SDK loaded from Zama's CDN.
- `_legacy/`: earlier prototypes (formerly separate repos `questionnaire_contracts`, `questionnaire_frontend`, `zama-fhe-contract`). Read-only history; do not modify or build.

There is no root `package.json`; each folder is an independent npm project.

## Commands

Node 20 or 22 LTS.

```bash
# contracts
cd contracts
npm ci
npm run compile     # hardhat compile + typechain
npm test            # runs against the local FHEVM mock

# frontend
cd frontend
npm ci
cp .env.example .env   # fill Firebase + WalletConnect values
npm run dev
npm run build
npm run lint
npm run type-check     # run after a build/dev start: src/routeTree.gen.ts is generated and git-ignored
```

## Conventions

- TypeScript everywhere; keep `npm run lint` and `npm run type-check` clean in `frontend/`.
- Contract addresses for the frontend live in `frontend/src/services/contracts/`. Use `npm run copy:to-frontend` in `contracts/` after a deploy instead of editing ABIs by hand.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`).

## Do not

- Commit `.env` files, mnemonics, or API keys. Hardhat secrets go through `npx hardhat vars set`.
- Put server-side secrets in `VITE_*` variables: they are bundled into the browser.
- Deploy contracts or the frontend to production without the maintainer's confirmation.
- Bump `@fhevm/*` or `@zama-fhe/relayer-sdk` versions casually: the plugin, mock-utils, and relayer SDK versions must match each other.
