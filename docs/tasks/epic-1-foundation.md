# Tasks: Epic 1 — Foundation (phases 0, 0.5 and 1)

- **Spec:** `docs/specs/2026-11-16-epic-1-foundation.md`
- **Task source:** local markdown (`docs/tasks/`), per `AGENTS.md` §Task source
- **Scope of this file:** Phase 0 (baseline evidence), Phase 0.5 (Prettier) and
  Phase 1 (toolchain). Requirements in play: R1, R2, R3, R4, R16, plus the
  Phase 0 evidence gate and R15's baseline. Phases 2–4 are listed under
  `## Not yet ticketed` and are deliberately not broken down.
- **Total estimate:** 12 points, 5 tickets
- **Critical path:** EPIC1-1 → EPIC1-2 → EPIC1-3 → EPIC1-4 → EPIC1-5
- **Sizes:** S = 1–2 (one sitting), M = 3 (a focused day). Nothing here is L.

Branch per ticket: `<type>/<ticket>-<slug>`, e.g. `chore/EPIC1-3-pin-node-26`.
One ticket = one PR = one commit, at most two. Conventional Commits.

Every commit carries spend trailers taken from the `spend_report` tool —
`Ticket`, `Spend-Model`, `Spend-Tokens`, `Spend-USD`, `Spend-Sessions`. Never
estimated, never hand-written. Stated once here, not per ticket.

**Gate on every ticket.** `yarn install --frozen-lockfile`, `yarn lint` and
`yarn build` exit 0 and `yarn start` serves `/`, `/employmentHistory` and
`/blogIndex` at 200. A ticket's Verification block states the proof specific to
that ticket; it never replaces this gate.

**`AGENTS.md` rule for this phase.** Each ticket corrects only the rows of
`AGENTS.md` that it falsifies (Stack versions, Commands, the "build runs lint"
claim). R14's full rewrite stays in Phase 4. No Phase 1 ticket may leave a
known-false sentence in the contract.

| id | title | type | size | est | depends on |
| --- | --- | --- | --- | --- | --- |
| EPIC1-1 | Capture the Phase 0 baseline and commit its manifest | docs | S | 2 | — |
| EPIC1-2 | Add Prettier and reformat the app | chore | M | 3 | EPIC1-1 |
| EPIC1-3 | Pin Node 26.13.1 | chore | S | 2 | EPIC1-1 |
| EPIC1-4 | Move lint to an ESLint 10 flat config | chore | M | 3 | EPIC1-3 |
| EPIC1-5 | Upgrade to Next 16, React 19, TypeScript 5.9 and `next/font` | chore | M | 3 | EPIC1-4 |

## How these were cut

- **Phase 0 is a ticket, not a checklist.** It is a gate three later
  acceptance criteria read from (R2 font parity in EPIC1-5, R15 parity, and the
  404 body Phase 2 will need), it must run before the first change to
  `site-nextjs/`, and it must run on Node 23. Buried as a checkbox in a code
  ticket it would be unreviewable and unprovable — a dependency edge is the
  honest encoding of "this must exist first".
- **Phase 0.5 is one ticket with two commits.** The Prettier setup and the
  reformat go in one PR: the setup is reviewable, the mechanical diff is not, so
  two commits let a reviewer read the first and skip the second. A separate
  `.git-blame-ignore-revs` ticket was cut from the plan: merges are squash-only
  here, so the reformat commit's SHA never reaches `main` and the file would
  reference a commit that does not exist. If blame noise becomes a real
  problem, a later ticket records the merged SHA — a follow-up, not a dependency.
- **ESLint lands before the Next bump, not with it.** `next lint` disappears in
  Next 16, so the script, the flat config and the `AGENTS.md` correction are one
  ticket — but that ticket can run on Next 13, which keeps the Next PR a
  readable version/compile change and means lint is never broken on `main`.
  Verified while writing this plan: with `.eslintrc.json` deleted, `next build`
  on 13.1.1 still exits 0 and simply stops linting, so the interim state builds.
  The remaining cost is one PR where `eslint-config-next@16.4.6` lints Next 13
  sources; it is static analysis only and does not import `next`. Fallback if
  the peer set or the config refuses is recorded in EPIC1-4.
- **The Next bump is not splittable.** TS 4.9 blocks Next 16 and the strictness
  flags ride with the TS bump, `@next/font` fails the build the moment Next 16 is
  installed, and React 19 is Next 16's peer. One ticket, two commits at most.
