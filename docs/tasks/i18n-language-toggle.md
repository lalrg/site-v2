# Tasks: i18n — British English / Spanish in-page language toggle

- **Spec:** `docs/specs/2026-11-17-i18n-language-toggle.md`
- **Architecture:** `docs/architecture.md` — §2 (type flow, state, hook, cookie,
  `<html lang>`), §3 (implementation map), §3.1 (header measurement), §3.2
  (flags), §3.3 (order of work), §7 (clarifications)
- **Task source:** local markdown (`docs/tasks/`), per `AGENTS.md` §Task source
- **Scope of this file:** the whole feature. Every requirement R1–R15 is in
  play and none is deferred; §"Requirement coverage" maps each one to a ticket.
- **Total estimate:** 15 points, 6 tickets
- **Critical path:** I18N-1 → I18N-2 → I18N-3 → I18N-4 → I18N-5 → I18N-6
  (strictly serial — see §"Implementation order")
- **Sizes:** S = 1–2 (one sitting), M = 3 (a focused day). Nothing here is L: the
  one slice that would have been L (dictionaries *and* provider *and* switcher)
  is cut so each ticket stays inside one PR of at most two commits.

Branch per ticket: `feat/I18N-<n>-<slug>`, and `docs/I18N-6-<slug>` for the docs
ticket, whose type is `docs` (`AGENTS.md` §Definition of done lists the prefixes
as `feat|fix|chore|docs|test|refactor`). One ticket = one PR = one commit, at
most two. Conventional Commits.

Every commit carries spend trailers taken from the `spend_report` tool —
`Ticket`, `Spend-Model`, `Spend-Tokens`, `Spend-USD`, `Spend-Sessions`. Never
estimated, never hand-written. Stated once here, not per ticket.

**Gate on every ticket.** From `site-nextjs/`: `yarn install --frozen-lockfile`,
`yarn lint`, `yarn typecheck` and `yarn build` exit 0, and `yarn start` serves
`/`, `/employmentHistory` and `/blogIndex` at 200. Each ticket's Verification
block adds the proof specific to that ticket and lists `yarn format:check`
explicitly; the gate itself is stated once, here, and is never replaced by a
ticket's own checks.

**Formatting.** Every file a ticket writes is committed already formatted by the
repo's Prettier config (`semi: false`, `singleQuote`, `printWidth: 100`,
`trailingComma: all`). No ticket runs a `style:` reformat sweep of files it did
not otherwise touch (`typescript.md` §11); a `style:` commit in this set would
destroy the English byte-identical proof in I18N-2 and I18N-4.

**No ticket writes a test.** The repo has no runner (Epic 1 Phase 3 adds Vitest),
so no acceptance criterion here depends on one. Behaviour is proved with `curl`,
the build output, greps and Playwright driven by hand, exactly as the spec's
Verification table prescribes.

**Migration constraint that binds every ticket.** Nothing pages-router-specific
enters the feature: the provider is plain React context with no `next/router`,
the dictionaries are plain TS with no React import, `lib/locale.ts` is
framework-free (spec §Relationship to Epic 1, `docs/architecture.md` §5). A
ticket that finds itself reaching for a router API has left its scope.

## Implementation order

All six tickets are **strictly serial**, in id order, on the sequence branch the
feature is being landed on. This is not caution for its own sake: the edges are
real, and the table says why each one is where it is.

| # | Ticket | Why it cannot start earlier |
| --- | --- | --- |
| 1 | I18N-1 | Nothing else can compile without `Dictionary`, `Locale` and the two dictionaries. |
| 2 | I18N-2 | Needs the hook and both dictionaries; is the first ticket with a user-visible change. |
| 3 | I18N-3 | Needs the provider's runtime sync to exist first (`docs/architecture.md` §2.5: "build the runtime sync first, the pre-paint script second"). |
| 4 | I18N-4 | Needs the hook wired through `_app`; the header must already render the switcher, otherwise the Spanish half of its criteria cannot be exercised on a route. |
| 5 | I18N-5 | Its R8-closing criterion is `employmentHistory.title`, `.subtitle` and `skillsToFilter.heading`, which I18N-4 moves. |
| 6 | I18N-6 | R15 describes what exists (`docs/architecture.md` §3.3 step 8). |

**Parallelism: none at ticket level.** The only freedom the architecture grants
is inside I18N-4, where the six copy-migration files are order-independent among
themselves (`docs/architecture.md` §3.3 step 6). They still ship as one commit,
because that ticket's observable criterion is a single grep over all six files.
On §3.3's closing note — steps 1 and 2 are pure additions and could be reviewed
as one diff — the set keeps them apart because step 1's evidence is TypeScript
diagnostics and step 2's is DOM behaviour, and merging them would also produce a
twelve-file ticket. Splitting further — one ticket per file in I18N-4, or a
ticket for the `_app.tsx` one-liner — would produce tickets with no criterion of
their own, which this repo's ticket rule forbids.

## Tickets

| id | title | type | size | est | depends on |
| --- | --- | --- | --- | --- | --- |
| I18N-1 | Add the locale primitives and both dictionaries | feat | M | 3 | — |
| I18N-2 | Add the locale provider, the switcher and its header placement | feat | M | 3 | I18N-1 |
| I18N-3 | Declare `<html lang>` statically and set it before paint | feat | S | 2 | I18N-2 |
| I18N-4 | Move every UI string into the dictionaries | feat | M | 3 | I18N-3 |
| I18N-5 | Make the employment history data locale-aware | feat | M | 3 | I18N-4 |
| I18N-6 | Document where the copy lives | docs | S | 1 | I18N-5 |

## Requirement coverage

Every requirement has one home; the second id is where the proof for the last
acceptance criterion lives, not a second implementation.

| Req | Ticket |
| --- | --- |
| R1 one provider above every page | I18N-2 |
| R2 cookie persistence | I18N-2 |
| R3 no hydration mismatch | I18N-2 |
| R4 `<html lang>` | I18N-2 (runtime sync), I18N-3 (static value + pre-paint script) |
| R5 switcher and layout | I18N-2 |
| R6 hand-authored flags | I18N-2 |
| R7 typed content, missing key fails the build | I18N-1, I18N-2 (cookie literal), I18N-5 (`Record<Locale, string>`) |
| R8 every string switches | I18N-1 (the key set), I18N-4 (six consumer files), I18N-5 (three employment strings) |
| R9 names that do not translate | I18N-1 (`localeNames`), I18N-4, I18N-5 (companies, chips) |
| R10 one entry per job | I18N-5 |
| R11 filtering and page state unaffected | I18N-2 (no `key`, selection survives a switch), I18N-5 (full criterion) |
| R12 no URL change, no server-side locale | I18N-2 (click), I18N-3 (server ignores the cookie) |
| R13 every route statically rendered | Gate, plus I18N-3 |
| R14 no new dependency | Gate, plus I18N-2 (`git diff package.json yarn.lock`) |
| R15 docs record where copy lives | I18N-6 |

