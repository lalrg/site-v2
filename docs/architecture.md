# Architecture: site-v2

- **Status:** current. Written for the i18n toggle
  (`docs/specs/2026-11-17-i18n-language-toggle.md`), which is the first
  subsystem in this repo that crosses every page.
- **Date:** 2026-11-17
- **Normative document:** the spec. It states *what* must be true (R1–R15,
  D1–D11, acceptance criteria). This file states *how the pieces fit* and which
  boundaries must not move. Where the two disagree, the spec wins and this file
  is wrong.
- **Decisions record:** `docs/specs/README.md:8-9` puts design decisions that
  outlive a spec here rather than in a per-feature ADR directory. That is this
  repo's convention and this file follows it; there is no `docs/decisions/`.

## 1. Scope

**Covered here**

- The i18n subsystem: one locale provider, its hook, the dictionaries, the
  cookie, and `<html lang>`.
- The implementation map for the i18n feature: every file created or changed,
  its responsibility and its dependencies.
- The constraints the subsystem imposes on **Epic 1 Phase 2**
  (`pages/` → `app/`).
- Alternatives rejected while designing the above, with reasons.

**Not covered here**

- Stack, pinning, commands, folder conventions, route table, definition of
  done → `AGENTS.md`. This file assumes them and never restates them.
- Why CSS Modules → `docs/styling.md`.
- Requirement text, acceptance criteria, copy, ticket breakdown → the spec,
  and (later) `docs/tasks/`.
- Per-feature history. This file describes the current shape; when the shape
  changes, edit it rather than appending a changelog.

**Standing constraints inherited from the project** (not re-litigated here):
Next 16.4.6 on the pages router, every route statically rendered, TypeScript
strict with `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes` /
`verbatimModuleSyntax` (`site-nextjs/tsconfig.json:8-11`), CSS Modules only, no
new dependency, no test runner yet.

## 2. The i18n subsystem

The browser is the only place a locale exists. There is no server-side locale,
no URL locale, no locale in the route table (D1, R12). The whole subsystem is:
typed dictionaries, one React context, one cookie, one DOM attribute.

### 2.1 Type flow

```
staticData/i18n/en-GB.ts
  export const enGB = { … }                  ← the key set, defined once
  export type Dictionary = typeof enGB       ← derived, never hand-written
                    │
                    ├─────────────► staticData/i18n/es.ts
                    │                 export const es: Dictionary = { … }
                    │                   missing key  → TS2741, names the key
                    │                   extra key    → TS2353, names the key
                    │                   wrong value  → TS2322
                    │
                    └─────────────► staticData/i18n/translations.ts
                                      export const translations: Record<Locale, Dictionary>
                                                 │
lib/locale.ts                                    │
  type Locale = 'en-GB' | 'es' ──────────────────┤  (the key of that Record)
  LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME,   │
  localeNames, isLocale, parseLocaleCookie,      │
  serializeLocaleCookie                          │
                                                 ▼
components/shared/locale/LocaleProvider.tsx
  translations[locale]  ──────────►  messages: Dictionary
```

Four properties the type flow is chosen for, each verified against this repo's
`tsconfig` (TypeScript 5.9.3, the six strict flags above, compiled in a scratch
project):

- `translations[locale]` is `Dictionary`, **not** `Dictionary | undefined`.
  `noUncheckedIndexedAccess` only adds `undefined` to index-signature reads; a
  `Record` over a closed union of literal keys is checked, so `Locale` gives
  exactly two keys and the result type is their union. A non-null assertion
  would be a defect, not a fix.
- `translations[locale].nav.intro` is `string`. Nothing downstream needs a
  default or a fallback.
- `enGB` must **not** be `as const`. With `as const` every value becomes a
  literal type, so `es` (annotated `Dictionary`) is forced to repeat the English
  strings — verified: `TS2322: Type '"Inicio y contacto"' is not assignable to
  type '"Intro and contact Info"'`. The plain object literal is what makes
  "same keys, different values" expressible.
- `es.ts` is annotated `Dictionary`, which is also how object-literal freshness
  reaches nested keys: deleting `nav.blog` fails with
  `Property 'blog' is missing in type '{ intro: string; employmentHistory: string; }'`.
  No `as`, no `satisfies`, no runtime validator.
- Every type import is `import type` (`verbatimModuleSyntax`); a value import of
  `Dictionary` fails with `TS1484`.

`lib/locale.ts` holds no React, no `next`, no JSX and **no `document`**. The
`ls` in the spec review found no `lib/` directory yet; creating it is sanctioned
by `typescript.md` §2 ("`lib/` or `shared/` — framework-free helpers") and is the
only new top-level folder this feature adds. `tsconfig.json:22` already includes
`**/*.ts`, and ESLint has no `lib/`-specific config, so no configuration change
is needed for it to be linted and type-checked.

Import depth stays inside `typescript.md` §10 (which bans `../../../..`). The
new folder sits at `components/shared/locale/`, so Header and Footer reach the
hook as `../../locale/LocaleProvider` (2 levels up), pages as
`../components/shared/locale/LocaleProvider`, and only `WorkHistoryItem` imports
`lib/` directly — `../../../lib/locale` for the `Locale` type, 3 levels up. No
path alias, no barrel, no re-export module.

### 2.2 State: one owner, one lifetime

One `useState<Locale>` inside `LocaleProvider`, initialised to the constant
`DEFAULT_LOCALE`. That is the only mutable locale state in the app:

| Candidate owner | Verdict |
| --- | --- |
| `LocaleProvider` state | **Chosen.** One value, one setter, above `Layout`, so Header, Footer and every page read the same commit. |
| Module-level `let` | Banned by R1: it is a second write path, invisible to React, and breaks across route changes in ways nothing can detect. |
| Context per consumer group | Would let two contexts disagree; also a second public read path, which R1 forbids. |
| URL / router | Banned by D1 and R12. |
| `localStorage` | Banned by R2's grep and D4. |

