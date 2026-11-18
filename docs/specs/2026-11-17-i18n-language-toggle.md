# Spec: i18n — British English / Spanish in-page language toggle

- **Status:** draft — D1–D3 fixed by the owner; D4–D11 proposed here, reviewable
- **Owner:** Luis Richmond
- **Ticket(s):** derived by the planner from this spec; none exist yet
- **Date:** 2026-11-17
- **Supersedes:** the `i18n` entry in the non-goals of
  `2026-11-16-epic-1-foundation.md`, for i18n only. Nothing else in Epic 1 is
  amended.

## Problem

The site has exactly one language and no seam to add a second.

- **Every user-visible string is a literal inside JSX**, spread over eight
  files: `layout/index.tsx` (title, meta description), `header/index.tsx`
  (brand + three nav labels), `footer/index.tsx` (sentence + link text),
  `pages/index.tsx` (h1, two paragraphs, two headings),
  `pages/employmentHistory.tsx` (h1, subtitle),
  `components/skillsToFilter/index.tsx`
  (filter heading), `components/employmentHistory/WorkHistoryItem/index.tsx`
  (`Start date:` / `End date:` labels), `pages/blogIndex.tsx` (placeholder).
  A Spanish visitor gets English, and there is no place to put a Spanish
  version without copying each component.
- **Content and language are entangled in the data.** The current job's end
  date is stored as the English sentence `Still working here`
  (`staticData/employmentHistory/workingHistory.ts:6`), and all five
  `position` / `jobDescription` values are English prose. Those are content,
  not UI, so a dictionary alone cannot fix them.
- **The document language is unset.** `pages/_document.tsx:5` renders `<Html>`
  with no `lang`, so assistive technology and translation tooling guess. That is
  a WCAG 3.1.1 (Language of Page) failure the site has today.
- **There is no i18n scaffold to reuse or undo.** No source file references a
  locale (`grep -rn "locale\|i18n" site-nextjs --include=*.ts --include=*.tsx`
  returns nothing; the only match in the tree is `"i18n": null` in `.next/`
  build output). Nothing in the app assumes a language, and nothing
  helps one. `pages/` and `components/` contain zero `aria-*`, `role=` and
  `alt=` attributes and zero images, so the switcher below also introduces the
  first ARIA in the codebase — it must be right the first time, because there is
  no test runner to catch it.

## Goal

Both languages ship, switchable from two flags in the top right of the header,
with the choice remembered, `<html lang>` correct, English unchanged
byte-for-byte, and the whole thing small enough to move to the App Router in
Epic 1 Phase 2 without being rewritten.

## Non-goals

- **Spanish regional variants.** One `es`. No `es-419` / `es-ES` distinction, no
  dialect selection.
- **Locale-aware date formatting.** `startDate` / `endDate` stay raw ISO strings
  (`2022-12-02`) rendered as they are today. No `Intl`, no month names, no
  "present".
- **RTL / any third language.** No `dir` handling beyond leaving the default.
- **Locale negotiation.** `Accept-Language` is ignored; the server never
  detects, redirects or varies on language.
- **Translated URLs or slugs.** No `/es/...`, no `[locale]` segment, no
  `next.config.js` `i18n` block, no `hreflang`, no per-language sitemap.
- **Translating tech names.** Every `bulletPoints` value (`Javascript`,
  `Typescript`, `.Net`, `SQL Server`, `Microservices`, `CSS`, `Azure`, `React`,
  `.NetCore`, `AWS`, `Vue`) stays identical in both locales, including the
  misspelt `.NetCore`.
- **Blog content.** `/blogIndex` keeps its placeholder; only the placeholder
  sentence is translated.
- **Language auto-detection** of any kind, including a "best guess" default.
- **Any new dependency.** No `i18next`, `next-i18next`, `react-intl`,
  `@formatjs/*`, `clsx`, no flag-icon package.
- **Copy editing.** English typos (`profesional`, `independant`, `projecst`)
  move verbatim; Epic 2 owns them. Spanish copy is unreviewed by decision (D2) —
  there is no proofreading gate and this spec does not invent one.
- **Accessible names for the icon-only contact links** on `/`. Epic 1 D4
  deferred them; they are brand names anyway, so if they are ever named those
  names are not translated.
- **Cross-tab language sync.** Two open tabs may disagree until one reloads.
- **A settings page, a language preference in the URL, or a third locale.** The
  layout must not preclude them; nothing is built for them.
- **Any test that needs a runner.** None exists (Epic 1 Phase 3).

## Relationship to Epic 1

