# Spec: Epic 1 — Foundation (toolchain, App Router, tests, standards)

- **Status:** draft — reconciled against the 2026-11-16 standards audit; decisions D1-D4 recorded
- **Owner:** Luis Richmond
- **Ticket(s):** derived by the planner from this spec; none exist yet
- **Date:** 2026-11-16

## Problem

The app is a 2023 scaffold that has drifted from the contract in `AGENTS.md`.

- **The runtime is EOL, which blocks both testing and type checking.** Node 23.11.0 cannot run `vitest@5.1.0` (`engines: ^22.12 || ^24 || >=26`) or `jsdom@31`, so there is no runner and "Definition of done" rests on a manual browser check. Types cannot be checked either: `next-env.d.ts` is gitignored, so `npx tsc --noEmit` fails on a fresh clone until `next build` runs.
- **The framework is four majors behind and its tooling is gone.** Next 13.1.1 -> 16.4.6: `next lint` and `next build`'s lint step are removed, `.eslintrc.json` is no longer read, and `@next/font` is dead (last publish 14.2.15) yet imported at `pages/_app.tsx:4`. Turbopack is now the default bundler.
- **Nobody has measured the code against the standards it declares.** Five violations show on first read: `skillsToFilter/index.tsx:11` renders the literal class `false`, `staticData` has no explicit type, `tsconfig.json` lacks the `typescript.md` §1 baseline, raw hex is repeated in five CSS files, and the filter predicate lives inline in a route. The rest is unrecorded.

Epic 2 (content, blog) and the domain/positioning question are blocked behind this.

## Goal

One shippable epic that leaves the same site — same routes, visuals and behaviour — on a supported Node LTS, current Next/React, the App Router, a working lint/typecheck/test trio, and a written diagnosis of every departure from `typescript.md` / `css.md`.

## Non-goals

- **Content.** Typos in `staticData/employmentHistory/workingHistory.ts` ("projecst", "independant", "profesional") stay. That is Epic 2.
- **The blog.** `/blogIndex` keeps its "Working on it" placeholder.
- **Domain, positioning, "what this page is for".** Not decided here.
- **Visual redesign, new features** (search, pagination, theming, RSS), i18n, analytics.
- **CI.** No `.github/` is created; verification is manual per phase.
- **No dependency outside R1**, `output: 'export'`, `src/`, path aliases.
- **Deferred to Epic 2 by decision, not by oversight** (D1, D2, D4): skill-chip a11y (`<li onClick>`), breakpoint normalisation (1000/1025 -> 768/1024), and the 320px horizontal overflow on `/employmentHistory`. Each stays in the diagnosis as a P1/P2 violation with `deferred:<reason>` — they are recorded debts, not clean bills of health. Epic 1 must not claim standards compliance without this list.
- Formatting is **in** scope (D3): `prettier@3.10.1` lands as its own commit before any migration.

**Invariant:** the site looks and behaves exactly as today. Permitted deltas are listed in R15; anything else is a defect.

## Delivery phases

Each ends green (`yarn lint`, `yarn typecheck`, `yarn build`, routes served) and is independently revertable. Order is forced by dependency, not preference.

| # | Phase | Why here |
| --- | --- | --- |
| 0 | Baseline evidence: screenshots, `curl` HTML and `<head>` snapshot of the three routes + 404 at 320/768/1280; current route table. No code. | "Looks identical" is unfalsifiable without a before. Gates R15. |
| 0.5 | Formatting baseline: `prettier@3.10.1` with `semi: false`, `singleQuote: true`, 2-space; one `style:` commit touching formatting only; `.git-blame-ignore-revs` records it. | Before any code moves, so every later diff is real work and not whitespace. A formatting commit mixed into Phase 2 would be unreviewable. |
| 1 | Toolchain: Node pin, Next 16 / React 19 / TS / ESLint 10 flat config, `next/font`, scripts, tsconfig. **Stays on the pages router.** | Smallest diff that kills the EOL runtime and unlocks `vitest`. Next 16 still serves `pages/`, so the bump is verifiable against unchanged route code. |
| 2 | App Router: `pages/` -> `app/`, root layout, `metadata`/`viewport`, Header island, filter islands, route-local CSS. | Must follow Phase 1: migrating first means building on Next 13 APIs that Phase 1 deletes (`@next/font`, `next lint`, pre-16 scroll semantics), and the parity work is paid twice. |
| 3 | Runner + extraction: `vitest@5`, `lib/` pure functions, components consume them. | Needs Phase 1 for Node and Phase 2 because files move; extracting earlier means extracting twice. |
| 4 | Standards refactor: R13, diagnosis doc finalised. | Cheapest last — paths final, and Phase 3 tests guard the behaviour it edits. |