## How these were cut

- **I18N-1 is the type flow, and only the type flow.** `docs/architecture.md`
  §3.3 step 1 is additive and imported by nothing; its whole contribution is a
  compile-time guarantee (R7: "a missing key is a compile error"), which can only
  be reviewed against compiler output. Putting the provider in the same ticket
  would mix a TS2741 check with cookie behaviour and make a red build ambiguous.
  The *entire* R8 key set is written here, not incrementally, for the reason
  §3.3 step 1 gives: a key added later forces `en-GB.ts` and `es.ts` to change in
  the same commit or the build breaks.
- **I18N-2 merges architecture steps 2, 3 and 4 because separately they have no
  criterion.** The provider (step 2) and the switcher (step 2) have no consumer
  until `Header` renders them (step 4); three of R5's criteria — exactly one
  `aria-pressed`, the ≥24×24 targets, the 320 px geometry — are only reachable
  through the header, and R4's click criterion needs a click. A provider-only
  ticket would be green and unverifiable against the spec, and the `_app.tsx`
  one-liner (step 3) is not a PR. The cost is the largest ticket in the set:
  eight files, one deliverable, two commits at most — commit 1 the provider and
  the switcher components, commit 2 the header wiring and CSS, both green.
- **I18N-3 is separate despite being one file,** because its failure mode has
  nothing to do with the ones above: a `next/script` build warning, or a `lang`
  mutation that lands after first paint, triggers R4's documented fallback —
  delete the script, keep the static `lang` and the effect. `docs/architecture.md`
  §2.5 requires that to be "a second, separately revertable step", which it stops
  being if it rides in the eight-file ticket. It depends on I18N-2 for the
  runtime sync it must not fight with.
- **I18N-4 is six files and one ticket** because its criterion is a property of
  the set, not of a file: R8's grep ("these strings exist only under
  `staticData/i18n/`") cannot pass until the last file moves. The files are
  order-independent among themselves (§3.3 step 6), so they are also the only
  place in the feature where partial order is free — but a ticket per file would
  be six tickets with six identical checks.
- **I18N-5 is the one indivisible boundary and is not split, on purpose.**
  `staticData/employmentHistory/workingHistory.ts`, `WorkHistoryItem` and
  `pages/employmentHistory.tsx` reference each other in all three directions: the
  data shape decides the props, the props decide the `null` branch, and the React
  key (`i.company + i.endDate`, `pages/employmentHistory.tsx:49`) stops being
  meaningful the moment `endDate` can be `null` — it type-checks and renders
  `"GreenSlatenull"` for the current job (`docs/architecture.md` §3 row for
  `pages/employmentHistory.tsx`). Any two-of-three split is a red intermediate
  state: data alone fails the consumer's props, consumer alone cannot accept
  `null`, and key-last ships a wrong key in a green build. One ticket, one
  commit.
- **I18N-6 is last and touches only `AGENTS.md`.** R15 says the docs record where
  copy lives; they can only do that once the folders exist. It is 1 point, no
  code, and it is the only ticket whose diff has no file under `site-nextjs/`.
- **Nothing here is sized above 3.** The riskiest work (cookie read/write under a
  hydrating tree, the pre-paint script) is isolated in tickets of three and two
  points rather than bundled, so a revert costs one small diff — which is what
  §2.5 and §3.3 ask for.

---

## I18N-1 — Add the locale primitives and both dictionaries

- **Type:** feat
- **Size:** M
- **Estimate:** 3
- **Depends on:** —
- **Satisfies:** R7 (the compile-time key check), R8 (the key set and the
  verbatim English values), R9 (`localeNames`); spec D5, D6; `docs/architecture.md`
  §2.1 (type flow), §2.4 (pure half of persistence), §3.3 step 1
- **Touch:** `site-nextjs/lib/locale.ts` (new), `site-nextjs/staticData/i18n/en-GB.ts`
  (new), `site-nextjs/staticData/i18n/es.ts` (new),
  `site-nextjs/staticData/i18n/translations.ts` (new). Nothing else — no file
  imports these yet.

**Context**

The foundation every later ticket indexes from: one framework-free module that
names the two locales and the cookie, and two dictionaries whose key set is
defined exactly once. R7's guarantee — a missing translation key is a compile
error, never a runtime blank — is a property of the type derived from `en-GB`
and of `noUncheckedIndexedAccess` over a closed `Record`, not of a runtime check
(`docs/architecture.md` §2.1), so it must exist and be proved before a consumer
exists. `lib/` is a new top-level folder, sanctioned by `typescript.md` §2
("framework-free helpers") and already covered by `tsconfig.json`'s `**/*.ts`
and the flat ESLint config, so no configuration changes. Everything here is
additive and imported by nothing, which is why the routes must render exactly as
they do today.

**Acceptance criteria**