- Epic 1 (`2026-11-16-epic-1-foundation.md`) lists i18n as a non-goal. **This
  spec supersedes that entry for i18n only**; the rest of Epic 1 stands. Where
  the two touch, this spec defers: content typos (Epic 1 non-goals), icon-link
  a11y (Epic 1 D4), skill-chip a11y (`<li onClick>`, Epic 1 D1), breakpoint
  normalisation (Epic 1 D2), `.mainWHI` at 320px (Epic 1 D4), and prettier
  (Epic 1 R16, which is already configured in `package.json`).
- **This feature must survive Epic 1 Phase 2** (`pages/` → `app/`, R5). That
  forbids anything pages-router-specific in the feature: the provider is plain
  React context with no `next/router` use, the dictionaries are plain TS with no
  React import, `lib/locale.ts` is framework-free, and the cookie name follows
  Next's own convention so `app/[locale]` (if ever adopted) can read the
  existing preference. Epic 1's Phase 2 ticket must keep the feature green; this
  spec does not do the migration.

## Requirements

### R1 — One locale provider, above every page, default `en-GB`

A single provider owns the active locale and exposes it, with the active
dictionary, through one hook. It wraps `Layout` in `pages/_app.tsx`, so Header,
Footer and all three routes read the same state. The default is `en-GB` and must
be reachable without any stored state. `_document.tsx` renders once on the
server, outside the React tree, and must not contain the provider, the hook or
the cookie logic.

**Acceptance criteria**

- [ ] `pages/_app.tsx` renders `<LocaleProvider>` outside `<Layout>`; the hook
      resolves inside every page, Header and Footer with no module-level
      fallback.
- [ ] `grep -rnE "Provider|useLocale|useContext|document\." site-nextjs/pages/_document.tsx` returns nothing except the R4 pre-paint script, which touches
      `document` directly and nothing else.
- [ ] A fresh browser profile with no cookies renders `en-GB` on all three
      routes.
- [ ] The provider has one consumer API. A second, parallel way to read the
      locale (a duplicate context, a module-level `let`) does not exist.

### R2 — The choice persists across reloads and browser restarts

The choice is stored in the cookie `NEXT_LOCALE` with `path=/`,
`SameSite=Lax`, and a one-year `max-age` (D4). It is read once after mount and
written only as the result of a user action. An unknown value falls back to
`en-GB` without throwing and without rewriting the cookie. When cookies are
unavailable the page still switches for the life of the tab and never crashes.

**Acceptance criteria**

- [ ] Click Español → `document.cookie` contains `NEXT_LOCALE=es` and no other
      key is written; reload → Spanish; quit and reopen the browser → Spanish.
- [ ] `NEXT_LOCALE=fr` (hand-edited) → English, no console error, cookie left
      untouched until the next click.
- [ ] With `document.cookie`'s getter stubbed to throw (Playwright
      `addInitScript`), the page renders English and no uncaught error appears.
- [ ] `grep -rn "localStorage\|sessionStorage" site-nextjs/pages site-nextjs/components site-nextjs/lib` returns nothing.
- [ ] The cookie is not written on mount: a first visit has no `NEXT_LOCALE`
      key until a flag is clicked.

### R3 — No hydration mismatch; the English flash is accepted

The server HTML is English, always. The first client render must equal the
server render, so the cookie is **not** read during render, in a `useState`
initializer, or in any module top-level code. It is read after mount, and the
resulting locale change is a normal post-hydration update. The accepted
consequence: a returning Spanish visitor sees English for the first paint, then
Spanish. A mitigation that hides content until hydration is explicitly rejected
— it trades a text flash for a blank flash and is worse with JS off (D11).

**Acceptance criteria**

- [ ] Returning `es` visitor: zero `Hydration failed` or
      `Text content did not match` warnings in the console on `/`,
      `/employmentHistory`, `/blogIndex`.
- [ ] `curl -s localhost:3000/` is English with and without a
      `Cookie: NEXT_LOCALE=es` request header.
- [ ] The post-hydration switch to Spanish completes without a visible layout
      shift in the header or nav.
- [ ] `grep -rn "suppressHydrationWarning" site-nextjs` returns nothing. Using
      it is a defect, not a fix.

### R4 — `<html lang>` follows the locale, statically and at runtime

`pages/_document.tsx` renders `<Html lang="en-GB">`, so static HTML always
carries a correct language. The provider keeps `document.documentElement.lang`
equal to the active locale. So that a returning Spanish visitor's assistive
technology does not start in English, a **dependency-free** inline script in
`_document.tsx` (`next/script`, `strategy="beforeInteractive"`) reads the cookie
and sets the attribute **before first paint** (D8). The script is ~120 bytes,
wrapped in `try/catch`, and cannot throw.