## Requirements

### R1 — Runtime and dependency set, pinned

Node 26.13.1 via `"engines": { "node": ">=26.13.0 <27" }` and `.nvmrc`, so an unsupported Node is rejected at install rather than silently used. Versions: `next@16.4.6`, `react`/`react-dom@19.3.1`, `typescript@5.9.3`, `eslint@10.15.0`, `eslint-config-next@16.4.6`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `@types/node@26.6.6`, `vitest@5.1.0`; `autoprefixer`, `postcss`, `react-icons` stay (Q5). One `yarn.lock`, yarn classic. TypeScript stays on 5.9.3: 6.0.3 and 7.0.2 are unproven against `next build` type checking and `eslint-config-next`, and a major bump is its own change with its own rollback point. No `--turbopack` flag in any script; `next.config.js` keeps `reactStrictMode: true` and gains no `eslint` key.

- [ ] `yarn install` fails with an engines error under 23.11 and succeeds under 26.13.1; `yarn install --frozen-lockfile` then passes with no peer warning.
- [ ] `yarn why next` and `yarn why typescript` each resolve to exactly one version.
- [ ] `yarn build` reports Turbopack, type-checks clean with zero new `@ts-expect-error`/`@ts-ignore`, and emits autoprefixed CSS with an unmodified `postcss.config.js`.

### R2 — `@next/font` is gone

Inconsolata comes from `next/font/google` and its class is applied to the same wrapper element as today (`pages/_app.tsx:9`). Fonts are self-hosted; no runtime request to `fonts.googleapis.com`.

- [ ] `grep -r "@next/font" site-nextjs` returns nothing; computed `font-family`/`font-weight` on `h1` of `/` match Phase 0 exactly.

### R3 — ESLint runs as a flat config

`eslint.config.mjs` uses `eslint-config-next/core-web-vitals` with `globalIgnores` for `.next/**`, `out/**`, `coverage/**`, `next-env.d.ts`; `.eslintrc.json` deleted; `"lint": "eslint ."`.

- [ ] `yarn lint` exits 0, and fails on a temporary `const x: any = 1` (reverted before commit); `grep -rn "next lint" site-nextjs` empty.

### R4 — Typecheck works without a build

`"typecheck": "next typegen && tsc --noEmit"`. `tsconfig.json` adds `.next/types/**/*.ts` to `include`, raises `target` to at least `ES2017` (proposed `ES2022`), sets `moduleResolution: "bundler"`, and adds the `typescript.md` §1 baseline: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`.

- [ ] On a fresh clone with no `.next/` and no `next-env.d.ts`, `yarn typecheck` exits 0.
- [ ] `git status --porcelain` is clean after `yarn build` — nothing generated is tracked.

### R5 — App Router surface, no pages router, everything static

`app/layout.tsx`, `app/page.tsx`, `app/employmentHistory/page.tsx`, `app/blogIndex/page.tsx`; `pages/` deleted. Page CSS moves beside its segment per `typescript.md` §11: `pagesStyles/index.module.css` -> `app/page.module.css`, `pagesStyles/employmentHistory.module.css` -> `app/employmentHistory/page.module.css`, class names unchanged.

The 404 is a parity risk the spec does not hand-wave: the pages-router default 404 and the App Router default `not-found` do not necessarily render the same markup. Phase 0 captures `/nope`. If the Phase 2 404 differs in text or structure, add `app/not-found.tsx` reproducing the captured output; only if the default already matches may the custom file be omitted. Record whichever path was taken in the diagnosis.

- [ ] `ls site-nextjs/pages site-nextjs/pagesStyles` fails; `yarn build` lists `/`, `/employmentHistory`, `/blogIndex`, `/_not-found` and marks all four static (no dynamic marker).
- [ ] `curl -s localhost:3000/nope` matches the Phase 0 `/nope` body text and structure, or `app/not-found.tsx` reproduces it.
- [ ] `grep -rnE "cookies\(|headers\(|export const dynamic|export const revalidate" site-nextjs/app` returns nothing.
- [ ] The 404 body text and every `styles.<name>` reference survive the move.

### R6 — Root layout owns the document and the metadata

`app/layout.tsx` renders `<html lang="en">` and `<body>`, imports `styles/global.css`, applies the font class, and renders Header, the `.content` wrapper, children and Footer in today's order and nesting. It exports `metadata` (title `Lalrg's site`, the description from `components/shared/layout/index.tsx:17` verbatim, the favicon link) and `viewport` (width=device-width, initial-scale=1). No `next/head` anywhere.