- **Node pins first.** Vitest 5.1.0 cannot run on 23.11.0 and every later
  command must be measured on the runtime that ships, so the pin is its own PR
  with a documented escape hatch.

---

## EPIC1-1 — Capture the Phase 0 baseline and commit its manifest

- **Type:** docs
- **Size:** S
- **Estimate:** 2
- **Depends on:** —
- **Touch:** `docs/evidence/phase-0-baseline.md` (new). Nothing under `site-nextjs/`.

**Context**

Spec §Delivery phases row 0, and the gate R15 depends on: "looks identical" is
unfalsifiable without a before. Capture screenshots, `curl` bodies and `<head>`
snapshots of `/`, `/employmentHistory`, `/blogIndex` and `/nope` at 320/768/1280
on the current tree and the current Node 23 runtime, and record the route table.
Binaries stay outside the repo (they are evidence, not an artifact); the
committed manifest is what makes the gate traceable — it names the commit, the
commands, the storage path and the exact strings EPIC1-5 compares against.

**Acceptance criteria**

- [ ] Evidence captured from the epic's base commit (app code identical to
      `3ddf0f3`), on Node 23.11.0, before any change to `site-nextjs/`; storage
      path is outside the repo and recorded in the manifest.
- [ ] 12 full-page screenshots exist — `/`, `/employmentHistory`, `/blogIndex`,
      `/nope` at 320, 768 and 1280 CSS px — named `<route>-<width>.png`.
- [ ] `curl -s` bodies saved verbatim for the same four routes, plus the extracted
      `<head>` per route: title, meta description, viewport, favicon link.
- [ ] Computed `font-family` and `font-weight` of the `h1` on `/` recorded as
      literal strings (R2 compares against these in EPIC1-5).
- [ ] The `yarn build` route table is pasted verbatim into the manifest — every
      route and its static/dynamic marker.
- [ ] Nav baseline recorded: per route, which nav link carries the active class
      and its exact class string (R8); whether each header link from `/` lands at
      the top of its target at 320 and 1280 (R7).
- [ ] Manifest states date, commit SHA, Node and yarn versions, the capture
      commands, and the outside-repo path; it contains no binaries and no edits
      under `docs/specs/`.
- [ ] `curl -s -o /dev/null -w '%{http_code}' localhost:3000/nope` is `404`, and
      the 404 body is saved in full (Phase 2 needs it).

**Verification**

```bash
# from site-nextjs/ — capture only, no source changes
node -v                                   # expect v23.11.0
git rev-parse --short HEAD                # record it: this is the epic base
yarn build                                # paste the route table into the manifest
yarn start                                # then, per route, per width:
curl -s localhost:3000/ > ~/epic1-baseline/curl-root.html
curl -s localhost:3000/employmentHistory > ~/epic1-baseline/curl-employment.html
curl -s localhost:3000/blogIndex > ~/epic1-baseline/curl-blog.html
curl -s localhost:3000/nope > ~/epic1-baseline/curl-404.html
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/nope   # expect 404
# screenshots at 320/768/1280 for each of the four routes, full page

# from the repo root, after committing
git show --stat HEAD                      # expect only docs/evidence/phase-0-baseline.md
```

---

## EPIC1-2 — Add Prettier and reformat the app

- **Type:** chore
- **Size:** M
- **Estimate:** 3
- **Depends on:** EPIC1-1
- **Touch:** `site-nextjs/package.json`, `site-nextjs/yarn.lock`,
  `site-nextjs/.prettierrc.json` (new), `site-nextjs/.prettierignore` (new),
  every formatted file under `site-nextjs/`, `AGENTS.md`

**Context**

R16 / decision D3: a format gate cannot be added retroactively once the
migration diffs exist, so the formatter lands as its own PR before any file
moves — two commits, `chore(format): add prettier 3.10.1` then
`style: apply prettier to site-nextjs`, so a reviewer can read the setup and skip
the mechanical diff. Behaviour-neutral is the whole point: `yarn lint` and
`yarn build` must be green before and after, and the app must render the same.

> **Resolved.** `typescript.md` §11 wins: `{ "semi": false, "singleQuote": true,
> "printWidth": 100, "trailingComma": "all" }`. The diff will therefore contain
> line rewrapping and multiline trailing commas as well as quote and semicolon
> changes, and R16's acceptance wording has been corrected to say "no semantic
> change" rather than "whitespace only".

**Acceptance criteria**