**Acceptance criteria**

- [ ] `curl -s localhost:3000/ | grep -o '<html[^>]*>'` → contains
      `lang="en-GB"`.
- [ ] After clicking Español, `document.documentElement.lang === 'es'`; after
      English, `'en-GB'`. On all three routes.
- [ ] Reload with `NEXT_LOCALE=es`: a `MutationObserver` on
      `document.documentElement` records that `lang` never passes through a
      value other than `es` (the pre-paint script's value is not undone by the
      hydration effect and then restored).
- [ ] With cookies blocked, `lang` stays `en-GB` and no script error appears.
- [ ] **Trigger/fallback:** if `next/script` in `_document` produces a build
      warning, or the script demonstrably runs after first paint in Chromium or
      Firefox, remove the script, keep the runtime sync, and record the delta in
      the ticket. The static `lang="en-GB"` and the effect are not optional.

### R5 — Switcher: two real flag buttons, top right, keyboard and AT complete

`Header` renders the switcher once, visually in the top right of the header box.
It is exactly two `<button type="button">` elements, in the order `en-GB`, `es`.
Accessible names are exactly `English` and `Español`, supplied by text (visible
or visually hidden) so the accessible name matches the visible affordance.
Language names are not translated (D6). The active language carries
`aria-pressed="true"` and the other `aria-pressed="false"`; exactly one is true
at any time. The container is `role="group"` with an `aria-label` from the
dictionary (`a11y.languageSwitcher`, "Language" / "Idioma"). `:focus-visible` has
a visible ring (`outline: 2px solid currentColor; outline-offset: 2px`), never
`outline: none` without a replacement. Hit targets are at least 24×24 CSS px
(WCAG 2.5.8 AA). Clicking the already-active flag is a no-op: no cookie write,
no history entry, no state change.

Layout: the header is a 2-row grid with areas `'title'` / `'links'`
(`header.module.css:44-57`); the switcher becomes a grid item in the first row,
aligned to the header's right edge, and is present at both breakpoints. Editing
`grid-template-areas`/`grid-template-columns` for this is permitted; the nav's
own grid (`repeat(4, auto)`, DOM order `/`, `/employmentHistory`,
`/blogIndex`) and active-link behaviour are not to be changed.

**Acceptance criteria**

- [ ] Playwright `getByRole('button', { name: 'English' })` and
      `getByRole('button', { name: 'Español' })` each match exactly one element
      on `/`, `/employmentHistory`, `/blogIndex`, in both languages.
- [ ] Exactly one `aria-pressed="true"` exists at all times; after clicking
      Español it is the Spanish button.
- [ ] Tab reaches both buttons; `:focus-visible` screenshot at 320 and 1280
      shows a ring; computed `outline-style` on a focused button is not `none`.
- [ ] Both buttons measure ≥ 24×24 CSS px at 320, 768, 1280.
- [ ] At 320px `document.documentElement.scrollWidth <= 320` on all three
      routes; the switcher's and brand's bounding boxes do not intersect; the
      brand is not clipped (`overflow: hidden` on a text container that cuts it
      is a defect).
- [ ] The nav renders the same three links in the same order and the active link
      still carries the active class on each route.
- [ ] Clicking the active flag leaves `history.length`, the cookie and the page
      state unchanged.

### R6 — Flags are hand-authored inline SVG components

One single-file component per flag (`PascalCase.tsx`), returning `<svg>` with a
`viewBox`, `aria-hidden="true"` and `focusable="false"`, sized by the button's
CSS in `rem`. No `<img>`, no URL, no emoji, no icon package. Flag fills use the
flag's own hex values — the only raw colour permitted in this feature, because
they are a graphic, not theme tokens (D9). Emoji flags are rejected outright:
they do not render on Windows Chrome.

**Acceptance criteria**

- [ ] `grep -rnE "flag-icon|flag-icons|country-flag|twemoji" site-nextjs` returns
      nothing; `git diff -- package.json yarn.lock` empty (R14).
- [ ] No regional-indicator emoji pair in the switcher: the rendered button text
      contains no characters in `U+1F1E6–U+1F1FF`.
- [ ] Accessibility snapshot of the switcher contains two buttons and no image
      nodes; each `<svg>` has `aria-hidden="true"`.
- [ ] Both flags render crisply (no scale artefacts) and stay inside their
      button at 320, 768, 1280.

### R7 — Translation content is typed content, and a missing key fails the build

One dictionary per locale in `staticData/i18n/`, which `typescript.md` §2
defines as "typed, read-only content" and §11 requires to be an exported const
with an explicit type (D5):