- [ ] `staticData/i18n/en-GB.ts` exports `enGB` — a plain object literal, **not**
      `as const` — and `export type Dictionary = typeof enGB`. Every key in R8's
      table exists with the English value copied **verbatim** from the file R8
      names, typos included (`profesional`, `independant`), and
      `employmentHistory.title` is `Employment History` with the trailing space
      dropped (whitespace-only, per R8's note). `blog.placeholder` keeps its
      emoji inside the value.
- [ ] `staticData/i18n/es.ts` exports `es`, annotated `Dictionary`, with all 21
      keys in Spanish (D2 copy, neutral `tú` register, no review gate). The only
      Spanish value the spec fixes for this file is
      `a11y.languageSwitcher: 'Idioma'` (R5).
- [ ] `staticData/i18n/translations.ts` exports
      `translations: Record<Locale, Dictionary>` and is the only object in the
      feature indexed by `Locale`.
- [ ] `lib/locale.ts` exports `Locale`, `LOCALES`, `DEFAULT_LOCALE`,
      `LOCALE_COOKIE_NAME` (`'NEXT_LOCALE'`), `localeNames`, `isLocale`,
      `parseLocaleCookie`, `serializeLocaleCookie`, per
      `docs/architecture.md` §2.4. `LOCALES` is a `ReadonlyArray<Locale>` in the
      order `['en-GB', 'es']`, `DEFAULT_LOCALE` is `'en-GB'`.
- [ ] `localeNames` yields exactly `{ 'en-GB': 'English', es: 'Español' }` and is
      therefore identical in both locales — language names stay native, in their
      own spelling, the owner-settled decision behind R9/D6.
- [ ] `lib/locale.ts` imports nothing from `react`, `next`, `components/` or
      `pages/`, and contains no `document` (spec R7; §2.1).
- [ ] `parseLocaleCookie` is exact and case-sensitive and total: it returns
      `es` for `NEXT_LOCALE=es` and `en-GB` for a missing key, `NEXT_LOCALE=fr`,
      `NEXT_LOCALE=ES`, `NEXT_LOCALE=` and ` NEXT_LOCALE= es `, and has no throw
      path. (Its edge cases are exercised end-to-end against the running app in
      I18N-2, where a caller exists.)
- [ ] Deleting any single key from `es.ts` makes `yarn typecheck` fail with
      TS2741 and name that key; adding a key to `es.ts` only makes it fail with
      TS2353 and name the extra key. Both checked, then reverted.
- [ ] No `any`, `as`, `@ts-`, `eslint-disable` or barrel `index.ts` in the four
      new files; every type import is `import type`
      (`verbatimModuleSyntax`).
- [ ] `/`, `/employmentHistory` and `/blogIndex` render as they do today: no
      file imports the new modules, and the built route table is unchanged.

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
node -v                                                    # expect v26.13.1
yarn install --frozen-lockfile
yarn lint                                                  # expect exit 0, no output
yarn typecheck                                             # expect exit 0
yarn format:check                                          # expect exit 0 — the new files are committed formatted
yarn build                                                 # expect green; route table unchanged, all static
git status --porcelain                                     # expect empty after `yarn build`

# shape checks (run from site-nextjs/)
grep -rnE ":\s*any|as any|@ts-|eslint-disable" lib staticData/i18n   # expect no output
grep -rnE "from '(react|next)" lib/locale.ts                         # expect no output
grep -rn "document" lib staticData/i18n                              # expect no output
find lib staticData/i18n -name 'index.ts'                            # expect no output
grep -rn "NEXT_LOCALE" lib staticData/i18n                           # expect exactly one file: lib/locale.ts
grep -c "as const" staticData/i18n/en-GB.ts                          # expect 0

# negative 1: a missing key must fail the typecheck
cp staticData/i18n/es.ts /tmp/es.ts.bak
# delete the `blog` key (or any one key) from es.ts, then:
yarn typecheck                                             # expect NON-ZERO, TS2741 naming 'blog'
cp /tmp/es.ts.bak staticData/i18n/es.ts
yarn typecheck                                             # expect exit 0

# negative 2: an extra key must fail too
# add one extra key to es.ts (same indent level as its siblings), then:
yarn typecheck                                             # expect NON-ZERO, TS2353 naming the extra key
git checkout -- staticData/i18n/es.ts
git diff --exit-code staticData/i18n/es.ts                 # expect empty

# route check: unchanged English, unchanged route table
yarn start & sleep 3
curl -s localhost:3000/ | grep -c 'Nice to meet you, I am Luis'          # expect 1
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/employmentHistory localhost:3000/blogIndex   # expect 200 200
```

---

## I18N-2 — Add the locale provider, the switcher and its header placement

- **Type:** feat
- **Size:** M
- **Estimate:** 3
- **Depends on:** I18N-1
- **Satisfies:** R1, R2, R3, R4 (runtime sync), R5, R6, R11 (no remount),
  R12 (click), R14; spec D4, D6, D8 (sync half), D9, D11;
  `docs/architecture.md` §2.2, §2.3, §2.4, §2.5 (mechanism 3), §3.1, §3.2,
  §3.3 steps 2–4
- **Touch:** `site-nextjs/components/shared/locale/LocaleProvider.tsx` (new),
  `site-nextjs/components/shared/locale/LanguageSwitcher.tsx` (new),
  `site-nextjs/components/shared/locale/LanguageSwitcher.module.css` (new),
  `site-nextjs/components/shared/locale/UnionJackFlag.tsx` (new),
  `site-nextjs/components/shared/locale/SpanishFlag.tsx` (new),
  `site-nextjs/pages/_app.tsx`,
  `site-nextjs/components/shared/layout/header/index.tsx`,
  `site-nextjs/components/shared/layout/header/header.module.css`

**Context**

Architecture steps 2, 3 and 4 as one deliverable, because only together do they
have a criterion a reviewer can check at a route: the provider and the switcher
have no consumer until `Header` renders them, and three of R5's criteria
(exactly one `aria-pressed`, the ≥24×24 hit targets, the 320 px geometry) are
only reachable through the header. `pages/_app.tsx` wraps `Layout` in
`<LocaleProvider>`, so Header, Footer and every page read one `useState<Locale>`
through one hook (R1, §2.2). The cookie is read in a mount effect and written
only from `setLocale`, so the first client render equals the server render and
no hydration warning can occur (R3, §2.4) — the English flash on reload is the
accepted cost (D11), and hiding content until hydration is a rejected
alternative. This is the first user-visible step and it is end-to-end functional
— cookie, state, `aria-pressed`, focus ring — before any copy moves, so a defect
in cookie or ARIA handling is never tangled with a copy migration (§3.3 step 4).
Copy stays English until I18N-4; a language switch here changes `aria-pressed`,
`<html lang>` at runtime and the stored cookie, and nothing else.

> **Recorded delta — visible at 320–999 px, accepted.** Editing
> `header.module.css` costs the brand its size below the existing `1000px`
> query: `.title` becomes `2rem` there and stays `2.5rem` at and above it, so the
> brand renders 208 px of text instead of today's 260 px at **every** width from
> 320 to 999 px — 320 **and** 768, not just the narrow edge. Measured: at 320 px
> the header box is 288 px, the brand needs 260 px and two 28 px targets plus a
> 4 px gap and an 8 px column gap leave nothing
> (`docs/architecture.md` §3.1, §7.1). This is the delta the spec's assumption
> asks to be recorded rather than hidden; it is a deliberate, visible brand
> change, not a defect and not a footnote. No third breakpoint is introduced
> (the existing `1000px` value only), no `vw`/`clamp` font, and the override is
> appended **after** the `.title` base rule, per `css.md` §7.

**Acceptance criteria**

- [ ] `LocaleProvider.tsx` exports `LocaleProvider` (default) and `useLocale`;
      `LocaleContext` is module-private. The value is
      `{ locale, setLocale, messages }` with `messages === translations[locale]`,
      memoised on `[locale, setLocale]`. There is no second context, no
      module-level `let` and no module-level default locale — one consumer API
      (R1, §2.3).
- [ ] `pages/_app.tsx` renders `<LocaleProvider>` outside `<Layout>`; `/`,
      `/employmentHistory` and `/blogIndex` render the same text as before this
      ticket: `main`, `footer` and `header nav` `innerText` identical modulo
      whitespace (R1, §2.2). The header's title row is outside the comparison
      because it gains the switcher's visually-hidden names.
- [ ] The cookie is read only after mount and written only from `setLocale`: a
      fresh browser context on `/` has no `NEXT_LOCALE` key in `document.cookie`
      until a flag is clicked (R2).
- [ ] Click Español on `/`: `document.cookie` contains exactly
      `NEXT_LOCALE=es` and no other key; reload → the Spanish button carries
      `aria-pressed="true"`; a new context seeded with that cookie → Spanish
      button active; after restarting the browser → still Spanish (R2). Copy
      remains English until I18N-4 — that is expected, not a failure.
- [ ] `NEXT_LOCALE=fr` (hand-set) → English, no console error, cookie left
      untouched until the next click; `NEXT_LOCALE=ES` and `NEXT_LOCALE=` behave
      the same (R2, D4).
- [ ] With `document.cookie`'s getter stubbed to throw (Playwright
      `addInitScript`), `/` renders English, no uncaught error appears, and
      clicking Español still switches in memory for the life of the tab (R2).
- [ ] Zero `Hydration failed` / `Text content did not match` console messages on
      `/`, `/employmentHistory` and `/blogIndex` with `NEXT_LOCALE=es`, in `yarn
      dev` (`reactStrictMode: true`, so the mount effect is double-invoked and
      must stay idempotent) and under `yarn start` (R3, §2.6).
- [ ] `document.documentElement.lang` is `es` after clicking Español and
      `en-GB` after clicking English, on all three routes (R4's runtime half,
      §2.5 mechanism 3). `syncDocumentLang` writes only when the value differs.
- [ ] The switcher renders once in `Header`, as the second child of `<header>`
      between the title link and the nav, in grid area `switcher` of the
      `minmax(0, 1fr) auto` first row, right-aligned, present at both
      breakpoints (R5, §3.1).
- [ ] Exactly two `<button type="button">` elements, in the order `LOCALES`
      declares (`en-GB`, `es`) — not hard-coded in the component — with
      accessible names exactly `English` and `Español`, supplied by text
      (visually hidden, so the visible affordance and the name agree) from
      `localeNames`. Language names stay native in both languages (R5, R9, D6).
- [ ] The container is `role="group"` with `aria-label` from
      `messages.a11y.languageSwitcher` (`Language` / `Idioma`); exactly one
      button carries `aria-pressed="true"` at all times and it is the active one
      (R5).
- [ ] Clicking the already-active flag is a no-op: `document.cookie`,
      `history.length` and the page state are unchanged (R5, R12).
- [ ] Tab reaches both buttons; computed `outline-style` on a focused button is
      not `none`, and the ring is `2px solid currentColor` at
      `outline-offset: 2px` — screenshot at 320 and 1280 (R5, `css.md` §10).
- [ ] Both buttons measure at least 24×24 CSS px at 320, 768 and 1280
      (28×28 per §3.2; R5, WCAG 2.5.8).
- [ ] At 320 px, `document.documentElement.scrollWidth <= 320` on all three
      routes; the switcher's and the brand's bounding boxes do not intersect; the
      brand is not clipped (R5).
- [ ] The accepted brand delta holds and is measured: computed `font-size` of
      `.title` is `32px` (`2rem`) at 320 and at 768, `40px` (`2.5rem`) at 1280;
      `.title` keeps `height: 2.5rem`, so the nav row starts at the same
      `y=60` at every width and the nav does not move (§3.1).
- [ ] The nav is untouched: same three links in the same DOM order, active link
      still carrying the active class on each route (R5).
- [ ] Flags are single-file inline SVG components with `viewBox`,
      `aria-hidden="true"` and `focusable="false"`, sized by the button's CSS in
      `rem`, with the flag's own hex fills as the only raw colour in the feature
      (R6, D9, §3.2). No `<img>`, no URL, no emoji, no icon package: the rendered
      button text contains no character in `U+1F1E6–U+1F1FF`, and an
      accessibility snapshot of the switcher shows two buttons and no image
      nodes.
- [ ] `git diff --exit-code site-nextjs/package.json site-nextjs/yarn.lock` is
      empty, and `grep -rnE "flag-icon|flag-icons|country-flag|twemoji|i18next|react-intl|clsx"
      site-nextjs --exclude-dir=node_modules --exclude-dir=.next` returns nothing
      (R14).
- [ ] No `key` tied to the locale: `grep -rn "key={locale}\|key={activeLocale}\|key={currentLocale}"`
      over `site-nextjs` returns nothing. On `/employmentHistory`, selecting two
      chips and then switching language leaves the same two chips selected, in
      the same order, with the same rows visible (R11, §2.2).
- [ ] JavaScript disabled (Playwright `javaScriptEnabled: false`): `/` renders
      English, both buttons are present and inert — a click does nothing (spec
      edge-case table, D1). The `lang` half of that row is proved in I18N-3,
      which sets the static value.
- [ ] `/nope` observation recorded in the PR body: what the default 404 actually
      renders — whether `_app` wraps it, so the switcher is present or not, and
      what `document.documentElement.lang` becomes after mount. No code change
      either way (spec edge-case table). The static `lang` in the served 404 is
      proved in I18N-3.

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
yarn install --frozen-lockfile
yarn lint                                                  # expect exit 0, no output
yarn typecheck                                             # expect exit 0
yarn format:check                                          # expect exit 0
yarn build                                                 # expect green; route table unchanged, all static

# the cookie literal lives in lib/locale.ts only (spec §7.2 reading of R7)
grep -rn "NEXT_LOCALE" pages components lib staticData      # expect only lib/locale.ts
grep -rn "localStorage\|sessionStorage" pages components lib  # expect no output
grep -rn "suppressHydrationWarning" . --exclude-dir={node_modules,.next}   # expect no output
grep -rn "key={locale}\|key={activeLocale}\|key={currentLocale}" . --exclude-dir={node_modules,.next}   # expect no output
git diff --exit-code package.json yarn.lock                 # expect empty
git diff --exit-code next.config.js                         # expect empty
grep -rnE "flag-icon|flag-icons|country-flag|twemoji|i18next|next-i18next|react-intl|@formatjs|clsx" \
  . --exclude-dir={node_modules,.next}                     # expect no output

yarn start & sleep 3
curl -s localhost:3000/ | grep -c 'Nice to meet you, I am Luis'   # expect 1
curl -s -H 'Cookie: NEXT_LOCALE=es' localhost:3000/ | grep -c 'Nice to meet you, I am Luis'  # expect 1 (the server ignores it)
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/{employmentHistory,blogIndex}        # expect 200 200

# then, by hand with Playwright against localhost:3000 (all three routes):
#  1. fresh context, no cookie            -> document.cookie has no NEXT_LOCALE; English button aria-pressed=true
#  2. click Español                       -> cookie "NEXT_LOCALE=es"; documentElement.lang === 'es'
#  3. reload                              -> Spanish button aria-pressed=true (copy still English: expected)
#  4. new context, cookie NEXT_LOCALE=es  -> Spanish button active after mount; console clean
#  5. click English again                 -> cookie NEXT_LOCALE=en-GB; lang === 'en-GB'
#  6. cookie NEXT_LOCALE=fr               -> English, console clean, cookie value unchanged in document.cookie
#  7. addInitScript: Object.defineProperty(document, 'cookie', { get() { throw new Error('blocked') } })
#                                         -> English renders, no uncaught error, clicking Español still flips aria-pressed
#  8. two clicks, then compare            -> location.href and history.length unchanged
#  9. aria-pressed count                  -> exactly 1 "true" at every step
# 10. keyboard Tab                        -> both buttons focusable, outline-style != none, screenshot 320 + 1280
# 11. measure at 320/768/1280             -> each button >= 24x24; scrollWidth <= viewport at 320;
#                                            brand/title font-size 32px at 320 and 768, 40px at 1280; nav at y=60 on all
# 12. click the active flag               -> cookie, history.length and state unchanged
# 13. /employmentHistory, two chips selected, switch -> same two chips, same order, same rows
# 14. javaScriptEnabled: false            -> English text, both buttons, nothing happens on click
# 15. console on all three routes         -> no "Hydration failed", no "Text content did not match"
```

---

## I18N-3 — Declare `<html lang>` statically and set it before paint

- **Type:** feat
- **Size:** S
- **Estimate:** 2
- **Depends on:** I18N-2
- **Satisfies:** R4 (static value and the pre-paint script), R12, R13; spec D8;
  `docs/architecture.md` §2.5 (mechanisms 1 and 2), §2.8, §3.3 step 5, §7.3
- **Touch:** `site-nextjs/pages/_document.tsx` only.

**Context**

The document language is unset today — `pages/_document.tsx:5` renders `<Html>`
with no `lang`, which is the WCAG 3.1.1 failure the spec opens with. Two
mechanisms land here, in this order: `<Html lang="en-GB">` so the static HTML
always carries a correct language on every route, then a dependency-free inline
`next/script` with `strategy="beforeInteractive"` that reads the cookie and sets
`document.documentElement.lang` before first paint, so a returning Spanish
visitor's assistive technology does not start in English (D8). The provider's
runtime sync from I18N-2 stays authoritative and is what this ticket must not
fight: the script's value must not be undone and restored, which is why
`syncDocumentLang` has an equality guard. This is deliberately its own ticket
because it has its own failure mode and its own fallback — if the script warns
at build or demonstrably runs after first paint, it is deleted and the
requirement stands on the static value plus the effect (§2.5). Per §7.3 the
script is re-injected into `<head>` ahead of every Next.js script tag rather than
streamed where it is written, so it may only assume `document.cookie` and
`document.documentElement` exist — `document.body` does not, yet.

**Acceptance criteria**

- [ ] `/`, `/employmentHistory` and `/blogIndex` serve `<html lang="en-GB">`:
      `curl -s … | grep -o '<html[^>]*>'` contains `lang="en-GB"` on all three,
      and the default 404 does too (R4).
- [ ] The pre-paint script is an inline `next/script` with an `id` (the
      `@next/next/inline-script-id` rule is an error), `strategy="beforeInteractive"`,
      a **direct child of `<body>`** — not wrapped in an element or a fragment —
      an IIFE so no identifier leaks, and a `try/catch` that cannot throw (R4,
      §2.5). It touches `document.cookie` and
      `document.documentElement` only, and compares the value against the two
      locale literals before assigning, so nothing attacker-controlled can reach
      the attribute (§2.7).
- [ ] A comment beside the script names `lib/locale.ts` as the source of the
      duplicated `NEXT_LOCALE` constant, and `grep -rn "NEXT_LOCALE"` then
      matches exactly two files: `lib/locale.ts` and `pages/_document.tsx`
      (spec §7.2).
- [ ] With `NEXT_LOCALE=es`, a `MutationObserver` installed before load records
      that `lang` never passes through a value other than `es` — the script's
      value is not undone by hydration and then restored — on all three routes
      (R4).
- [ ] With cookies blocked (getter stubbed to throw), `lang` stays `en-GB` and
      no script error appears (R4).
- [ ] JavaScript disabled (Playwright `javaScriptEnabled: false`): `/` renders
      English from the static HTML with `lang="en-GB"`, and both flags are inert
      — a click does nothing (spec edge-case table, D1). This closes the row
      I18N-2 opened.
- [ ] The script runs before first paint: the recorded `lang` mutation precedes
      `first-contentful-paint` from `performance.getEntriesByType('paint')` in
      Chromium. **Trigger/fallback, per R4:** if `yarn build` emits a warning
      attributable to the `Script`, or the mutation lands after first paint in
      Chromium **or** Firefox, delete the `Script` and its `id`, keep
      `<Html lang="en-GB">` and the provider's runtime sync, and record the delta
      and the measurement in the PR body. The static value and the effect are not
      optional; `suppressHydrationWarning` is not a mitigation (R3).
- [ ] The server still never reads the cookie:
      `curl -s -H 'Cookie: NEXT_LOCALE=es' localhost:3000/employmentHistory`
      returns the English document and `lang="en-GB"` (R12).
- [ ] `yarn build` lists `/`, `/employmentHistory`, `/blogIndex` and
      `/_not-found`, all static, exactly as before; no `pages/api/` directory;
      `next.config.js` unchanged and carrying no `i18n` block (R12, R13).

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
yarn install --frozen-lockfile
yarn lint                                                  # expect exit 0 — the inline-script id rule is satisfied
yarn typecheck                                             # expect exit 0
yarn format:check                                          # expect exit 0
yarn build                                                 # expect green, no next/script warning,
                                                           # route table: /, /employmentHistory, /blogIndex, /_not-found all static

grep -rn "NEXT_LOCALE" pages components lib staticData      # expect exactly lib/locale.ts and pages/_document.tsx
grep -n "i18n" next.config.js                              # expect no output
git diff --exit-code next.config.js                        # expect empty
ls pages/api 2>/dev/null                                   # expect no such directory
grep -rnE "getStaticProps|getServerSideProps|export const dynamic" pages   # expect no output

yarn start & sleep 3
for r in / /employmentHistory /blogIndex /nope; do
  printf '%s ' "$r"; curl -s "localhost:3000$r" | grep -o '<html[^>]*>'
done                                                       # expect lang="en-GB" four times
curl -s -H 'Cookie: NEXT_LOCALE=es' localhost:3000/employmentHistory \
  | grep -c 'Companies I have worked with'                  # expect 1 — the server ignores the cookie

# then by hand with Playwright against localhost:3000, per route:
#  1. addInitScript installing a MutationObserver on documentElement, attributes, attributeFilter ['lang'],
#     recording every new value into window.__langs; then set cookie NEXT_LOCALE=es and load.
#     expect window.__langs to contain only 'es' (no 'en-GB' -> 'es' flip).
#  2. compare the observer's timestamp for that mutation with
#     performance.getEntriesByType('paint') first-contentful-paint startTime:
#     mutation must be earlier. Otherwise apply the R4 fallback above and record it.
#  3. console: zero messages from React or Next on a cold load with NEXT_LOCALE=es.
#  4. cookies blocked (getter throws): lang stays 'en-GB', no error.
#  5. click Español -> lang === 'es'; click English -> 'en-GB'; repeat on all three routes.
#  6. view-source: the script tag sits in <head> ahead of every Next.js script tag (§7.3), with its id.
```

---

## I18N-4 — Move every UI string into the dictionaries

- **Type:** feat
- **Size:** M
- **Estimate:** 3
- **Depends on:** I18N-3
- **Satisfies:** R8 (the six consumer files), R9 (what must not change), R7
  (`useLocale` as the only read path), R3; spec D5, D6;
  `docs/architecture.md` §2.3 (consumers read the hook), §3 implementation map,
  §3.3 step 6
- **Touch:** `site-nextjs/components/shared/layout/index.tsx`,
  `site-nextjs/components/shared/layout/header/index.tsx` (nav labels only),
  `site-nextjs/components/shared/layout/footer/index.tsx`,
  `site-nextjs/pages/index.tsx`, `site-nextjs/pages/blogIndex.tsx`,
  `site-nextjs/components/skillsToFilter/index.tsx`

**Context**

Eighteen of the twenty-one keys — UI chrome, page copy and metadata — resolve
from the active dictionary here; the remaining three (`employmentHistory.startDateLabel`,
`endDateLabel`, `stillWorkingHere`) belong to `WorkHistoryItem` and the history
data and move with them in I18N-5. Each file is self-contained and they are
order-independent among themselves (§3.3 step 6), but they ship as one commit
because R8's observable criterion — no user-visible copy outside
`staticData/i18n/` — is a property of the whole set. English values were copied
verbatim in I18N-1 and must render byte-identically here, typos included; a
"fix" of `profesional` or `independant` while moving them would mix Epic 2 into
this diff and break the parity check (spec Assumptions). Icons, the `-`, the
`&nbsp;` and the inline `<span className="glow">` stay in JSX so a language with
different word order is still expressible (R8), and `next/head` keeps ownership
of the title and description (R8).

**Acceptance criteria**

- [ ] All eighteen keys owned by this ticket resolve from `messages` in the six
      files: `meta.title`, `meta.description`, `nav.*` (3), `footer.*` (3),
      `home.*` (6), `employmentHistory.title`, `employmentHistory.subtitle`,
      `skillsToFilter.heading`, `blog.placeholder`.
- [ ] English rendering of `/`, `/employmentHistory` and `/blogIndex` is
      identical to the pre-change capture of `main`, `footer` and `header nav`
      `innerText`, modulo whitespace (R8). The capture is taken on the branch
      point before any file moves and stored outside the repo, because the
      header's title row gains the switcher's visually-hidden names and is not
      part of the comparison.
- [ ] `grep -rnE "Nice to meet you|Professional Summary|Contact Information|Filter
      working experiences|Link to repository|Made with|Working on it|Intro and
      contact" site-nextjs/pages site-nextjs/components` returns nothing (R8).
      The spec's list also contains `Start date|End date`, which cannot match
      until I18N-5 moves `WorkHistoryItem`; this ticket checks the subset it owns
      and I18N-5 runs the full list.
- [ ] After clicking Español, `document.title` is the Spanish value and
      `meta[name=description]`'s `content` is Spanish, on all three routes;
      `next/head` still owns both in `layout/index.tsx` (R8).
- [ ] On `/` and `/blogIndex` the Spanish rendering contains no English sentence;
      on `/employmentHistory` the h1, subtitle and filter heading are Spanish and
      the only English left is the job content and the two date labels that
      I18N-5 owns (R8 is closed there, not here). The only other identical
      strings in any locale are those R9 lists.
- [ ] Names that do not translate are byte-identical after a switch: the header
      brand and footer attribution (`Luis Richmond` — the substring appears in
      the Spanish header and footer), the five company names, every
      `bulletPoints` chip label, and `localeNames` (`English` / `Español`) (R9).
- [ ] The blog placeholder keeps its emoji in both locales — the emoji is part
      of the value, not markup (R8).
- [ ] `grep -rn "GreenSlate\|Javascript\|SQL Server" site-nextjs/staticData/i18n/es.ts`
      returns nothing: no translated company name or tech label entered the
      Spanish dictionary (R9).
- [ ] Config and shell text that is not copy is untouched: the viewport meta, the
      favicon link, the heart icon, the GitHub link's `href`, and every
      `className` expression are as they were.
- [ ] No file gains a `style`/markup change beyond substituting text; no new
      global selector; no dependency change (`git diff --exit-code package.json
      yarn.lock` empty, R14).

**Verification**

```bash
# from site-nextjs/, Node 26.13.1 — CAPTURE FIRST, at the I18N-3 head, before editing anything
mkdir -p ~/i18n-baseline
yarn build
yarn start & sleep 3
# in Playwright, per route: read innerText of main, of footer and of header nav and save one file per region,
# e.g. ~/i18n-baseline/{root,employmentHistory,blogIndex}-{main,footer,nav}.txt — nine files in total.
# Stored outside the repo (evidence, not an artifact); they are what step 1 below compares against.
kill %1

# then edit the six files, then:
yarn lint                                                  # expect exit 0, no output
yarn typecheck                                             # expect exit 0
yarn format:check                                          # expect exit 0
yarn build                                                 # expect green, route table unchanged
git diff --exit-code package.json yarn.lock                # expect empty

# R8: the copy exists only under staticData/i18n/
grep -rnE "Nice to meet you|Professional Summary|Contact Information|Filter working experiences|Link to repository|Made with|Working on it|Intro and contact" \
  pages components                                          # expect no output
grep -rn "Still working here" . --exclude-dir={node_modules,.next}   # expect staticData/i18n/en-GB.ts and
                                                           # staticData/employmentHistory/workingHistory.ts only (I18N-5 removes the second)
grep -rn "GreenSlate\|Javascript\|SQL Server" staticData/i18n/es.ts  # expect no output

yarn start & sleep 3
curl -s localhost:3000/ | grep -c 'Nice to meet you, I am Luis'      # expect 1 (English unchanged)
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/{employmentHistory,blogIndex}   # expect 200 200

# then by hand with Playwright, each of /, /employmentHistory, /blogIndex:
#  1. English: main/footer/header-nav innerText == ~/i18n-baseline capture, modulo whitespace
#  2. click Español: the visible copy is Spanish; document.title and meta[name=description] are Spanish
#  3. Spanish on / and /blogIndex: no English sentence remains (read the text, not the markup)
#  4. click English again: text returns byte-identically to the capture
#  5. brand, company names and every chip label byte-identical in both languages; "Luis Richmond" present in both
#  6. blog placeholder keeps its emoji in both languages
#  7. console: no hydration warning on any route in either language
```

---

## I18N-5 — Make the employment history data locale-aware

- **Type:** feat
- **Size:** M
- **Estimate:** 3
- **Depends on:** I18N-4
- **Satisfies:** R10, R11, R8 (the three remaining strings and the closing
  criterion), R9 (companies and chips), R7; spec D7, D10;
  `docs/architecture.md` §2.2 (why a locale change cannot remount), §3 rows for
  `workingHistory.ts` / `WorkHistoryItem` / `employmentHistory.tsx`, §3.3 step 7
- **Touch:** `site-nextjs/staticData/employmentHistory/workingHistory.ts`,
  `site-nextjs/components/employmentHistory/WorkHistoryItem/index.tsx`,
  `site-nextjs/pages/employmentHistory.tsx`

**Context**

The one indivisible boundary in the feature. The English sentence `Still working
here` currently lives in the data (`workingHistory.ts:6`) — the concrete symptom
of content and language being entangled — and removing it changes the type that
`WorkHistoryItem` consumes and the React key that `pages/employmentHistory.tsx`
derives from it: the current key is `i.company + i.endDate` (`:49`), which
type-checks with `null` and renders `"GreenSlatenull"` for the current job. The
data shape, its consumer and the key reference each other in all three
directions, so any two-of-three split is a red intermediate state — data alone
fails the consumer's props, consumer alone cannot accept `null`, key-last ships a
wrong key inside a green build. They move together, in one commit. The job copy
stays beside the job (D10) rather than becoming dictionary keys, which makes an
untranslated field a compile error and keeps a job's meaning from changing when
the dictionary is edited; the cost — `Senior Software Engineer` repeated in three
entries — is accepted for locality.

**Acceptance criteria**

- [ ] `workingHistory.ts` exports `type WorkHistoryEntry` and
      `workingHistoryArray: Array<WorkHistoryEntry>` with an explicit annotation
      (`typescript.md` §11): `company: string`, `startDate: string` (raw ISO),
      `endDate: string | null`, `bulletPoints: Array<string>`,
      `position: Record<Locale, string>`,
      `jobDescription: Record<Locale, string>` (R10, D7, D10).
- [ ] GreenSlate carries `endDate: null`; `grep -rn "Still working here"
      site-nextjs` now matches **only** `staticData/i18n/en-GB.ts` (R10, D7).
- [ ] Job titles translate — the owner-settled decision: `position.es` is
      `Ingeniero de Software Senior` for the three Senior roles,
      `Ingeniero de Software` for the Ernst&Young role and
      `Ingeniero de Software Junior` for the Datasoft role; `position.en` keeps
      today's exact strings (`Senior Software Engineer`, `Software Engineer`,
      `Junior Software Engineer`). `jobDescription.es` is Spanish; `jobDescription.en`
      is today's text, `projecst` included.