- [ ] `prettier@3.10.1` is an exact devDependency; `yarn.lock` updated; no other
      dependency changes (`git diff site-nextjs/package.json` shows one line).
- [ ] `site-nextjs/.prettierrc.json` is `{ "semi": false, "singleQuote": true,
      "printWidth": 100, "trailingComma": "all" }`; indentation stays Prettier's
      default 2 spaces (no `tabWidth` override).
- [ ] `site-nextjs/.prettierignore` lists `.next/`, `node_modules/`,
      `next-env.d.ts`, `yarn.lock`.
- [ ] `package.json` scripts: `"format": "prettier --write ."`,
      `"format:check": "prettier --check ."`.
- [ ] `AGENTS.md` Commands table replaces the `Format | none configured` row with
      both commands and what each proves.
- [ ] The `style:` commit changes no identifier, JSX structure or string-literal
      content: read the diff hunk by hunk. Rewrapping and trailing commas are
      expected (§11 mandates both); anything else is a defect.
- [ ] `yarn lint` and `yarn build` exit 0 on both commits; the route table is
      unchanged; the three routes render the same text.
- [ ] Nothing under `docs/` in the diff; `git status --porcelain` empty after the
      second commit.

**Verification**

```bash
# from site-nextjs/, still on Node 23.11.0 (this runs before the pin)
yarn install --frozen-lockfile
yarn format:check                      # expect exit 0
yarn lint                              # expect exit 0
yarn build                             # expect green, route table as in Phase 0
git log --oneline -2                   # expect the style: commit, then chore(format):
git show HEAD --stat                   # expect only the reformat, no docs/
git show HEAD --stat | grep docs/specs # expect no output

# negative: proves the check can fail
printf 'export const probe = 1;\n' > format-probe.ts
yarn format:check                      # expect non-zero
rm format-probe.ts
git status --porcelain                 # expect empty
```

---

## EPIC1-3 — Pin Node 26.13.1

- **Type:** chore
- **Size:** S
- **Estimate:** 2
- **Depends on:** EPIC1-1
- **Touch:** `site-nextjs/.nvmrc` (new), `site-nextjs/package.json` (`engines`),
  `AGENTS.md`

**Context**

R1's runtime clause. 23.11.0 is EOL and cannot run the vitest/jsdom versions this
epic needs, so the runtime is pinned before anything is verified on it:
`.nvmrc` at the app root (where every command runs) and `engines` so an
unsupported Node fails at install instead of being used silently. No dependency
versions move in this ticket — if Next 13.1.1 turns out not to build on Node 26,
the failure is isolated in one small PR. May run in parallel with EPIC1-2;
preferring EPIC1-2 first simply keeps diffs separate.

> **Risk with a rule.** If `yarn build` fails on Node 26 with Next 13.1.1, stop
> and re-plan: the pin then rides with EPIC1-5, which becomes 5 points. Do not
> sneak a Next bump into this ticket.

**Acceptance criteria**

- [ ] `site-nextjs/.nvmrc` contains `26.13.1`; `package.json` has
      `"engines": { "node": ">=26.13.0 <27" }`. No `packageManager` field —
      corepack is not assumed.
- [ ] On 23.11.0, `yarn install --frozen-lockfile` fails with an engines error;
      on 26.13.1 it exits 0 and `yarn.lock` is byte-identical
      (`git diff --exit-code yarn.lock`).
- [ ] Under 26.13.1: `yarn lint` exits 0, `yarn build` is green with the Phase 0
      route table, and `yarn start` serves `/`, `/employmentHistory`,
      `/blogIndex` at 200.
- [ ] `package.json` diff touches `engines` only — no dependency version changes.
- [ ] `AGENTS.md` Stack runtime row reads Node 26.13.1, pinned via `.nvmrc` +
      `engines`; the Notes section records that yarn 1.22.22 runs on Node 26 and
      how it was installed.

**Verification**

```bash
# from site-nextjs/
nvm use 23.11.0 && node -v && yarn install --frozen-lockfile   # expect engines error, non-zero
nvm use 26.13.1 && node -v                                     # expect v26.13.1
yarn install --frozen-lockfile                                 # expect exit 0
git diff --exit-code yarn.lock
yarn lint && yarn build
yarn start & sleep 3
curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' \
  localhost:3000/ localhost:3000/employmentHistory localhost:3000/blogIndex
```

---

## EPIC1-4 — Move lint to an ESLint 10 flat config