| File | Exports |
| --- | --- |
| `staticData/i18n/en-GB.ts` | `enGB` (the source dictionary) and the derived `Dictionary` type |
| `staticData/i18n/es.ts` | `es`, annotated `Dictionary` |
| `staticData/i18n/translations.ts` | `translations: Record<Locale, Dictionary>` |

The key set is defined once, by `en-GB`. `es` is annotated with the type derived
from it, so **a missing key is a compile error** and an extra key is a compile
error. `lib/locale.ts` holds the framework-free pieces — `Locale`, `LOCALES`,
`DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`, `localeNames`, `isLocale`,
`parseLocaleCookie` — with no React, `next` or feature imports (`typescript.md`
§2). No `index.ts` barrel anywhere in the feature (`typescript.md` §2).

**Acceptance criteria**

- [ ] Deleting any single key from `es.ts` makes `yarn typecheck` fail and name
      that key (checked, then reverted before commit).
- [ ] Adding a key to `es.ts` only makes `yarn typecheck` fail.
- [ ] `translations` is only indexed by a value typed `Locale`; no `any`, no
      `as`, no `@ts-` anywhere in the feature. A
      `grep -rnE ":\s*any|as any|@ts-"` over `staticData/i18n`,
      `lib/locale.ts` and `components/shared/locale` returns nothing.
- [ ] `lib/locale.ts` imports nothing from `react`, `next`, `components/` or
      `pages/`; no file under `staticData/i18n/` imports React or returns JSX.
- [ ] `grep -rn "cookie" site-nextjs/pages site-nextjs/components` shows the
      cookie name only as `LOCALE_COOKIE_NAME` imported from `lib/locale.ts`
      (plus the R4 script literal, which cannot import).

### R8 — Every user-visible string switches

All strings in the table resolve from the active dictionary. English values are
copied **verbatim** from today's JSX, typos included; nothing is rewritten while
being moved.

| Key | Today | English value |
| --- | --- | --- |
| `nav.intro` | `header/index.tsx:25` | `Intro and contact Info` |
| `nav.employmentHistory` | `header/index.tsx:26` | `Employment History` |
| `nav.blog` | `header/index.tsx:27` | `Blog` |
| `footer.madeWith` | `footer/index.tsx:8` | `Made with` |
| `footer.byAuthor` | `footer/index.tsx:12` | `by Luis Richmond -` |
| `footer.repositoryLink` | `footer/index.tsx:14` | `Link to repository` |
| `home.title` | `pages/index.tsx:9` | `Nice to meet you, I am Luis` |
| `home.intro` | `pages/index.tsx:11-15` | `I am a problem-solver … independant consultant for several companies.` |
| `home.summaryHeading` | `pages/index.tsx:19` | `Professional Summary` |
| `home.summary` | `pages/index.tsx:21-22` | `I have a strong background in software development, …` |
| `home.contactHeading` | `pages/index.tsx:26` | `Contact Information` |
| `employmentHistory.title` | `pages/employmentHistory.tsx:22` | `Employment History` (trailing space dropped — whitespace-only) |
| `employmentHistory.subtitle` | `pages/employmentHistory.tsx:23` | `Companies I have worked with and the technology stacks I have used.` |
| `skillsToFilter.heading` | `skillsToFilter/index.tsx:35` | `Filter working experiences by:` |
| `employmentHistory.startDateLabel` | `WorkHistoryItem/index.tsx:27` | `Start date:` |
| `employmentHistory.endDateLabel` | `WorkHistoryItem/index.tsx:27` | `End date:` |
| `employmentHistory.stillWorkingHere` | `workingHistory.ts:6` | `Still working here` |
| `blog.placeholder` | `pages/blogIndex.tsx:4` | `Working on it 😉` |
| `meta.title` | `layout/index.tsx:16` | `Lalrg's site` |
| `meta.description` | `layout/index.tsx:19` | `My profesional story, information to contact me, and some blog entries(coming soon)` |
| `a11y.languageSwitcher` | new | `Language` |

The five `position` and five `jobDescription` strings are translated too, but
they are content and live in `staticData/employmentHistory/workingHistory.ts`
per R10, not in the dictionary. Sentence assembly keeps the icon, the `-` and
the `&nbsp;` in JSX while the dictionary supplies the words, so a language with
different word order is still expressible.

**Acceptance criteria**

- [ ] `grep -rnE "Nice to meet you|Professional Summary|Contact Information|Filter working experiences|Start date|End date|Link to repository|Made with|Working on it|Intro and contact" site-nextjs/pages site-nextjs/components` returns nothing — these strings exist only under `staticData/i18n/`.
- [ ] English rendering of `/`, `/employmentHistory`, `/blogIndex` is identical
      to a pre-change `innerText` capture, modulo whitespace.