- [ ] `bulletPoints` appears once per entry, in one array, filtered in one place;
      no per-locale duplicate (R10).
- [ ] `WorkHistoryItem` takes `type WorkHistoryItemProps` (`interface` becomes
      `type`, `string[]` becomes `Array<string>`, `typescript.md` §11) with
      `endDate: string | null`, `position` and `jobDescription` as
      `Record<Locale, string>`; it reads `locale` from `useLocale` to index them;
      `Start date:` / `End date:` come from the dictionary; when
      `endDate === null` the end-date value is
      `messages.employmentHistory.stillWorkingHere` (R10, R8).
- [ ] `pages/employmentHistory.tsx` passes `endDate` through unchanged and its
      React key becomes `i.company + i.startDate` — locale-independent, so a
      language switch cannot remount rows. No `"GreenSlatenull"` appears in the
      DOM (R10).
- [ ] Deleting `es` from one entry's `position` makes `yarn typecheck` fail
      (checked, then reverted) (R10).
- [ ] Dates stay raw ISO strings: `/employmentHistory` shows `2022-12-02` in both
      languages, and `grep -rn "Intl\|toLocaleDateString" site-nextjs` returns
      nothing (R10, spec non-goal).
- [ ] Switching language on `/employmentHistory` changes `position`,
      `jobDescription` and the end-date value only: five `article` elements
      before and after, same order, zero React "unique key" warnings (R10).