- **Type:** chore
- **Size:** M
- **Estimate:** 3
- **Depends on:** EPIC1-3
- **Touch:** `site-nextjs/eslint.config.mjs` (new),
  `site-nextjs/.eslintrc.json` (deleted), `site-nextjs/package.json`,
  `site-nextjs/yarn.lock`, `AGENTS.md`, plus any source file a newly enabled
  rule flags

**Context**

R3. `next lint` and `next build`'s lint step are removed in Next 16 and
`.eslintrc.json` is no longer read, so the script and the config are one change,
and `AGENTS.md`'s claim that `yarn build` is "the single gate" must be corrected
in the same PR or the contract is briefly lying. It lands before the Next bump so
lint is never broken on `main`; the trade is one PR where
`eslint-config-next@16.4.6` lints Next 13 sources — the plugin does static source
analysis and does not import `next`, so the skew is version-only. Verified while
planning: deleting `.eslintrc.json` leaves `next build` on 13.1.1 exiting 0 with
linting simply switched off, so the interim commit builds.

> **Risk with a rule.** If `yarn install` reports a peer error or `yarn lint`
> cannot run against Next 13 with `eslint-config-next@16.4.6`, stop: merge this
> ticket into EPIC1-5 and re-size it to 5. That is a planning amendment, not
> an in-ticket workaround.
>
> **Decision needed if a rule fires.** R3 wants zero violations and no new
> disables. Fix at the smallest site; if the only compliant fix would change
> rendered copy or markup, stop and report — R15 allows no visual delta and the
> spec names no such case.

**Acceptance criteria**

- [ ] `eslint@10.15.0` and `eslint-config-next@16.4.6` are exact;
      `tsconfig.json`/build untouched.
- [ ] `eslint.config.mjs` imports `eslint-config-next/core-web-vitals` and
      `globalIgnores` from `eslint/config`, ignoring `.next/**`, `out/**`,
      `coverage/**`, `next-env.d.ts`.
- [ ] `.eslintrc.json` is deleted; `"lint": "eslint ."`.
- [ ] `yarn lint` exits 0 with zero warnings and the diff adds no
      `eslint-disable` comment.
- [ ] `yarn lint` exits non-zero on a temporary file containing
      `export const probe: any = 1` (removed before commit).
- [ ] `yarn build` exits 0, prints no ESLint setup prompt, and the route table is
      unchanged; the build no longer lints, and `AGENTS.md` says so.
- [ ] `AGENTS.md`: Commands `Lint` row is `eslint .` via flat config; the Notes
      line "`yarn build` runs lint and type checking itself; use it as the single
      gate" is gone; the Definition of done lists `yarn lint` and `yarn build` as
      separate gates.
- [ ] The three routes serve 200 and the text is unchanged from Phase 0 (no rule
      fix altered copy or markup).

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
node -v                                # expect v26.13.1
yarn install --frozen-lockfile
yarn lint                              # expect exit 0, no output
printf 'export const probe: any = 1\n' > probe-lint.ts
yarn lint                              # expect non-zero
rm probe-lint.ts
grep -rn "next lint" . --exclude-dir={node_modules,.next,.git}   # expect empty
yarn build                             # expect exit 0, route table unchanged
yarn start & sleep 3
curl -s localhost:3000/ | grep -c 'Nice to meet you, I am Luis'  # expect 1
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/{employmentHistory,blogIndex}
```

---

## EPIC1-5 — Upgrade to Next 16, React 19, TypeScript 5.9 and `next/font`

- **Type:** chore
- **Size:** M
- **Estimate:** 3
- **Depends on:** EPIC1-4
- **Touch:** `site-nextjs/package.json`, `site-nextjs/yarn.lock`,
  `site-nextjs/tsconfig.json`, `site-nextjs/pages/_app.tsx`, `AGENTS.md`,
  type-only fixes in `staticData/`, `components/`, `pages/` as the compiler
  demands

**Context**

R1 dependency versions, R2 (`@next/font` is dead at 14.2.15 but imported at
`pages/_app.tsx:4`), R3's residual Next 16 behaviour, R4 (`next typegen && tsc`,
tsconfig baseline). These cannot be separated: Next 16 needs TS ≥ 5.1, React 19
is its peer, and the build fails on `@next/font` the moment Next 16 is installed,
so the font import swap rides here. The router does not move — Next 16 still
serves `pages/`, which is what makes the bump verifiable against unchanged route
code — and the strictness flags land with the TS bump, per the spec, not later.

> **Containment rule.** Fix type errors at their cause, type-only, no behaviour
> change. If a flag demands a real refactor (extracting logic, restructuring a
> component), stop and report: that is Phase 3/4 work and would blow this
> ticket's size.

**Acceptance criteria**

- [ ] Exact versions: `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`,
      `typescript@5.9.3`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`,
      `@types/node@26.6.6`; `@next/font` removed; `react-icons`, `autoprefixer`,
      `postcss` specifiers unchanged; one `yarn.lock`.