- [ ] `curl -s localhost:3000/` contains the header title, intro copy and `<footer`; `.content`'s DOM path and classes match Phase 0.
- [ ] `<head>` of all three routes matches Phase 0 for title, description, viewport, favicon; no 4xx favicon request in the network log.

### R7 — `scroll-behavior` parity, decided explicitly

**Decision: do not add `data-scroll-behavior="smooth"`.** Verified: no `scroll-behavior` declaration exists anywhere in the repo, so Next 16's removal of the SPA override was a no-op here. The only scroll commit (`1a3537a`) fixed horizontal nav overflow in `header.module.css`, not smooth scrolling — the brief's premise is wrong and this spec does not inherit it.

- [ ] `grep -rn "scroll-behavior" site-nextjs` returns nothing after Phase 2.
- [ ] Each header link from `/` lands at the top of the target route at 320 and 1280, as in Phase 0; if not, add the attribute, record why in `AGENTS.md`, amend this requirement.

### R8 — Active nav link survives the router change

Header uses `usePathname` from `next/navigation` inside a `'use client'` component; the active-class logic and output are unchanged, and nothing above Header becomes a client component.

- [ ] `grep -rn "next/router" site-nextjs` returns nothing; on each route exactly one nav link carries `linkActive` with the same class string as Phase 0.

### R9 — Filtering stays interactive, data stays server-side

`app/employmentHistory/page.tsx` is a Server Component that imports `staticData/employmentHistory/workingHistory.ts` and passes serialisable data to one client component owning the `useState` and row visibility.

- [ ] `curl -s localhost:3000/employmentHistory` contains all five company names (works with JS off).
- [ ] Selecting a chip hides every entry with no matching bullet; clearing all shows five. Same chips, same order, as Phase 0.

### R10 — Standards diagnosis is a deliverable

`docs/standards-diagnosis.md`: one table `file:line | standard rule | current code | severity (P1|P2|P3) | disposition (fix-now | deferred:<why> | won't-fix:<why>)`, plus a separate list of issues the standards are silent on. Every rule cell quotes the standard verbatim with its section; line numbers are re-verified after Phase 2 because files move. Seed findings, confirmed against the tree — all must appear:

