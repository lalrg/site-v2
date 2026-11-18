# site-v2

Personal site and playground of Luis Richmond: portfolio, resume/employment
history, and (planned) a blog. Static, content-in-repo, no backend. The app
lives in `site-nextjs/`; the repo root holds docs and the license.

## Stack

| Area | Choice | Version |
| --- | --- | --- |
| Runtime | Node | 26.13.1 (pinned via `.nvmrc` + `engines`) |
| Package manager | Yarn classic (committed `yarn.lock`) | 1.22.22 |
| Language(s) | TypeScript (strict), CSS Modules | 5.9.3 |
| Framework | Next.js, pages router | 16.4.6 |
| UI | React + `react-icons` + `next/font` (Inconsolata) | 19.3.1 |
| PostCSS | `autoprefixer` only — no Tailwind | 10.4.13 |
| Lint | ESLint (flat config), `eslint-config-next/core-web-vitals` | 10.15.0 |
| Testing | none yet (known gap, see Definition of done) | — |
| Data | literal TS arrays in `staticData/`, including translations in `staticData/i18n/` — no DB, no API | — |

## Commands

All commands run in `site-nextjs/`, not the repo root.

| Task | Command | Verified |
| --- | --- | --- |
| Install | `yarn install --frozen-lockfile` | yes |
| Dev server | `yarn dev` → http://localhost:3000 | yes |
| Build | `yarn build` | yes — clean |
| Lint | `yarn lint` (`eslint .`, flat config) | yes — clean |
| Typecheck | `yarn typecheck` (`next typegen && tsc --noEmit`) | yes |
| Test | none | n/a |
| Format | `yarn format` (`prettier --write .`) | reformats the repo in place |
| Format (check) | `yarn format:check` (`prettier --check .`) | fails on any unformatted file |

## Architecture

- `site-nextjs/` is the app root. `package.json`, `tsconfig.json` and
  `eslint.config.mjs` live there; never add a root-level Node workspace.
- `pages/` — routes (pages router). `_app.tsx` wraps every page in `Layout` and
  imports the global stylesheet. No `app/` directory, no API routes yet.
- `components/shared/layout/` — header, footer, global chrome. Layout is
  applied once in `_app`, not per page.
- `components/<feature>/` — feature UI (e.g. `employmentHistory/`,
  `skillsToFilter/`), one folder per component with its colocated
  `*.module.css`.
- `pagesStyles/` — CSS modules for page-level composition only.
- `styles/global.css` — reset and global custom properties only; no component
  styling here.
- `staticData/` — typed literal content, imported directly by pages. Content
  changes are data edits, not data fetching. Do not introduce an API layer
  without a spec.
- `staticData/i18n/` — the UI copy, one file per locale: `en-GB.ts` is the
  source of the key set (and of the `Dictionary` type), `es.ts` is annotated
  with it so a missing or extra key fails `yarn typecheck`, and
  `translations.ts` maps `Locale` to dictionary.
- `components/shared/locale/` — the locale provider, its `useLocale` hook, the
  flag switcher and the two inline-SVG flags. The provider is the only owner of
  the active locale and the hook is the only read path.
- `lib/locale.ts` — framework-free locale primitives (`Locale`, `LOCALES`,
  `LOCALE_COOKIE_NAME`, `localeNames`, `parseLocaleCookie`,
  `serializeLocaleCookie`). No React, no `next`, no DOM.
- The language toggle is client-side and cookie-backed (`NEXT_LOCALE`): the URL
  never changes, no route reads the cookie on the server, and every route stays
  static. `<html lang>` follows the choice via a pre-paint script in
  `pages/_document.tsx` plus a runtime sync in the provider. Shape and rejected
  alternatives: `docs/architecture.md`.
- Styling: CSS Modules per component, imported as `styles from './x.module.css'`.
  Rationale and rejected alternatives in `docs/styling.md`.
- Every page is statically rendered (`next build` reports all routes as static).
  Keep it that way unless a spec says otherwise.

## Standards

Harness standards apply by default (`~/.config/opencode/standards/_index.md`).

| Language | Standard | Overrides |
| --- | --- | --- |
| TypeScript / TSX | `~/.config/opencode/standards/typescript.md` | `strict: true` in `tsconfig.json` is already on — keep it |
| CSS / CSS Modules | `~/.config/opencode/standards/css.md` | none |

No other language is in scope. Adding one requires a standard first.

### Recorded divergences

`_index.md` treats a divergence that is not written down as a defect. Epic 1
R14 owns four (`docs/specs/2026-11-16-epic-1-foundation.md` §R14); they are not
written here yet, and Epic 1 Phase 4 owns that rewrite. The i18n feature adds
the one below.

| Where | Divergence | Reason |
| --- | --- | --- |
| `site-nextjs/components/shared/locale/LocaleProvider.tsx` | `react-hooks/set-state-in-effect` is off, file-scoped in `eslint.config.mjs` | R3 forbids reading the `NEXT_LOCALE` cookie during render — it would desync hydration — so the stored locale is read once in a mount effect and applied with `setState`. `@typescript-eslint/no-explicit-any` stays at error repo-wide. |

## Task source

Local markdown: `docs/tasks/` — one file per spec, tickets derived from it.
Specs live in `docs/specs/`. Nothing is tracked in an external PM tool.

## Definition of done

- [ ] Acceptance criteria in the ticket met, checked in the browser at the
      affected route (`yarn dev`)
- [ ] `yarn lint` clean
- [ ] `yarn build` green (covers type checking)
- [ ] CSS changes use CSS Modules; no new global selectors
- [ ] No new dependency without a ticket that justifies it
- [ ] One commit, Conventional Commit message, branch
      `feat|fix|chore|docs|test|refactor/<ticket>-<slug>`

Tests: there is no runner. Until one is added (tracked as its own ticket), new
logic is verified by `yarn lint`, `yarn build` and a manual route check. Once a
runner exists, new behaviour needs a test that fails without the change.

## Commit accounting

```md
Commit accounting: on
```

Trailers from the `spend_report` tool: `Ticket`, `Spend-Model`, `Spend-Tokens`,
`Spend-USD`, `Spend-Sessions`.

## Environments and variables

No environment variables are required to build or run the site today.
`.env*.local` is gitignored; if a variable is ever added it must be documented
in `.env.example` with a placeholder and one-line comment.

## Notes for agents

- Repo root is a container only: run Node commands inside `site-nextjs/`.
- Node 26.13.1 is pinned via `site-nextjs/.nvmrc` + `engines`; install it with
  `nvm install 26.13.1`. Yarn classic 1.22.22 runs on Node 26 (corepack is not
  assumed).
- `next-env.d.ts` and `.next/` are gitignored — never commit them. `yarn typecheck`
  runs `next typegen` first, so it works on a fresh clone.
- `caniuse-lite` is outdated and logs a warning on build. It is noise, not a
  failure; fixing it is separate work.
- Tech explicitly rejected in the README: Astro, Create T3 App. Do not propose
  them.
- Remote: `github.com/lalrg/site-v2`, single long-lived branch `main`.