- [ ] R11 closes here: select two chips, switch to Español — the same two chips
      remain selected in the same order and the same rows remain visible; switch
      back — the chip set is byte-identical, no chip appears twice; clear all
      chips — all five entries appear in `staticData` order in both languages
      (R11).
- [ ] R8 closes for `/employmentHistory`: after switching, no English sentence
      remains except the strings R9 lists (brand, the five company names, every
      chip label, the language names). The full spec grep passes:
      `grep -rnE "Nice to meet you|Professional Summary|Contact Information|Filter
      working experiences|Start date|End date|Link to repository|Made with|Working
      on it|Intro and contact" site-nextjs/pages site-nextjs/components` returns
      nothing.
- [ ] The list is still filtered from `bulletPoints` only, so chip identity is
      locale-independent and `SkillsToFilter` (`<li onClick>`, Epic 1 D1) is not
      touched (R9, R11).

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
yarn lint                                                  # expect exit 0, no output
yarn typecheck                                             # expect exit 0
yarn format:check                                          # expect exit 0
yarn build                                                 # expect green, route table unchanged

grep -rn "Still working here" . --exclude-dir={node_modules,.next}   # expect only staticData/i18n/en-GB.ts
grep -n "key={i.company + i.startDate}" pages/employmentHistory.tsx  # expect one match
grep -rn "key={i.company + i.endDate}" pages                         # expect no output
grep -rn "Intl\|toLocaleDateString" . --exclude-dir={node_modules,.next}   # expect no output
grep -rnE "Nice to meet you|Professional Summary|Contact Information|Filter working experiences|Start date|End date|Link to repository|Made with|Working on it|Intro and contact" \
  pages components                                          # expect no output (R8 closed)
