# poisik

AI-powered UX/UI audit tool — upload a screen, get an expert-level design critique.

## Getting Started

This project uses **pnpm** as its package manager.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Geist, and follows the design system in `features/00-design-system-reference.md`.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run `tsc --noEmit`
- `pnpm test` — run the Vitest suite

## Pre-commit hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run ESLint, `tsc --noEmit`, and Prettier on staged files before each commit.