| file:line | standard | current | sev |
| --- | --- | --- | --- |
| `components/skillsToFilter/index.tsx:11` | css §4 "Never interpolate a boolean" | `` `${styles.singleSkill} ${selected && styles.selected}` `` emits class `false` | P1 |
| `components/skillsToFilter/index.tsx:11` | css §10 "Interactive elements are real elements (`button`, `a`), not `div` + `onClick`" | `<li onClick>`; keyboard cannot filter | P1 (deferred, D1) |
| `pages/employmentHistory.tsx:10-17,28-49` | ts §2 "entry points only, thin. No business logic, no data shaping" | dedupe + visibility predicate inline in the route | P1 |
| `tsconfig.json:3-15` | ts §1 strictness baseline | missing the four flags named in R4 | P1 |
| `staticData/employmentHistory/workingHistory.ts:1` | ts §11 "exported const with an explicit type" | `workingHistoryArray`, untyped | P2 |
| `components/employmentHistory/WorkHistoryItem/index.tsx:4-11` | ts §11 "`type XProps`... not `interface`"; "`Array<T>` rather than `T[]`" | `interface` + `string[]` | P2 |
| `components/employmentHistory/WorkHistoryItem/whi.module.css:1` | css §3 "No abbreviations in file or class names" | `whi.module.css` | P2 |
| `styles/global.css` + all `*.module.css` | css §5/§6 tokens on `:root`; "Raw hex in a module is a review finding" | hex/`white` repeated in 5 files | P2 |
| `header.module.css:18,37`, `layout.module.css:1`, `employmentHistory.module.css:25` | css §7 "Two breakpoints only: 768px... 1024px" + "Media queries go after the base rule" | 1000/1025px, queries before base | P2 (deferred, D2) |
| `components/employmentHistory/WorkHistoryItem/whi.module.css:13` | css §8 "No horizontal scrolling at 320px. **Verify before calling it done.**" | `.mainWHI { width: 18.75rem }` exceeds the ~256px available at 320px | P1 (deferred, D4 — confirm the scrollbar in the browser before promoting from arithmetic to fact) |
| `pages/index.tsx:19-27`, `footer/index.tsx:11` | **no standard** — WCAG 4.1.2 | icon-only links with no accessible name | silent-list entry, deferred, D4 |
| `components/shared/layout/header/index.tsx:7,15` | css §4 `clsx` | ternary/`&&` class interpolation | P3 |
| `app/page.tsx:1` (was `pages/index.tsx:1`) | ts §11 "styles and asset imports last" | stylesheet imported first | P3 |
| every `*.tsx` | ts §11 "Prettier with `semi: false`, `singleQuote: true`" | no formatter; semicolons mixed within files | P2 (fixed in Phase 0.5, D3) |

- [ ] Every seeded row appears with a verbatim quote and a still-valid line number.
- [ ] The silent list invents no rule. Candidates: missing `<html lang>`, `<span>` wrapping block content, `HeaderLink`/`mapSkill` called as plain functions returning JSX, the `data:,` favicon hack in `pages/_document.tsx`, no custom 404, `useMemo([])` over module constants, `repeat(4, auto)` grid for 3 links.

### R11 — Pure logic is extracted, not invented

There is **almost no testable pure logic** today: every branch sits in a route or a component body. Real candidates: `collectSkills` (flatten + dedupe, `employmentHistory.tsx:10-17`), `shouldDisplayEntry` (visibility, `:28-38`), `toggleSkill` (`skillsToFilter/index.tsx:16-23`). `staticData` is data and the render helpers return JSX, so neither qualifies. Extraction is therefore **mandatory**. They live in `lib/`, importing no React and no DOM (`typescript.md` §2).

- [ ] `lib/*.ts` imports nothing from `react`, `next` or `components/`.
- [ ] `grep -rn "new Set(" site-nextjs/app site-nextjs/components` returns nothing.

### R12 — Test setup and the coverage rule

`vitest@5`, `"test": "vitest run"`, `environment: 'node'`, tests colocated as `thing.ts` + `thing.test.ts` (ts §2, §8). No snapshots, no CSS assertions, no `.test.tsx`. React Testing Library is **not** installed: no component is genuinely pure, and an unused dependency contradicts `AGENTS.md`. Coverage rule, checkable without a coverage tool: every exported `lib/` function has a test per branch of its decision logic, and every edge-case row below has a named test.

- [ ] `yarn test` exits 0 on a fresh clone, no watch flag, no network access.
- [ ] Flipping `&&` -> `||` in `shouldDisplayEntry` turns the suite red; no `*.snap` exists.

### R13 — Refactor items, both standards

TypeScript: `type WorkHistoryItemProps`, `Array<string>`, `export type WorkHistoryEntry` + `export const workingHistory: Array<WorkHistoryEntry>`, `is*`/`should*` booleans, `clsx` for conditional classes, ts §11 import order in every touched file. CSS: `:root` tokens for `#440a67`, `#26063a`, `#93329e`, `#b4aee8`, `#fff`, modules consuming `var(--…)`, the `global.css` allowlist comment from css §5, media queries after their base rule, `font-size: 16px` -> `1rem`. Breakpoints stay 1000/1025 (D2) and `.mainWHI` keeps its width (D4), so this phase has zero visual diff.