grep -n "interface WorkHistoryItemProps" components/employmentHistory/WorkHistoryItem/index.tsx  # expect no output
git diff --exit-code package.json yarn.lock                # expect empty

# negative: one missing locale in the data must fail the typecheck
# delete `es: '...'` from one entry's `position`, then:
yarn typecheck                                             # expect NON-ZERO, naming the missing 'es' property
git checkout -- staticData/employmentHistory/workingHistory.ts
yarn typecheck                                             # expect exit 0

yarn start & sleep 3
curl -s localhost:3000/employmentHistory | grep -c 'Still working here'   # expect 1 (English static HTML)
curl -s localhost:3000/employmentHistory | grep -c '2022-12-02'           # expect 1 (raw ISO date)

# then by hand with Playwright on /employmentHistory:
#  1. English: five <article> elements; GreenSlate's end date reads "Still working here"; no "GreenSlatenull" in document.body.innerText
#  2. click Español: positions read "Ingeniero de Software Senior" / "Ingeniero de Software" / "Ingeniero de Software Junior";
#     descriptions are Spanish; the end-date label is Spanish; dates unchanged; still five articles, same order
#  3. console: zero "Each child in a list should have a unique key" warnings across both languages
#  4. select two chips, switch to Español: same two chips, same order, same visible rows
#  5. switch back to English: chip set byte-identical, no duplicates; clearing chips shows all five in staticData order
#  6. Spanish text: no English sentence except brand, company names and chip labels
```

---

## I18N-6 — Document where the copy lives

- **Type:** docs
- **Size:** S
- **Estimate:** 1
- **Depends on:** I18N-5
- **Satisfies:** R15; `docs/architecture.md` §3.3 step 8, §5 (the constraints
  Phase 2 must keep)
- **Touch:** `AGENTS.md` only — this is the only ticket in the set with no file
  under `site-nextjs/`.

**Context**

R15 exists so a new contributor can find the string they want to change without
reading code, and so the next phase does not undo the design by accident. It
lands last because it describes what exists: the two folders, the fact that the
toggle is client-side and cookie-backed with no URL or server involvement, that
`<html lang>` follows the choice, and that `en-GB` is the source of the key set —
the last point being the one that keeps R7's compile-time guarantee intact. It
also gains the pointer to `docs/architecture.md`, which is where the type flow,
the header measurement and the Phase 2 constraints live; `AGENTS.md` states the
shape, the architecture file states why. No code moves and no command changes, so
the diff is prose only.

**Acceptance criteria**

- [ ] `AGENTS.md` §Architecture names `staticData/i18n/` — copy, one file per
      locale, `en-GB` is the source of the key set — and
      `components/shared/locale/` — provider, `useLocale` hook, switcher, flags
      (R15).
- [ ] `AGENTS.md` states that the language toggle is client-side and
      cookie-backed (`NEXT_LOCALE`, `path=/`, `SameSite=Lax`, one year) with no
      URL, no redirect and no server involvement, and that `<html lang>` follows
      the choice — static `en-GB` in the served HTML, synced at runtime (R15).
- [ ] `AGENTS.md` §Stack `Data` row reflects that translations live beside the
      other typed content in `staticData/`, next to the existing "literal TS
      arrays — no DB, no API" statement (R15).
- [ ] It names `lib/locale.ts` as the framework-free home of `Locale`,
      `parseLocaleCookie` and friends, and says the dictionaries must stay plain
      data so the App Router port does not rewrite them (R15, architecture §5
      items 2 and 8).
- [ ] `AGENTS.md` gains a pointer to `docs/architecture.md` in §Architecture, and
      no sentence that was true before this ticket is left false: the Commands
      table, the pinned versions and the Definition of done are unchanged.
- [ ] Prose only: `git show --stat` lists `AGENTS.md` and nothing else; no code
      comment is the deliverable; no changelog is appended to the architecture
      file.

**Verification**

```bash
# from the repo root
git show --stat HEAD                                       # expect AGENTS.md only, no site-nextjs/
grep -n "staticData/i18n" AGENTS.md                        # expect at least one match, naming en-GB as the key-set source
grep -n "components/shared/locale" AGENTS.md               # expect at least one match
grep -n "NEXT_LOCALE" AGENTS.md                            # expect at least one match
grep -n "architecture.md" AGENTS.md                        # expect at least one match
grep -n "i18n" AGENTS.md                                   # read each hit: no claim about routes, URLs or the server
grep -n "Data" AGENTS.md                                   # the §Stack row mentions translations in staticData/