- [ ] `yarn install --frozen-lockfile` exits 0 with no peer warning; `yarn why
      next` and `yarn why typescript` each report exactly one version.
- [ ] `pages/_app.tsx` imports `Inconsolata` from `next/font/google` and applies
      `inconsolata.className` to the same `Layout` wrapper element as today;
      `grep -r "@next/font" .` (excluding `node_modules`) is empty.
- [ ] No request to `fonts.googleapis.com` in the network log under `yarn dev` or
      `yarn start`; the font is served from the build.
- [ ] `tsconfig.json`: `target: "ES2022"`, `moduleResolution: "bundler"`,
      `include` contains `.next/types/**/*.ts`, and `noUncheckedIndexedAccess`,
      `exactOptionalPropertyTypes`, `noImplicitOverride`,
      `verbatimModuleSyntax` are all on; `strict: true` stays.
- [ ] `"typecheck": "next typegen && tsc --noEmit"`; `yarn typecheck` exits 0
      after `rm -rf .next next-env.d.ts`.
- [ ] No new `@ts-expect-error`, `@ts-ignore` or `as any` in the diff.
- [ ] `next.config.js` and `postcss.config.js` are unchanged
      (`git diff --exit-code`); built CSS under `.next/static/css/` still carries
      vendor prefixes.
- [ ] `yarn build` reports Turbopack and lists `/`, `/404`,
      `/employmentHistory`, `/blogIndex` all static, no dynamic route.
- [ ] Parity with EPIC1-1: the three routes return 200 with the same body text
      modulo whitespace, and the computed `font-family`/`font-weight` of the `h1`
      on `/` equal the recorded baseline strings.
- [ ] The four `react-icons` render on `/` with no React 19 console warning or
      error.
- [ ] Pages router stays: no `app/` directory, no `pages/` deletion, no
      `pagesStyles/` move.
- [ ] `git status --porcelain` is clean after `yarn build`.
- [ ] `AGENTS.md`: Stack rows read Next 16.4.6 / React 19.3.1 / TS 5.9.3;
      Commands gains a `typecheck` row and loses the "`next-env.d.ts` is needed
      before `tsc`" caveat; `next lint` is not mentioned anywhere.

**Verification**

```bash
# from site-nextjs/, Node 26.13.1
node -v                                              # expect v26.13.1
yarn install --frozen-lockfile                       # expect no peer warnings
yarn why next                                        # expect one version
yarn why typescript                                  # expect one version
grep -rn "@next/font" . --exclude-dir={node_modules,.next,.git}   # expect empty
rm -rf .next next-env.d.ts
yarn typecheck                                       # expect exit 0 (this is R4)
yarn lint                                            # expect exit 0
yarn build                                           # expect Turbopack + all routes static
git status --porcelain                               # expect empty
yarn start & sleep 3
curl -s localhost:3000/ | grep -c 'Nice to meet you, I am Luis'   # expect 1
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/{employmentHistory,blogIndex}
# then in devtools: computed font-family / font-weight on h1 of / == Phase 0
#                  console clear on all three routes, network free of fonts.googleapis.com
```

---

## Not yet ticketed

Deliberately withheld: each of these needs evidence that does not exist until the
tickets above have run, and writing them now would produce tickets that get
rewritten.

- **Phase 2 — App Router.** Needs EPIC1-1's captured `/nope` body and per-route
  `<head>`/DOM baseline, plus EPIC1-5's final route table and its answer on
  whether `metadata.icons = { icon: 'data:,' }` survives — the `app/not-found.tsx`
  decision and every parity criterion are unwritable without those.
- **Phase 3 — Vitest and `lib/` extraction.** Needs EPIC1-3's proof that Node 26
  installs and builds, EPIC1-5's `yarn typecheck` baseline, and Phase 2's final
  file paths — extraction targets and test paths depend on where the files land.
- **Phase 4 — Standards refactor and diagnosis.** Needs the post-Phase-2 tree so
  the diagnosis line numbers are re-verified once, and the Phase 3 suite as the
  behaviour guard for the edits it authorises.