- [ ] No `interface` for component props under `components/`, no `string[]`, and no route renders `class="... false"`.
- [ ] No raw hex or `white` in any `*.module.css`; computed styles per route match Phase 0 at 320/768/1280.

### R14 — `AGENTS.md` and `README.md` stop lying

Stack table (Node 26, Next 16, app router, vitest, prettier), Commands (`format`, `format:check`, `lint`, `typecheck`, `test`, `build` — each with what it proves), Architecture (`app/`, `lib/`, route-local CSS). `site-nextjs/README.md`'s create-next-app text is replaced with this repo's commands. `docs/styling.md` is untouched.

`AGENTS.md` §Standards must also record the four places this repo diverges from the harness standards, each with a reason, because `_index.md` says a divergence that is not written down is a defect:

1. Component folders are PascalCase (`WorkHistoryItem/`) per `typescript.md` §2's tree, contradicting §3's camelCase rule.
2. Default exports are required for components per §11, although §10 lists them as an anti-pattern.
3. `yarn.lock` is the lockfile, which §1's list omits.
4. Testing uses Vitest without Testing Library, because no component is pure enough to justify it (R12).

- [ ] `AGENTS.md` contains none of `pages router`, `@next/font`, `next lint`, `23.11.0`; `README.md` no longer references `pages/index.tsx` or `pages/api`.
- [ ] `AGENTS.md` §Standards lists all four divergences with a reason, and the deferred debt from D1/D2/D4 is visible from `AGENTS.md` (one line pointing at the diagnosis).

### R15 — Parity gate

Allowed deltas, exhaustive: `<html lang="en">` added, CSS-module class hashes changed, `data-scroll-behavior` absent. Layout, typography, colours, copy, scroll behaviour and icon rendering stay identical.

- [ ] Per-route, per-width screenshot comparison against Phase 0 shows nothing outside that list; page text is identical modulo whitespace.

### R16 — Formatter baseline (Phase 0.5, decision D3)

`prettier@3.10.1` configured exactly as `typescript.md` §11 requires: `semi: false`, `singleQuote: true`, 2-space indent. It lands as one `style:` commit that changes formatting and nothing else, before any file moves; `.git-blame-ignore-revs` records that commit. `.prettierignore` covers `.next/`, `node_modules/`, `next-env.d.ts`, `yarn.lock`. Scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.

- [ ] Reading the Phase 0.5 diff shows semicolons, quotes and indentation only — no identifier, no JSX structure, no string literal content.
- [ ] `yarn format:check` exits 0, and fails on a file given a trailing semicolon.
- [ ] `yarn lint` and `yarn build` stay green across the reformat, proving it was behaviour-neutral.
- [ ] `git log -1 --stat` for that commit touches no file under `docs/specs/`.

## Edge cases and failure behaviour

| Situation | Expected behaviour |
| --- | --- |
| No skill selected | All five entries, in `staticData` order — unchanged |
| Every skill selected | Entries shown only if they intersect the selection; the empty-selection shortcut must not apply |
| A skill appears in two entries | One chip, at first-appearance position |
| A skill repeats inside one entry | Collapsed to one chip; that entry still matches |
| Same chip toggled twice | Prior selection restored; no duplicates, no reordering |
| Selected skill matches no entry | Zero entries; chips stay rendered and deselectable |
| Selected string absent from `allSkills` (state drift) | No crash; zero matches; covered by a test |
| JS disabled / crawler | Full history renders from static HTML (R9) |
| No network during `yarn build` | `next/font/google` fetches at build time and fails. Accepted; it is a build error, never a broken site |
| Malformed `staticData` entry | Build-time type error via `WorkHistoryEntry`; no runtime fallback added |
| Unauthorized / duplicate request / timeout / concurrency | N/A: no server, auth, API or mutable state. Recorded so the row is not silently skipped |

## Constraints