# the gate still holds, unchanged, because no code moved
cd site-nextjs
yarn install --frozen-lockfile
yarn lint && yarn typecheck && yarn format:check && yarn build   # expect exit 0 each, route table unchanged
yarn start & sleep 3
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/{,employmentHistory,blogIndex}   # expect 200 200 200
```

---

## Deliberately not ticketed

Each of these is out of this set by decision, not by omission. None of them is a
dependency of a ticket above, and none may be smuggled into one.

- **Vitest coverage of `lib/locale.ts`** (`parseLocaleCookie`, `isLocale`,
  `serializeLocaleCookie`, `localeNames`). Epic 1 Phase 3 adds the runner; the
  spec forbids a requirement that depends on one, and I18N-1 writes the
  functions string-in/string-out so `lib/locale.test.ts` can be added later
  without touching them (`docs/architecture.md` §2.9, §5 item 5).
- **The App Router port** (`pages/` → `app/`, Epic 1 Phase 2). The feature is
  built to survive it — plain React context, plain-data dictionaries, no
  framework import in `lib/locale.ts`, `NEXT_LOCALE` named for a future
  server-side read — but the port itself is Epic 1's ticket, and its `<html
  lang>` mechanism must be chosen deliberately rather than copied
  (`docs/architecture.md` §5 item 3).
- **Per-language URLs, `hreflang`, per-language metadata and SEO.** Dropped by
  D1; the accepted cost is that crawlers only ever index the English server
  HTML. Adding them later means re-expressing the toggle as routes, which is a
  new spec.
- **A Spanish copy review.** Dropped by D2: the owner supplies the copy, there is
  no sign-off gate, and an awkward phrase is a one-file content fix. No ticket
  here creates a review step.

Also outside this set, recorded so the gaps are visible rather than implied: a
custom `pages/404.tsx` to translate the 404 (out of scope — the default renders
`lang="en-GB"` and has nothing user-authored to translate), cross-tab language
sync, a language-preference page, `Accept-Language` negotiation, RTL and a third
locale, locale-aware date formatting, and accessible names for the icon-only
contact links on `/` (Epic 1 D4; those names are brand names and would not be
translated anyway).