`LocaleProvider` sits in `_app.tsx`, outside `Layout`
(`site-nextjs/pages/_app.tsx:8-14` today renders `Layout` directly). Layout
consumes the hook for the document's title and description
(`components/shared/layout/index.tsx:15-22`), so it must be inside the provider;
Header, Footer and the pages are inside Layout and therefore inside the provider
by construction.

**Why a locale change cannot remount the subtree (R11).** The provider owns the
state, so `setLocale` re-renders the provider component only — `_app` does not
re-render, and the `children` element it passed to the provider is the same
object identity on every provider render, so React's reconciler does not even
descend into non-consumers. There is no `key` anywhere in the feature, so the
tree is reconciled, never unmounted: the `useState` holding the selected chips
in `pages/employmentHistory.tsx:8` survives a language switch by construction,
not by accident. Any wrapper keyed on `locale` turns the whole page into a fresh
mount and is a defect (R11 forbids `key={locale}` explicitly, and the reason is
exactly this).

### 2.3 The hook: one public interface

```ts
// components/shared/locale/LocaleProvider.tsx

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Dictionary
}

export default function LocaleProvider({ children }: { children: React.ReactNode })
export const useLocale: () => LocaleContextValue
```

- **One hook, one context.** `LocaleContext` is module-private: not exported, not
  re-exported, no second `createContext` anywhere. `useLocale()` is the only way
  to read or write the locale, so "one consumer API" (R1) is a structural
  property rather than a convention. Three separate hooks
  (`useLocale`/`useMessages`/`useSetLocale`) were rejected: they multiply the
  public surface, invite per-field consumers that re-render at different times,
  and do nothing a destructure cannot.
- `messages` is `translations[locale]` — always the dictionary for the returned
  `locale`, so a consumer cannot render one language's labels with another
  language's `aria-pressed`.
- The context value is memoised on `[locale, setLocale]`. `setLocale` is a
  `useCallback` over `[locale]` because its no-op guard needs the current value.
- Using the hook outside the provider throws a `Error` with a stable `name`
  (`LocaleContextError`). That is a wiring bug, not a user-reachable state — the
  provider wraps every route through `_app` — and a silent fallback would hide
  it. There is deliberately no module-level default value to fall back to (R1).
- Components that render copy consume the hook themselves; nothing is threaded
  through props except `WorkHistoryItem`'s data fields. Pages stay thin
  (`typescript.md` §2: "entry points only, thin").

### 2.4 Persistence: the cookie, and where the DOM lives

**Pure half — `lib/locale.ts`** (string in, string out; testable with no DOM):

```ts
export const parseLocaleCookie: (cookieString: string) => Locale
export const serializeLocaleCookie: (locale: Locale) => string
// → "NEXT_LOCALE=es; Path=/; Max-Age=31536000; SameSite=Lax"
export const isLocale: (value: string) => value is Locale
```

`parseLocaleCookie` splits on `;`, trims each part, takes the **first** part
starting with `` `${LOCALE_COOKIE_NAME}=` ``, and returns the value only when
`isLocale` accepts it — exact, case-sensitive — otherwise `DEFAULT_LOCALE`. It
never throws and never rewrites. `isLocale` is
`LOCALES.some((l) => l === value)`: `LOCALES.includes(value)` is a type error
because `value` is `string` and `LOCALES` is `ReadonlyArray<Locale>`, so the
`satisfies`-free guard has to go through a predicate.

**Impure half — `LocaleProvider.tsx`**, two module-private functions:

```ts
const readLocaleCookie = (): Locale => {
  try { return parseLocaleCookie(document.cookie) } catch { return DEFAULT_LOCALE }
}
const writeLocaleCookie = (locale: Locale): void => {
  try { document.cookie = serializeLocaleCookie(locale) } catch { /* cookies blocked: R2 says switch in memory only */ }
}
```

They are called from an effect and from the click handler respectively — never
during render, never in a `useState` initialiser, never at module top level
(R3). This split is why `lib/locale.ts` can later be unit-tested in a Node
environment (Epic 1 Phase 3) without a DOM shim, and why the literal string
`NEXT_LOCALE` appears in exactly two files: `lib/locale.ts` (as
`LOCALE_COOKIE_NAME`), and the `_document` pre-paint script, which cannot import
it.

**When each side effect runs**

| Moment | Action |
| --- | --- |
| First render (server and client) | nothing: state is `DEFAULT_LOCALE`, which is what the server rendered |
| Mount effect (once) | `readLocaleCookie()` → `setLocaleState(stored)`; if equal, React bails out and no re-render happens |
| Click on the inactive flag | `setLocale(next)`: write cookie, then set state |
| Click on the active flag | `setLocale` returns at the equality guard: no write, no state update, no history entry |
| Reload / new tab | static English HTML, mount effect reads the cookie, one update (R3, D11) |