- Node 26.13.1 only; yarn classic 1.22.22, never switch package managers (ts §1).
- No dependency outside R1 plus the formatter pinned in R16, without amending this spec; `strict: true` stays on.
- CSS Modules and plain CSS stay (`docs/styling.md`); all routes static; no env vars, no API layer.
- Parity widths are css §11's 320/768/1280.

## Decisions

Resolved 2026-11-16. D1, D2 and D4 are deliberate deferrals with the user's
sign-off — the diagnosis records them as debt, not as clean.

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | Skill-chip a11y (`<li onClick>` -> `<button>`, `aria-pressed`, focus styles) deferred to Epic 2. | The fix changes markup and adds a focus visual state, which contradicts R15's parity gate. User chose parity. |
| D2 | Breakpoints stay 1000/1025; media-query ordering is still fixed in Phase 4. | Normalising to 1024 moves the desktop layout boundary by 24px. Ordering fixes have no visual effect, so those stay in scope. |
| D3 | Prettier adopted now, as its own Phase 0.5 commit. | A format gate cannot retroactively be added once the migration diffs exist; an isolated commit keeps it reviewable. |
| D4 | `.mainWHI` 320px overflow and unnamed icon links deferred with the D1 a11y batch. | Same class of change: fixing the card width reflows the mobile layout, and both need a focus/aria pass to test properly. Recorded as P1 debt with a named Epic 2 owner. |
| Q4 | If `exactOptionalPropertyTypes` errors originate in `@types/react` 19 rather than this repo, drop that one flag and record the exception in `AGENTS.md` §Standards. | Do not contort app code to satisfy a third-party type definition. |
| Q5 | Stay on `react-icons@4.7.1` if React 19 renders the four icons with no console warning (peer range is `*`). | Avoid a second upgrade inside the upgrade. |

## Assumptions

- `ASSUMPTION:` the versions above are those recorded on 2026-11-16; no canary or RC enters the tree.
- `ASSUMPTION:` yarn 1.22.22 runs on Node 26. Corepack availability is not assumed — if `yarn` is missing, install it globally at that version and note it in `AGENTS.md`.
- `ASSUMPTION:` Phase 0 evidence is captured on the current Node 23 install before Phase 1 and kept outside the repo (evidence, not an artifact).
- `ASSUMPTION:` `metadata.icons = { icon: 'data:,' }` preserves favicon suppression; if Next 16 rejects it, accept one 404 and record it rather than add an icon file (that would be a visual change).
- `ASSUMPTION:` `target: ES2022` is not a compatibility regression for this audience; `ES2017` is the fallback if Turbopack objects.

## Verification

Run from `site-nextjs/`; each command is the proof for the named claim.

| Command | Proves |
| --- | --- |
| `yarn install --frozen-lockfile` | R1: Node 26, one dependency set, lockfile integrity |
| `yarn format:check` | R16: formatter wired, repo formatted |
| `yarn lint` | R3: flat config wired, zero violations, no new disables |
| `yarn typecheck` | R4: types compile without a build |
| `yarn test` | R11/R12: pure logic extracted and covered |
| `yarn build` | R1/R2/R5: Turbopack, self-hosted font, all-static route table |
| `yarn start` + `curl -s localhost:3000{,/employmentHistory,/blogIndex,/nope}` | R6/R9/R15: expected copy and `<head>`, five companies, same 404 |
| `grep -rn "@next/font\|next/router\|next/head\|next lint" . --include=*.ts* --include=*.json --include=*.mjs` | R2/R3/R5/R6/R8: no legacy API survives |
| Playwright at 320/768/1280 vs Phase 0 | R13/R15: visual parity and computed styles |
| Fresh clone: `yarn install --frozen-lockfile && yarn lint && yarn typecheck && yarn test && yarn build`, then `git status --porcelain` | All: reproducible without the author's `.next/`; nothing generated is tracked |

## Out of scope for now

- Content pass (Epic 2), the blog, and whether `/blogIndex` should exist.
- Own domain, deployment target, analytics, SEO beyond today's metadata.
- A CI workflow that runs the verification table automatically; the deferred debt from D1/D2/D4 (a11y chips, icon-link names, 320px overflow, breakpoint normalisation) as Epic 2 tickets.
- TypeScript 6/7 trial, React Compiler, Partial Prerendering, Server Actions.