- [ ] After clicking Español, `document.title` is the Spanish value and
      `meta[name=description]`'s `content` is Spanish — `next/head` still owns
      both (`layout/index.tsx`).
- [ ] Spanish rendering contains no English sentence. The only identical strings
      are those listed in R9.
- [ ] The blog placeholder keeps its emoji in both locales (the emoji is part of
      the value, not markup).

### R9 — Names that do not translate, stated explicitly

`Luis Richmond` (header brand and footer attribution), the five `company`
values, every `bulletPoints` tech label, and the two language names are the same
in both locales. Rationale: proper nouns and product names; translating tech
labels would break chip matching (R11) and make the same skill unfindable in one
language. Language names are not translated because a language name written in a
language you cannot read is useless (D6).

**Acceptance criteria**

- [ ] Switching language leaves the brand text, the five company names and every
      chip label byte-identical; the substring `Luis Richmond` appears in the
      Spanish header and footer.
- [ ] `localeNames` yields `English` / `Español` identically in both locales.
- [ ] The Spanish dictionary contains no translated company name or tech label
      (`grep` for `GreenSlate`, `Javascript`, `SQL Server` in `es.ts` returns
      nothing).

### R10 — Working history: one entry per job, language per field

`staticData/employmentHistory/workingHistory.ts` exports
`type WorkHistoryEntry` and `workingHistoryArray`, an exported const with an
explicit `Array<WorkHistoryEntry>` type (`typescript.md` §11). Fields:

| Field | Type | Translated |
| --- | --- | --- |
| `company` | `string` | no |
| `startDate` | `string` (ISO, raw) | no |
| `endDate` | `string \| null` — `null` means the job is current | no |
| `bulletPoints` | `Array<string>`, one occurrence per entry | no |
| `position` | `Record<Locale, string>` | yes |
| `jobDescription` | `Record<Locale, string>` | yes |

The English sentence `Still working here` leaves the data (D7). When
`endDate === null` the item renders `employmentHistory.stillWorkingHere` as the
end-date value. The React key is derived from locale-independent fields only
(`company` + `startDate`), so a language switch cannot remount rows.

**Acceptance criteria**

- [ ] `grep -rn "Still working here" site-nextjs` matches only
      `staticData/i18n/en-GB.ts`; GreenSlate's entry has `endDate: null`.
- [ ] `workingHistoryArray` carries an explicit `Array<WorkHistoryEntry>`
      annotation; deleting `es` from one entry's `position` makes the typecheck
      fail (checked, reverted).
- [ ] `bulletPoints` appears once per entry; no per-locale duplicate of any
      array.
- [ ] English output still shows raw ISO dates (`2022-12-02`); `grep -rn "Intl\|toLocaleDateString" site-nextjs` returns nothing.
- [ ] Switching language changes `position`, `jobDescription` and the end-date
      value only; no row is added, removed, reordered or remounted (React key
      warning count stays zero).

### R11 — Filtering and page state are unaffected by a language switch

`allSkills` and row matching derive from `bulletPoints` only, so they are
locale-independent. The selected-chips state stays in
`pages/employmentHistory.tsx`, and a language change must not reset, reorder or
duplicate it. The provider must not remount its subtree on locale change (no
`key={locale}` on a wrapper).

**Acceptance criteria**

- [ ] Select two chips on `/employmentHistory`, click Español: the same two
      chips remain selected, in the same order, and the same rows remain
      visible.
- [ ] Switch back to English: identical set again; no chip appears twice; the
      chip set is byte-identical in both languages.
- [ ] `grep -rn "key={locale}\|key={activeLocale}\|key={currentLocale}" site-nextjs` returns nothing.
- [ ] Clearing all chips shows all five entries in both languages, in the same
      `staticData` order as today.

### R12 — No URL change, no server-side locale

The switch is in-page only (D1). Clicking a flag changes no URL, query or
history entry. The cookie is never read on the server, no route varies by
language, and `next.config.js` gains no `i18n` block.

**Acceptance criteria**

- [ ] After toggling twice, `location.href` and `history.length` are unchanged;
      browser Back leaves the route rather than reverting the language.
- [ ] `grep -n "i18n" site-nextjs/next.config.js` returns nothing;
      `git diff -- site-nextjs/next.config.js` is empty.
- [ ] `grep -rnE "router\.locale|Accept-Language|accept-language|getServerSideProps" site-nextjs/pages site-nextjs/components site-nextjs/lib` returns nothing.
- [ ] `curl -s -H 'Cookie: NEXT_LOCALE=es' localhost:3000/employmentHistory`
      returns English text and `lang="en-GB"` — proof the server never branches
      on it.