The cookie is never written on mount (`R2`: "a first visit has no `NEXT_LOCALE`
key until a flag is clicked").

### 2.5 `<html lang>`

Three mechanisms, in this order of authority:

1. **Static** — `_document.tsx` renders `<Html lang="en-GB">`
   (`site-nextjs/pages/_document.tsx:5` renders `<Html>` with no `lang` today,
   which is the WCAG 3.1.1 failure the spec opens with). `Html` forwards `lang`
   and falls back to the pages-router `locale` when absent
   (`node_modules/next/dist/pages/_document.js:660-669`).
2. **Pre-paint script** (D8) — a `next/script` with
   `strategy="beforeInteractive"`, inline, with an `id`, as a direct child of
   `<body>` in `_document.tsx`. It reads the cookie and sets
   `document.documentElement.lang` if the value is one of the two locales,
   inside `try/catch`, in an IIFE so no identifier leaks into the global scope.
   At that point `document.body` does not exist yet — it must touch
   `document.cookie` and `document.documentElement` only.
3. **Runtime sync** — `syncDocumentLang(locale)`, a module-private helper that
   assigns `document.documentElement.lang` only when it differs, called from the
   mount effect (with the stored locale) and from `setLocale` (with the chosen
   one).

**Verified facts behind this design**

- *Placement is supported.* The 16.4.6 docs shipped in the package say, for the
  pages router: "`beforeInteractive` scripts must be placed inside the
  `Document` Component (`pages/_document.js`)"
  (`site-nextjs/node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md:81`),
  with a `pages/_document.js` example at `:133-152`, and "Scripts with
  `beforeInteractive` will always be injected inside the `head` of the HTML
  document regardless of where it's placed in the component" (`:156`). The
  changelog records support since 12.2.2 (`:473`).
- *The mechanism is real, not aspirational.* `Html` collects `next/script`
  elements that are **direct children of `<Head>` or `<body>`**
  (`node_modules/next/dist/pages/_document.js:535-581`), and
  `Head.render()` emits inline `beforeInteractive` scripts into `<head>` at
  `:507` — before the stylesheet links, the preloads and every Next.js script
  tag (`getBeforeInteractiveInlineScripts` at `:399-424`). A parser-blocking
  inline script in `<head>` runs before first paint and before any bundle.
  Consequence for the implementer: the `Script` element must be a direct child,
  not wrapped in a `<div>` or a fragment inside another element.
- *The lint config already knows about it.* `@next/next/no-before-interactive-script-outside-document`
  is `warn` and explicitly exempts `pages/_document`
  (`node_modules/@next/eslint-plugin-next/dist/index.js:83`, rule source
  `…/rules/no-before-interactive-script-outside-document.js`), so this placement
  is warning-free; `@next/next/inline-script-id` is `error` (`index.js:96`), so
  the inline script **must** carry an `id`.
- *Hydration cannot mismatch on `<html>`.* The pages router hydrates a
  container, not the document: `appElement = document.getElementById('__next')`
  (`node_modules/next/dist/client/index.js:192`) and
  `reactRoot = hydrateRoot(domEl, …)` (`:399`), where `domEl` is that element.
  `_document` "renders only on the server side"
  (`node_modules/next/dist/pages/_document.d.ts` comment above the default
  export). React 19 never sees `<html>`, so mutating `documentElement.lang`
  before or after hydration cannot produce a mismatch report, and
  `suppressHydrationWarning` is unnecessary — correctly banned by R3.
- *Re-writing the same value is not free.* An observed `MutationObserver` on
  `documentElement` records a mutation for `setAttribute('lang', 'es')` even
  when the value is already `es` (records carry `oldValue: 'es'`,
  `current: 'es'`). Hence the `syncDocumentLang` equality guard: without it, the
  first commit would write `en-GB` over the script's `es` — exactly the
  "undone and then restored" sequence R4's observer criterion forbids.

**Decision: build the runtime sync first, the script second.** The sync is
mandatory in every variant (R4: "the static `lang="en-GB"` and the effect are not
optional"); the script is the optimisation with a documented fallback. Ship the
effect, prove `lang` follows the locale on all three routes, then add the
`Script` as a second, separately revertable step.

**Evidence that flips it to sync-only.** Any one of:

- `yarn build` emits a warning attributable to the `Script`;
- with `NEXT_LOCALE=es`, the first `paint` entry's `startTime`
  (`performance.getEntriesByType('paint')`) precedes the `lang` mutation
  timestamp in Chromium, or a `MutationObserver` installed before load records
  `es` only after `first-contentful-paint`;
- any console output, from React or Next, on a cold load with
  `NEXT_LOCALE=es`.

Then delete the `Script` and its `id`, keep `lang="en-GB"` and the sync, and
record the delta in the ticket (R4's fallback clause). Do not replace the script
with a raw `<script>` tag in `<Head>`: `next/script` is the supported path and a
bare tag would re-litigate the same question with no evidence.

**Accepted inconsistency.** For a returning `es` visitor the document claims
`lang="es"` while the body text is still English until hydration. Assistive tech
may therefore read English prose with a Spanish voice for one frame. That is the
cost R4 buys against the larger cost it avoids (starting the whole page in the
wrong language), and it disappears in Phase 2 if the layout reads the cookie
server-side (§5).

### 2.6 Failure modes, retries, idempotency, concurrency

There is no I/O, no network, no auth, no async and no shared mutable state
beyond one cookie, so there are no retries, no backoff, no queues and no
timeouts. The failure table is therefore about the DOM:

| Failure | Behaviour | Where it is handled |
| --- | --- | --- |
| `document.cookie` getter throws (blocked cookies, hardened private mode) | read returns `en-GB`; no uncaught error | `readLocaleCookie` `try/catch` |
| Cookie write throws / is ignored | locale still changes for the life of the tab; no error | `writeLocaleCookie` `try/catch` (comment states the R2 intent, so it is not a silent swallow) |
| Cookie present but unknown (`fr`, empty, `ES`, padded) | `en-GB`; cookie left untouched until the next click | `isLocale` in `parseLocaleCookie` |
| Two cookies with the same name on different paths | first match wins; we only ever write `Path=/`, so this cannot be produced by the app | `parseLocaleCookie` |
| JavaScript disabled | English HTML with `lang="en-GB"`; flags render but do nothing (D1) | static render |
| Hydration mismatch | impossible: first client render uses `DEFAULT_LOCALE`, the same constant the server used | provider initial state |
| StrictMode double-invoked effects in dev | the mount effect reads twice and writes no cookie; idempotent | `readLocaleCookie` is pure w.r.t. state, `setLocaleState` bails out on equality |
| A locale change during a click storm | single-valued state, synchronous writes; last write wins, no queue | `setLocale` |
| Hook used outside the provider | throws `LocaleContextError` immediately (a wiring bug, never user-reachable) | `useLocale` |
| Two tabs | cookie is shared, the other tab keeps its language until reloaded | out of scope (spec) |

Idempotency rules, stated because they are load-bearing for the acceptance
criteria: `setLocale(same)` is a no-op; `syncDocumentLang(same)` writes nothing;
`serializeLocaleCookie` is a pure value, so re-writing the same cookie is
harmless; `parseLocaleCookie` is total — every string maps to a `Locale`.

### 2.7 Security and secrets

- No secret is involved and no environment variable is added; this feature must
  not introduce one (`AGENTS.md` "Environments and variables").
- The cookie value is never free text: it is written from a `Locale` union
  member, and read output is only ever one of two literals, so
  `documentElement.lang` cannot be set to attacker-controlled data by the
  pre-paint script (it compares against literals before assigning).
- No untrusted string reaches `dangerouslySetInnerHTML`, `eval` or a URL. The
  inline script's source is a constant in `_document.tsx`, and the JSX uses
  `children` rather than `dangerouslySetInnerHTML` (`ScriptProps` accepts both —
  `node_modules/next/dist/client/script.d.ts:5-14` — and `children` keeps
  `typescript.md` §7's rule out of the conversation).
- The cookie carries no personal data and is not `Secure`-flagged because the
  dev server is plain HTTP; it is `SameSite=Lax` and readable by JS by
  definition. A CSP nonce would be threaded through `next/script`'s `nonce`
  prop; this repo has no CSP and adding one is out of scope.
- No server trust boundary is crossed: the server never reads the cookie (R12),
  verified by `curl -H 'Cookie: NEXT_LOCALE=es'` returning the English document.

### 2.8 Observability

The site has no logger, no metrics backend and no error reporting, and this
feature does not add any — a static site's observability budget is the console
and the rendered DOM. What exists, and what verification must read:

| Signal | Read with | Proves |
| --- | --- | --- |
| `<html lang>` in the served document | `curl -s … \| grep -o '<html[^>]*>'` | static value (R4) |
| `document.documentElement.lang` after mount and after each click | Playwright evaluate | runtime sync (R4) |
| Mutation records on `documentElement[lang]` | `MutationObserver` installed before load, comparing recorded **values** (a same-value write is still a record — see §2.5) | the script's value is not undone (R4) |
| `document.cookie` | Playwright evaluate | exactly one key, written only on click (R2) |
| console output (`page.on('console')`) | Playwright | zero hydration warnings, zero errors (R3) |
| `document.title` and `meta[name=description]` | Playwright evaluate | the dictionary reaches `next/head` (R8) |
| `yarn build` route table | build output | all routes still static (R13) |

No `console.log` ships in the feature. If a future debugging aid is needed, it
goes behind `process.env.NODE_ENV !== 'production'`; nothing here needs one.

### 2.9 Testing strategy

There is no test runner (Epic 1 Phase 3 adds Vitest), so the boundaries are
drawn now so that the tests can be dropped in later without moving code:

| Layer | What belongs there | Era |
| --- | --- | --- |
| **Unit** — `lib/locale.test.ts`, next to the unit | `parseLocaleCookie` (missing key, unknown value, `ES`, whitespace, duplicate names), `isLocale`, `serializeLocaleCookie` (attribute string), `localeNames` totality. No DOM, no React, no mocks. | Phase 3 |
| **Component/integration** — Testing Library | provider + switcher: exactly two buttons, exactly one `aria-pressed="true"`, accessible names, active-flag click is a no-op. Needs a DOM environment, so it is only possible once the runner exists. | Phase 3 |
| **End-to-end** — Playwright | everything the acceptance criteria describe: persistence across reload and browser restart, cookie-blocked and unknown-cookie paths, `<html lang>` through the MutationObserver, hydration console silence, layout at 320/768/1280, JS-off, chip selection surviving a switch. | now, by hand (Playwright MCP), unscripted |

Rules that keep those layers reachable: `lib/locale.ts` stays DOM-free so its
tests need no environment shim; the provider takes no props it has to be handed
(a future test can render `<LocaleProvider>{children}</LocaleProvider>` directly);
and nothing in the feature is verified *only* by a rendering detail that a unit
test could have covered. Until the runner exists, the verification commands in
`AGENTS.md` plus the spec's Verification table are the whole safety net — which
is why §3's order of work insists that every step compiles.

## 3. Implementation map

Paths are relative to `site-nextjs/`. "Depends on" lists imports, not runtime
ordering.

| File | New/changed | Responsibility | Depends on |
| --- | --- | --- | --- |
| `lib/locale.ts` | **new** | `Locale`, `LOCALES`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`, `localeNames`, `isLocale`, `parseLocaleCookie`, `serializeLocaleCookie`. Framework-free, DOM-free, stateless. | nothing |
| `staticData/i18n/en-GB.ts` | **new** | `enGB` (source dictionary, every key from R8's table) and `Dictionary = typeof enGB`. Plain object, **no `as const`**. | nothing |
| `staticData/i18n/es.ts` | **new** | `es: Dictionary`. The only file that changes when copy changes. | `type Dictionary` |
| `staticData/i18n/translations.ts` | **new** | `translations: Record<Locale, Dictionary>`. The only object indexed by `Locale`. | `type Locale`, `enGB`, `es` |
| `components/shared/locale/LocaleProvider.tsx` | **new** | `LocaleContext` (private), `LocaleProvider` (default export), `useLocale`, `readLocaleCookie`/`writeLocaleCookie`, `syncDocumentLang`. | `react`, `lib/locale`, `translations`, `type Dictionary` |
| `components/shared/locale/LanguageSwitcher.tsx` | **new** | The `role="group"` container and the two `<button type="button">` in `LOCALES` order, `aria-pressed`, visually-hidden names from `localeNames`, `aria-label` from `messages.a11y.languageSwitcher`. Takes one `className` prop for grid placement. | `useLocale`, `LOCALES`, `localeNames`, the two flags, its module |
| `components/shared/locale/LanguageSwitcher.module.css` | **new** | `.switcher` (flex row, `gap: 0.25rem`), `.button` (28×28 target, transparent UA reset, `color: inherit`, `:focus-visible` ring), `.flag`, `.visuallyHidden`. | — |
| `components/shared/locale/UnionJackFlag.tsx` | **new** | `en-GB` flag, single-file component, `viewBox="0 0 60 30"`, `aria-hidden="true"`, `focusable="false"`. | nothing |
| `components/shared/locale/SpanishFlag.tsx` | **new** | `es` flag, `viewBox="0 0 60 40"`, same attributes. | nothing |
| `pages/_app.tsx` | changed | Wrap `Layout` in `<LocaleProvider>`. Nothing else moves. | `LocaleProvider` |
| `pages/_document.tsx` | changed | `<Html lang="en-GB">`; inline `next/script` (`id`, `strategy="beforeInteractive"`, direct child of `<body>`) with the IIFE that reads the cookie. Comment beside it naming `lib/locale.ts` as the source of the duplicated constant. | `next/document`, `next/script` |
| `components/shared/layout/index.tsx` | changed | `Head` title/description from `messages.meta.*` — `next/head` keeps ownership (R8). | `useLocale` |
| `components/shared/layout/header/index.tsx` | changed | Nav labels from `messages.nav.*` (a `HeaderLink` already takes `text`, `:6-15`); render `<LanguageSwitcher className={styles.languageSwitcher} />` as the second child of `<header>`, between the title link and the nav, so DOM order matches the first row's visual order. | `useLocale`, `LanguageSwitcher` |
| `components/shared/layout/header/header.module.css` | changed | Grid: two columns, `switcher` area in row 1, `.titleLink` placed in `title`, `.languageSwitcher` placed top-right; brand font-size step (see below). | — |
| `components/shared/layout/footer/index.tsx` | changed | Three strings from `messages.footer.*`; the heart icon, the `-` and the `&nbsp;` stay in JSX. | `useLocale` |
| `pages/index.tsx` | changed | Six strings from `messages.home.*`. | `useLocale` |
| `pages/blogIndex.tsx` | changed | Placeholder from `messages.blog.placeholder` (emoji stays inside the value). | `useLocale` |
| `pages/employmentHistory.tsx` | changed | H1 and subtitle from `messages.employmentHistory.*`; pass `endDate` as `string \| null`; **React key becomes `i.company + i.startDate`** — the current `i.company + i.endDate` (`:49`) type-checks with `null` and would render `"GreenSlatenull"` for the current job, so it must change with the data shape, not after it. Chip state (`:8`) and filtering (`:10-17`, `:34-40`) are untouched. | `useLocale`, `workingHistory` |
| `components/skillsToFilter/index.tsx` | changed | Heading from `messages.skillsToFilter.heading`. The `<li onClick>` (R-adjacent, Epic 1 D1) is not touched. | `useLocale` |
| `components/employmentHistory/WorkHistoryItem/index.tsx` | changed | Labels from `messages.employmentHistory.{startDateLabel,endDateLabel}`; when `endDate === null` render `messages.employmentHistory.stillWorkingHere`; `position`/`jobDescription` arrive as `Record<Locale,string>` and are indexed with `locale`. Props go from `interface` + `string[]` to `type` + `Array<string>` in the same edit (`typescript.md` §11). | `useLocale`, `type Locale` |
| `staticData/employmentHistory/workingHistory.ts` | changed | `type WorkHistoryEntry` (exported), `workingHistoryArray: Array<WorkHistoryEntry>` explicit; `endDate: string \| null` with `null` for GreenSlate (`:6`); `position`/`jobDescription` become `Record<Locale,string>`. `bulletPoints` stays one occurrence per entry. | `type Locale` |
| `AGENTS.md` (repo root) | changed | R15: name `staticData/i18n/` and `components/shared/locale/` in §Architecture, state that the toggle is client-side and cookie-backed with `<html lang>` following it, and update the §Stack `Data` row. | — |
| `docs/architecture.md` | **new** | This file. | — |

**Not changed, deliberately:** `next.config.js` (no `i18n` block, R12),
`package.json` / `yarn.lock` (R14), `tsconfig.json`, `eslint.config.mjs`,
`styles/global.css` (no new global selector), `docs/styling.md`.

### 3.1 Header layout

Measured on the current site (`yarn dev`, Playwright, 2026-11-17), because the
numbers decide this:

| Viewport | Header box | Brand text at `font-size: 2.5rem` |
| --- | --- | --- |
| 320 | 288 px wide (body has `padding: 0 1rem`, `styles/global.css:10-11`) | **260 px** (Inconsolata is monospace, 13 glyphs × 0.5em) |
| 768 | 736 px | 260 px |
| 1280 | 1024 px | 260 px |

The header is a grid with `grid-template-areas: 'title' 'links'`
(`header.module.css:44-57`) and the nav row starts at `y=60` on every width
(`.title` is a fixed `2.5rem` box plus `0.625rem` padding,
`header.module.css:1-12`).

At the spec-mandated 320 px, 288 − 260 − 60 (two 28 px targets plus a 4 px gap)
− 8 (column gap) leaves nothing: the brand and the switcher cannot both keep
their current size. The smallest standards-legal fix is a two-step brand size
using only the existing breakpoint:

```css
/* header.module.css */
.header {
  grid-template-columns: minmax(0, 1fr) auto;   /* was: 1fr */
  grid-template-areas:
    'title switcher'
    'links links';
  column-gap: 0.5rem;
}

.titleLink {
  grid-area: title;      /* the anchor is the grid item, not the <p> inside it */
  text-decoration: none;
}

.title {
  font-size: 2rem;       /* was 2.5rem */
}

/* after the base rules, per css.md §7 */
@media screen and (min-width: 1000px) {
  .title {
    font-size: 2.5rem;
  }
}

.languageSwitcher {
  grid-area: switcher;
  align-self: center;
  justify-self: end;
}
```

Why this exact shape:

- **The nav does not move.** Row heights are unchanged: `.title` keeps
  `height: 2.5rem` + padding whatever the font size, and the switcher (28 px) is
  shorter than that row. The nav is the second row on both sides of
  `1000px` and still spans the full grid (`links links`), so its own
  `repeat(4, auto)` grid (`header.module.css:28-35`) and active-link behaviour
  are untouched.
- **No third breakpoint, no `vw` font.** `css.md` §7 forbids `vw` for text, so
  `clamp(2rem, 10.5vw, 2.5rem)` — which would confine the shrink to below
  ~381 px — is rejected below. The two-step version is 2 rem (208 px of text) up
  to 999 px and 2.5 rem from 1000 px.
- **No clipping, no intersection at 320.** Column 1 is 220 px (288 − 60 − 8) and
  the brand needs 208 px: 12 px of slack, no `overflow` on the text, nothing
  intersecting. `documentElement.scrollWidth` stays 320.
- **The override must live after `.title`.** The file's existing queries sit
  *before* the base rules (`header.module.css:18-26`, `:37-42`), so a
  `.title { font-size: 2.5rem }` placed there would be overridden by the base
  rule at equal specificity. Appending the query after `.title` both works and
  satisfies `css.md` §7.
- **`.title`'s own `grid-area: title` (`header.module.css:2`) is inert** — its
  parent is the `<a class="titleLink">` (`components/shared/layout/header/index.tsx:21-23`),
  not the grid container. Placement has to be declared on `.titleLink`; relying
  on auto-placement would break silently the moment a third header child exists.

Recorded delta: the brand is 20 % smaller between 320 px and 999 px than today
(208 px instead of 260 px of text). The spec's assumption allows a recorded
brand-row delta at 320; this is that delta, and it is visible at 768 px too,
which is why it is written down rather than discovered later.

### 3.2 The two flags

Both are single-file components with no props, no CSS module of their own and
no import beyond React's JSX runtime. They are sized entirely by the button:

```css
/* LanguageSwitcher.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;         /* 28px — above the 24px floor (R5) */
  height: 1.75rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;         /* buttons do not inherit colour; the focus ring needs it */
  cursor: pointer;
}

.button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.flag {
  display: block;
  width: 1.5rem;          /* 24px; height comes from the viewBox ratio */
  height: auto;
}

.visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

`width` fixed + `height: auto` on an `<svg>` with a `viewBox` gives the intrinsic
ratio: the Union Jack renders 24 × 12 inside a 28 × 28 button, the Spanish flag
24 × 16. Both stay inside the button at every width, and `strokeWidth` values
live in viewBox units, so `vectorEffect` must not be used (it would prevent the
uniform scale).

**Union Jack** — five shapes, `viewBox="0 0 60 30"` (the flag's official 2:1),
layer order matters:

1. `<rect width="60" height="30" fill="#012169" />` — blue field.
2. White saltire: `<path d="M0 0L60 30M60 0L0 30" fill="none" stroke="#ffffff" strokeWidth="6" />`
   (6/30 = the official 1/5 band).
3. Red saltire: same `d`, `stroke="#c8102e"`, `strokeWidth="2"` (1/15).
4. White cross: `<path d="M30 0V30M0 15H60" fill="none" stroke="#ffffff" strokeWidth="10" />`
   (1/3 total: 1/5 red + 1/15 fimbriation each side).
5. Red cross: same `d`, `stroke="#c8102e"`, `strokeWidth="6"`.

The diagonals are two paths with four sub-strokes and no package: default butt
caps end them exactly on the edges. Every band width is the official proportion;
the one simplification is that the red diagonals are centred on the white rather
than counterchanged (offset to one side of it), which at 24 px is a sub-pixel
distinction and would cost four extra offset paths. No `stroke-dasharray`, no
`<use>`, no `<defs>`, no clip paths.

**Spanish flag** — three rectangles, `viewBox="0 0 60 40"` (official 3:2):
`<rect width="60" height="10" fill="#aa151b" />`,
`<rect y="10" width="60" height="20" fill="#f1bf00" />`,
`<rect y="30" width="60" height="10" fill="#aa151b" />`. The civil flag without
the coat of arms is the correct mark at this size; drawing the arms would be
neither legible nor supportable without a package.

Both carry `aria-hidden="true"` and `focusable="false"` (the latter for legacy
IE/Edge tab-order behaviour, harmless elsewhere), no `<title>`, and no `xmlns`
(JSX inline SVG needs none). The hex fills are the sanctioned exception to the
token rule (D9) and are the only raw colour this feature adds.

### 3.3 Order of work

Every step leaves `yarn lint`, `yarn typecheck` and `yarn build` green. The
constraints that force this order are named next to the steps.

1. **`lib/locale.ts` + all three `staticData/i18n/*` files, complete.** Additive,
   imported by nothing yet. Write the *whole* R8 key set now: adding a key later
   means editing `en-GB.ts` and `es.ts` in the same commit or typecheck fails,
   so doing it once avoids three files carrying a half-migrated key set.
2. **`components/shared/locale/*`** — provider, hook, switcher, both flags, the
   module. Still imported by nothing; compiles and lints standalone.
3. **`_app.tsx` wraps `Layout`.** The provider is live but no consumer exists
   yet; the page renders exactly as before.
4. **Header**: render `LanguageSwitcher` and apply the grid change. This is the
   first user-visible step and it is end-to-end functional — cookie, state,
   `aria-pressed`, focus ring — before any copy moves.
5. **`_document.tsx`**: `lang="en-GB"` first (curl it), then the pre-paint
   `Script` (verify with the MutationObserver, and flip per §2.5 if the evidence
   says so).
6. **Copy migration, one file per step**, in any order: `layout/index.tsx` →
   `header/index.tsx` nav → `footer/index.tsx` → `pages/index.tsx` →
   `pages/blogIndex.tsx` → `skillsToFilter/index.tsx`. Each file is
   self-contained and each step keeps the English output byte-identical.
7. **The employment-history data change, atomically**: `workingHistory.ts`
   (`endDate: null`, `Record<Locale,string>` fields, explicit type) together with
   `WorkHistoryItem` (new prop types, labels, `null` branch) and
   `employmentHistory.tsx` (the `key` expression). Splitting these three across
   steps is the one way to get a red intermediate state: the data shape, its
   consumer and the key all reference each other.
8. **`AGENTS.md`** (R15) last, so it describes what exists.

Steps 1–2 are pure additions, so they can be reviewed as one diff or two; steps
4–7 are the risky ones and each is independently revertable.

## 4. Rejected alternatives

The spec's decision table (D1–D11) is normative; these are the technical
alternatives considered while turning it into code, plus one re-statement of the
non-obvious spec rejections.

| Rejected | Reason |
| --- | --- |
| Route-based locales (`next.config.js` `i18n`, `/es/…`, `app/[locale]`) | D1: pages-router i18n does not survive the App Router port, and would be re-paid. |
| Reading the cookie on the server (`getServerSideProps`, middleware) | R12/R13: every route is static; one dynamic route breaks the route table. |
| `localStorage` / `sessionStorage` | D4; also adds JSON parsing and a different tab semantics for no gain. |
| i18next, next-i18next, react-intl, `@formatjs/*` | R14, and each one brings a key-resolution runtime for 21 static strings. |
| `clsx` | R14. `css.md` §4 prefers it, but the repo already composes classes with the ternary form (`header/index.tsx:10`) and the feature needs two class strings, neither conditional on a boolean except the switcher's `aria-pressed`, which is not a class. |
| A flag-icon package or `<img src>` | R6/D9; emoji flags do not render on Windows Chrome. |
| `suppressHydrationWarning` | R3: it would hide the symptom of a design that reads the cookie too early. |
| Hiding content until hydration | D11: trades a text flash for a blank flash and breaks the JS-off case. |
| `useSyncExternalStore` with `getServerSnapshot`, to read the cookie "declaratively" | It reads the cookie during the client render, which is the thing R3 forbids, and it adds a subscription for a value with exactly one writer. The provider's effect is simpler and provably matches the server. |
| A `useEffect` on `locale` that writes `documentElement.lang` | It fires on the first commit with `DEFAULT_LOCALE` and overwrites the pre-paint script's `es` with `en-GB` before the cookie read lands — the exact sequence R4's observer criterion forbids (§2.5). The sync is therefore called at the two points where the locale is decided, not derived in an effect. |
| `as const` on `enGB` | Verified: it makes every value a literal type and forces `es` to repeat the English strings (TS2322). |
| `translate` helper with an interpolated key (`t('nav.blog')`) | A string-keyed function loses the compile-time key check that R7's acceptance criteria are built on; `messages.nav.blog` is checked by the compiler for free. |
| `Locale` as `string` + runtime validation everywhere | Pushes a compile error into a runtime blank, which R7 forbids ("missing translation key = compile error, never a runtime blank"). |
| `clamp(2rem, 10.5vw, 2.5rem)` for the brand | `css.md` §7 forbids `vw` for text, and the clamp introduces an implicit breakpoint at ~381 px that no rule states. Chosen instead: the two-step size in §3.1, which reuses the existing `1000px` value. Revisit only if the owner wants the 2.5 rem brand kept above 381 px, in which case the deviation needs recording in `AGENTS.md`. |
| Adding a `768px` query for the brand | Banned by the spec's breakpoints constraint; normalising to 768/1024 is Epic 1 D2. |
| `100vw`-based sizing, `em` sizing, or a container query for the header | Each replaces a stated breakpoint with a hidden one; the header's width already tracks the body padding, so the measurement is stable anyway. |
| Two contexts (locale + messages) or a `useLocale`/`useMessages` pair | R1's one consumer API; two contexts can drift and would each need their own provider value. |
| Putting `readLocaleCookie`/`writeLocaleCookie` in `lib/locale.ts` | `lib/` must stay DOM-free so `lib/locale.test.ts` needs no environment (spec constraints; `typescript.md` §2). |
| Translating tech labels or company names | D6/R9: it breaks chip identity (`skillsToFilter` matches on the label itself, `skillsToFilter/index.tsx:26-32`). |
| Per-locale duplicate `bulletPoints` arrays | R10: one occurrence per entry, filtered in one place. |
| `Intl` / `toLocaleDateString` for the dates | Non-goal; dates are raw ISO strings in both locales today (`workingHistory.ts:5`). |
| A custom `pages/404.tsx` to translate the 404 | Out of scope: the default 404 renders with `lang="en-GB"` and has nothing user-authored to translate (spec edge-case table). |

## 5. Follow-up constraints for Epic 1 Phase 2 (`pages/` → `app/`)

The feature is built to port without a rewrite (spec "Relationship to Epic 1").
For that to be true, the port must keep the following true. Each item is a
property of this design that a mechanical migration can silently break.

1. **`localeNames` and `locales` stay the source of UI order.** The switcher
   iterates `LOCALES` — the same array `parseLocaleCookie` validates against —
   so a new locale or a reorder is one edit. If Phase 2 hard-codes buttons in
   the layout, that property is lost.
2. **The provider and hook stay framework-free.** No `next/router`, no
   `next/head`, no `'use client'`-only import in `lib/locale.ts` or
   `staticData/i18n/*`. In the App Router, Header becomes a client component
   (`usePathname`, Epic 1 R8) and `LocaleProvider` becomes a `'use client'`
   module; the provider's own code does not change, only its boundary. Anything
   imported by a Server Component (the dictionaries, the pure helpers) must stay
   free of React so a server-side `lang` remains possible.
3. **`<html lang>` changes mechanism, and the pre-paint script must not simply
   be copied into `app/layout.tsx`.** In the App Router, `<html>` *is* part of
   the hydrated tree (unlike `#__next` today, §2.5), so mutating
   `documentElement.lang` before hydration while the server rendered a different
   value is a mismatch risk. Two legal outcomes, and Phase 2 must pick one
   explicitly:
   - the layout reads the cookie server-side (`cookies()`), renders the right
     `lang` in the HTML and drops the script — correct, but it makes the route
     dynamic, which contradicts Epic 1 R5's "all routes static" and needs that
     spec amended; or
   - the HTML keeps `lang="en-GB"` and the client syncs after hydration, with
     the flash R3/D11 already accepts and no script at all.

   Either way the script's job ends at Phase 2. Do not port it blind.
4. **The cookie name does not change.** `NEXT_LOCALE` with `path=/` is what a
   future `app/[locale]` (or a server-side read in item 3) would consume; D4
   chose the name for exactly that. Renaming it silently logs every returning
   visitor out of their choice.
5. **`lib/locale.ts` stays pure through Phase 3.** Epic 1 Phase 3 adds
   `vitest` and the first tests; the functions in §2.4 are already string-in /
   string-out, so Phase 3 should add `lib/locale.test.ts` and change nothing
   else. If a phase needs a test seam, the answer is the pure function, not a
   mock of `document`.
6. **No `key` tied to the locale, ever.** Remounting on locale change would be
   just as wrong in the App Router (it would reset the client-side chip state
   that Epic 1 R9 moves into a client component), and the reason is unchanged:
   the state lives above the tree being re-rendered.
7. **The switcher's placement is expressed through the named grid area, not the
   breakpoint.** Phase 2 moves `pagesStyles/` next to route segments and Epic 1
   D2 normalises `1000px` → `1024px`; the header's `switcher` area, the
   `minmax(0, 1fr) auto` columns and the `.languageSwitcher` placement survive a
   breakpoint change untouched, whereas a mobile-only override would not.
8. **The dictionaries stay in `staticData/`.** They are content, not route
   segments; `app/[locale]/…` route duplication (D1's rejected future) would
   move copy into the routing layer and is out of scope again.

## 6. Requirement coverage

Every requirement in the spec resolves to a component in §3. Nothing is
homeless; the two entries marked *evidence* are proofs, not homes.

| Req | Satisfied by | Note |
| --- | --- | --- |
| R1 one provider above every page | `pages/_app.tsx`, `LocaleProvider.tsx` | provider outside `Layout`; context private; single hook |
| R2 cookie persistence | `lib/locale.ts` (`parse`/`serialize`), `LocaleProvider.tsx` (`read`/`write`) | write only from `setLocale`; read only from the mount effect |
| R3 no hydration mismatch | `LocaleProvider.tsx` initial state = `DEFAULT_LOCALE`; `_app.tsx` | cookie never read in render, initialiser or module scope |
| R4 `<html lang>` | `_document.tsx` (`lang` + `Script`), `LocaleProvider.tsx` (`syncDocumentLang`) | §2.5; sync first, script second |
| R5 switcher and layout | `LanguageSwitcher.tsx`, `LanguageSwitcher.module.css`, `header.module.css`, `header/index.tsx` | §3.1, §3.2; `:focus-visible` ring + 28 px targets |
| R6 hand-authored flags | `UnionJackFlag.tsx`, `SpanishFlag.tsx` | §3.2 |
| R7 typed content, missing key fails build | `staticData/i18n/{en-GB,es,translations}.ts`, `lib/locale.ts` | §2.1; verified diagnostics |
| R8 every string switches | all eight consumer files, `en-GB.ts`, `es.ts` | §3 steps 4 and 6; English copied verbatim |
| R9 names that do not translate | `en-GB.ts`/`es.ts` (absent by construction), `localeNames` in `lib/locale.ts` | data fields `company`/`bulletPoints` stay `string` |
| R10 one entry per job | `workingHistory.ts`, `WorkHistoryItem`, `employmentHistory.tsx` | atomic step 7; key = `company + startDate` |
| R11 filtering and state unaffected | `LocaleProvider.tsx` (no `key`), untouched `useState` in `employmentHistory.tsx:8`, unchanged `SkillsToFilter` logic | §2.2 |
| R12 no URL or server locale | `_document.tsx` only; `next.config.js` untouched | no router API in the feature |
| R13 every route static | `_app.tsx`/`_document.tsx` only; no per-route change | `yarn build` route table is the evidence |
| R14 no new dependency | §3 "Not changed" | `package.json`/`yarn.lock` diff empty |
| R15 docs record where copy lives | `AGENTS.md` §Architecture/§Stack | step 8 |

## 7. Spec conflicts and clarifications

No requirement is unimplementable and no redesign was needed. Three points
deserve to be written down so they are not discovered mid-implementation.

1. **R5 + the "no third breakpoint" constraint cannot all hold with the brand at
   `2.5rem`.** Measured: at 320 px the header is 288 px wide and the brand text
   alone is 260 px, so a top-right switcher of two ≥24 px targets cannot share
   the row without shrinking the brand (or overflowing, or clipping, both of
   which R5 forbids). Resolved inside R5's own permission to edit the grid, using
   the existing `1000px` value only, with the brand at `2rem` between 320 and
   999 px (§3.1). That is the delta the spec's assumption asks to be recorded
   rather than hidden.
2. **R7's grep wording reads as if `components/` may not touch cookies at all.**
   The criterion is `grep -rn "cookie" …` returning "the cookie name only as
   `LOCALE_COOKIE_NAME` imported from `lib/locale.ts`". The provider necessarily
   contains `document.cookie` and calls `parseLocaleCookie`. The property the
   criterion is protecting is: the **literal** `NEXT_LOCALE` appears only in
   `lib/locale.ts` (as `LOCALE_COOKIE_NAME`) and in the `_document` inline
   script, which cannot import. That is the reading this design satisfies, and
   it is what the ticket's evidence should show.
3. **D8's "before first paint" is true by a different mechanism than "placed
   before the app in `_document`".** Next re-injects the inline script into the
   document's `<head>` at a fixed position ahead of every Next.js script tag
   (`_document.js:507`), rather than streaming it where it is written. The
   requirement holds — the script is still parser-blocking in `<head>` — but the
   implementer should not expect it to appear where `_document.tsx` writes it,
   and the script must therefore only assume `document.documentElement` and
   `document.cookie` exist (`document.body` does not, yet).