### R13 — Every route stays statically rendered

No API routes, no SSR-only data, no server locale detection; the route table is
unchanged and still all-static.

**Acceptance criteria**

- [ ] `yarn build` lists `/`, `/employmentHistory`, `/blogIndex`, `/_not-found`
      and marks all four static, exactly as before.
- [ ] `grep -rnE "getStaticProps|getServerSideProps|export const dynamic" site-nextjs/pages` returns nothing.
- [ ] No `pages/api/` directory exists.

### R14 — No new dependency

**Acceptance criteria**

- [ ] `git diff -- site-nextjs/package.json site-nextjs/yarn.lock` is empty.
- [ ] `grep -nE "i18next|next-i18next|react-intl|@formatjs|clsx|flag-icon|country-flag" site-nextjs/package.json` returns nothing.
- [ ] `yarn install --frozen-lockfile` output adds no package line.

### R15 — Docs record where copy lives

`AGENTS.md` must let a new contributor find the string they want to change
without reading code.

**Acceptance criteria**

- [ ] `AGENTS.md` §Architecture names `staticData/i18n/` (copy, one file per
      locale, `en-GB` is the source of the key set) and
      `components/shared/locale/` (provider + hook).
- [ ] `AGENTS.md` states the toggle is client-side and cookie-backed with no URL
      or server involvement, and that `<html lang>` follows the choice.
- [ ] `AGENTS.md` §Stack `Data` row reflects that translations live beside the
      other typed content in `staticData/`.

## Edge cases and failure behaviour

| Situation | Expected behaviour |
| --- | --- |
| First visit, no cookie | `en-GB`; no cookie written until the visitor picks a language |
| Returning visitor, cookie `es` | Static HTML and first paint English, then Spanish (R3); `<html lang>` already `es` if the R4 script lands |
| Cookie present but unknown (`fr`, empty, `ES`, padded whitespace) | `parseLocaleCookie` returns `en-GB`, exactly-matched and case-sensitive; no throw, no rewrite (D4) |
| `document.cookie` throws or is unavailable (blocked cookies, hardened private mode) | Read yields `en-GB`; write silently fails; the page still switches in memory for that tab; no uncaught error (R2) |
| JavaScript disabled | English renders from static HTML with `lang="en-GB"`; both flag buttons render but are inert — nothing happens on click. Documented, not fixed (D1: without routes there is no server-side locale) |
| Selected chips across a language switch | Selection, order and visible rows unchanged (R11) |
| Language switched twice | Back to the original; identical output, one cookie, no history entry, no duplicated state |
| Hydration mismatch | Must not happen (R3); `suppressHydrationWarning` is a defect |
| Browser back/forward | No history entry is created; Back navigates rather than reverting language |
| Two tabs open | Cookie is shared; the other tab keeps its language until reloaded (out of scope) |
| Long Spanish strings (filter heading, footer sentence, intro) | Wrap or reflow; no horizontal scroll at 320; header may grow taller; clipped text is a defect |
| `position` long in Spanish at 320px | Card content wraps; `.mainWHI` keeps its current width and Epic 1 D4's known overflow is not made worse |
| Screen reader mid-page when the language changes | `lang` switches, so the AT may re-announce with a new voice; expected and accepted |
| Unknown route `/nope` | Next's default 404 still renders with `lang="en-GB"`; if `_app` is bypassed there is no switcher and nothing user-authored to translate. Capture the actual observation in the ticket |
| Unauthorized / duplicate request / timeout / concurrency | N/A: no server, no auth, no async, no mutable shared state beyond one cookie. Recorded so the row is not silently skipped |

## Constraints

- Next 16.4.6, **pages router**, Node 26.13.1, yarn classic 1.22.22. Every route
  static. No API routes, no SSR-only data, no server locale detection.
- **No new dependency**, and no change to `yarn.lock`.
- **CSS Modules only** (`docs/styling.md`, `css.md` §1): one module per component,
  no new global selectors, no component styling in `styles/global.css`, media
  queries after the base rule they modify (`css.md` §7).
- **Breakpoints:** new CSS reuses the header module's existing `1000px` query.
  Do not introduce a third breakpoint value; normalising to 768/1024 is Epic 1
  D2.
- **Colour:** no raw hex in a module — use `currentColor`, inherited values and
  existing `:root` tokens where present. The flag SVGs' own fills are the sole
  exception (D9).
- **TypeScript** strict as configured, including `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` and `verbatimModuleSyntax` (`import type` for
  types). Missing translation key = compile error, never a runtime blank. No
  `any`, `as`, `@ts-`, or new `eslint-disable`.
- **`css.md` §10:** interactive elements are real `<button>` elements, never
  `div` + `onClick`; `:focus-visible` is styled, never removed.
- **Verification without a runner:** `yarn lint`, `yarn typecheck`,
  `yarn build`, `yarn format:check`, `curl`, and Playwright at 320 / 768 / 1280.
  No requirement may depend on Vitest. `lib/locale.ts` is written as pure
  string-in/string-out so Epic 1 Phase 3 can add `lib/locale.test.ts` without
  touching it.
- **Migratable to the App Router:** the feature uses no pages-router API. The
  provider is plain React context, the dictionaries are plain data, and
  `lib/locale.ts` imports no framework.

## Decisions

D1–D3 are the owner's, recorded, not open for re-litigation. D4–D11 are this
spec's proposals and are reviewable.

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | **No URL change.** The toggle is in-page and client-side: no `next.config.js` `i18n` block, no `/es/...` routes, no locale prefix, no locale redirect. | Epic 1 Phase 2 migrates `pages/` → `app/`, so pages-router i18n would have to be re-expressed as `app/[locale]/…` and re-paid; an in-page toggle survives the migration. Accepted cost: no per-language URLs, no per-language SEO or `hreflang`, and search engines only ever index the English server HTML. |
| D2 | The owner supplies the Spanish copy with **no review step**; no human sign-off gate. | The alternative is a blocker with no owner. Risk of an awkward phrase ships; it is a content bug, fixable in one file, not a structural one. |
| D3 | Locales are `en-GB` (default, British flag) and `es` (Spanish flag). | `en-GB` is the copy's actual register and matches `lang` semantics; a bare `es` avoids claiming dialect neutrality the copy cannot guarantee. |
| D4 | Persist in cookie `NEXT_LOCALE`, `path=/`, `SameSite=Lax`, one-year `max-age`; exact, case-sensitive match against `LOCALES`, anything else → `en-GB`. | Cookie, not `localStorage`: it survives browser restarts, is shared across tabs, needs no JSON parsing, writes no readable-enough-to-matter value, and the name is Next's own convention so a future `app/[locale]` can read the existing preference server-side. |
| D5 | Copy lives in `staticData/i18n/` (`en-GB.ts`, `es.ts`, `translations.ts`); framework-free locale helpers live in `lib/locale.ts`; no root-level `i18n/` module. | `typescript.md` §2 already defines `staticData/` as "typed, read-only content" and §11 requires an exported const with an explicit type — the copy is content. A new top-level concept would need its own explanation and its own place in the ESLint/tsconfig mental model. |
| D6 | `Luis Richmond`, the five company names, all tech labels, and the two language names (`English`, `Español`) are never translated. | Proper nouns and product names; translating tech labels breaks chip identity (R11), and a language name is only useful in its own language. |
| D7 | `endDate: string \| null`, `null` = current job; the label comes from the dictionary. No sentinel string, no `isCurrent` boolean. | The English sentence in data is the concrete symptom of the content/language entanglement; `null` is the narrowest type that removes it and `exactOptionalPropertyTypes` forces the renderer to handle it explicitly. |
| D8 | Small `beforeInteractive` inline script in `_document.tsx` sets `<html lang>` from the cookie before paint; the provider's effect remains authoritative. | Screen readers pick a voice from `lang` at load, so a returning Spanish visitor would otherwise be read as English until hydration. Cost: one ~120-byte inline script per document and the cookie name duplicated as a literal (it cannot import `lib/locale.ts`); both documented next to the script. Fallback: drop the script (R4). |
| D9 | Flags are hand-authored inline SVG with the flag's own hex fills. | No package (hard constraint); emoji flags do not render on Windows Chrome; flag colours are graphic content, not theme tokens, so `css.md` §6's token rule does not apply. |
| D10 | `position` / `jobDescription` are `Record<Locale, string>` inside each entry, not dictionary keys referenced from data. | Keeps a job's copy beside the job, makes an untranslated field a compile error, and avoids data that changes meaning when the dictionary is edited. Cost: `Senior Software Engineer` is repeated in three entries — accepted for locality. |
| D11 | Accept the English flash on reload; do not hide content until hydration. | A blank or hidden first paint is worse than the wrong language for a moment, breaks the JS-off case outright, and risks an LCP regression. Fixing the flash properly needs a server-read cookie, which D1 rules out. |

## Assumptions

- `ASSUMPTION:` the Union Jack is the `en-GB` affordance and the Spanish flag the
  `es` affordance (D3); neither implies a dialect the copy does not have.
- `ASSUMPTION:` the Spanish copy uses a neutral, `tú` register and the owner
  accepts it unreviewed (D2). No native-speaker pass exists or will be created
  by this ticket.
- `ASSUMPTION:` today's English strings are the source of truth and move
  verbatim, typos included. "Fixing" `profesional` / `independant` / `projecst`
  while moving them would silently mix Epic 2 into this diff and break the
  byte-identical English check.
- `ASSUMPTION:` `next/script` with `strategy="beforeInteractive"` inside
  `pages/_document.tsx` is warning-free on Next 16.4.6; otherwise D8's fallback
  applies and the runtime sync carries the requirement.
- `ASSUMPTION:` nothing in Next 16 pages router reads or writes `NEXT_LOCALE`
  while no `i18n` config exists, so the name is free to use (verified by the
  `curl -H 'Cookie: NEXT_LOCALE=es'` check returning unmodified English).
- `ASSUMPTION:` the two flags together fit in the header's first row at 1280
  without moving the nav; if 320px forces a reflow of the brand row, that delta
  is recorded rather than hidden.
- `ASSUMPTION:` `intl`/`Intl` output is irrelevant because dates stay raw
  strings (non-goal).

## Open questions

Nothing blocks a ticket. Two content questions are cheap to answer later and
have a default:

| Question | Owner | Default if unresolved |
| --- | --- | --- |
| Do job titles translate (`Senior Software Engineer` → `Ingeniero de Software Senior`) or stay in English? | Luis | Keep `Senior` / `Junior` prefixes and translate the rest literally; consistent with D2's unreviewed-copy rule |
| Should the switcher also be announced in the language it switches *to* (native names) or in the current page language? | Luis | Native names in both locales (D6) — the only reading that works when the visitor cannot read the current language |

## Verification

Run from `site-nextjs/`. Each row is the proof for the requirement it names.

| Command | Proves |
| --- | --- |
| `yarn lint` | R5/R7: no unused imports, no `any`, no new disables |
| `yarn typecheck` | R7/R10: dictionary and history shapes; run again with one key deleted from `es.ts` (expect failure, revert) and once with `es` deleted from an entry's `position` |
| `yarn format:check` | R7: dictionaries and new components are formatted by the repo's Prettier config |
| `yarn build` | R12/R13: same all-static route table, no i18n config, no build warning |
| `git diff -- site-nextjs/package.json site-nextjs/yarn.lock` | R14: no dependency entered |
| `grep -nE "i18next|next-i18next|react-intl|@formatjs|clsx|flag-icon" package.json next.config.js` | R6/R14: nothing to import |
| `grep -n "i18n" next.config.js` | R12: no built-in locale routing |
| `yarn start` then `curl -s localhost:3000{,/employmentHistory,/blogIndex} \| grep -o '<html[^>]*>'` | R4: `lang="en-GB"` in static HTML on every route |
| `curl -s -H 'Cookie: NEXT_LOCALE=es' localhost:3000/` | R3/R12: server ignores the cookie, HTML stays English |
| Playwright, fresh context, all three routes × both languages × 320/768/1280 | R5/R8/R9/R11: switcher position, ≥24×24 targets, focus ring, no horizontal scroll, translated copy, identical names/chips, exactly one `aria-pressed` |
| Playwright with `javaScriptEnabled: false` | Edge case: English renders, switcher inert, `lang="en-GB"` |
| Playwright: click Español → reload → new browser context with the cookie → restart | R2: persistence across reload and restart |
| Playwright `addInitScript` overriding the cookie getter to throw, and setting `NEXT_LOCALE=fr` | R2/edge: fallback to `en-GB`, no crash, no console error |
| Playwright console + `page.on('console')` while hydrating with `NEXT_LOCALE=es` | R3: zero hydration warnings |
| `grep -rnE "Nice to meet you|Professional Summary|Filter working experiences|Link to repository|Working on it" pages components` | R8: no copy left outside `staticData/i18n/` |

## Out of scope for now

- Per-language URLs, `hreflang`, `sitemap.xml`, per-language metadata for
  crawlers (D1's accepted cost), and any SEO work on top of it.
- `es-419` / `es-ES` variants, a third locale, RTL, and locale-aware dates.
- The Phase 2 App Router port of the provider and dictionaries — Epic 1's ticket,
  which must keep R1–R15 green.
- Vitest coverage of `lib/locale.ts` (`parseLocaleCookie`, `isLocale`): Epic 1
  Phase 3 adds the runner and the test; the functions are written to be testable
  as they are.
- Cross-tab syncing, a language preference page, and negotiation from
  `Accept-Language`.
- Copy editing of either language (Epic 2 for English, D2 for Spanish) and the
  icon-link accessible names deferred in Epic 1 D4.
