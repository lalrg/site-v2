# Phase 0 baseline — Epic 1 (Foundation)

Evidence captured before any change to `site-nextjs/`, so "looks identical" is
falsifiable. This is the source of truth that EPIC1-5 (font parity), Phase 2
(404 parity, R15) and the visual-parity gate read from.

- **Date:** 2026-11-16
- **Captured at commit:** `44ce575c0f982512443f7c24ad9ee9d60a264f2e` (`main`)
- **Epic base reference:** the spec names `3ddf0f3` as the epic base. The app
  code at the capture commit is byte-identical to it:
  `git diff 3ddf0f3 HEAD -- site-nextjs/` is empty. `3ddf0f3` is the
  pre-squash form of the onboarding commit; squash-merge rewrote it to
  `56faa38`, so it does not exist on `main`'s first-parent line. App code is
  identical either way.
- **Runtime:** Node `v23.11.0`, yarn `1.22.22`
- **Storage path (outside the repo):** `/Users/luisrichmond/epic1-baseline/`
  — screenshots and verbatim `curl` bodies live there; they are evidence, not
  repo artifacts. This manifest records the exact strings the later phases
  compare against.

## Capture commands

```bash
# from site-nextjs/
node -v                                   # v23.11.0
yarn -v                                   # 1.22.22
git rev-parse HEAD                        # 44ce575c0f982512443f7c24ad9ee9d60a264f2e
yarn build                                # route table pasted below
yarn start                                # then, per route:
curl -s localhost:3000/ > ~/epic1-baseline/curl-root.html
curl -s localhost:3000/employmentHistory > ~/epic1-baseline/curl-employment.html
curl -s localhost:3000/blogIndex > ~/epic1-baseline/curl-blog.html
curl -s localhost:3000/nope > ~/epic1-baseline/curl-404.html
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/nope   # 404
# screenshots: full-page, 320/768/1280 CSS px, via Playwright
```

## Route table (verbatim `yarn build`)

```
Route (pages)                              Size     First Load JS
┌ ○ /                                      2.19 kB        79.5 kB
├   └ css/f469fc27420f2ea4.css             275 B
├   /_app                                  0 B            77.3 kB
├ ○ /404                                   179 B          77.5 kB
├ ○ /blogIndex                             291 B          77.6 kB
└ ○ /employmentHistory                     1.77 kB        79.1 kB
    └ css/482a793ecc64ac85.css             577 B
+ First Load JS shared by all              78.5 kB
  ├ chunks/framework-114634acb84f8baa.js   45.4 kB
  ├ chunks/main-010ff0b6bbe5ac8f.js        27.1 kB
  ├ chunks/pages/_app-336206846f39a621.js  4.12 kB
  ├ chunks/webpack-8fa1640cc84ba8fe.js     753 B
  └ css/962813f054869080.css               1.19 kB

○  (Static)  automatically rendered as static HTML (uses no initial props)
```

All four routes are `○` static, on the pages router.

## Routes, status and saved bodies

| Route | HTTP | Verbatim `curl` body (outside repo) | Bytes |
| --- | --- | --- | --- |
| `/` | 200 | `~/epic1-baseline/curl-root.html` | 7507 |
| `/employmentHistory` | 200 | `~/epic1-baseline/curl-employment.html` | 8005 |
| `/blogIndex` | 200 | `~/epic1-baseline/curl-blog.html` | 3188 |
| `/nope` | **404** | `~/epic1-baseline/curl-404.html` | 4311 |

## `<head>` per route

| Route | title | meta description | viewport | favicon |
| --- | --- | --- | --- | --- |
| `/` | `Lalrg's site` | `My profesional story, information to contact me, and some blog entries(coming soon)` | `width=device-width, initial-scale=1` | `data:,` |
| `/employmentHistory` | `Lalrg's site` | same | same | `data:,` |
| `/blogIndex` | `Lalrg's site` | same | same | `data:,` |
| `/nope` (404) | `404: This page could not be found` | same | same | `data:,` |

The description string is verbatim, including the "profesional" typo (content —
Epic 2, not this epic's concern). The favicon is the `data:,` suppression hack.

## Font baseline (`h1` on `/`)

Computed via `getComputedStyle(document.querySelector('h1'))` at 1280px:

- **font-family:** `__Inconsolata_19771d, __Inconsolata_Fallback_19771d`
- **font-weight:** `500`
- **font-size:** `30px`

This is what EPIC1-5 (R2) must match after moving to `next/font/google`.
The `@next/font` class applied to the wrapper is `__className_19771d`.

## Nav baseline (active link per route)

Header nav links are, in order: `Intro and contact Info` (`/`),
`Employment History` (`/employmentHistory`), `Blog` (`/blogIndex`). The active
link carries class `header_link__Dge_q header_linkActive__QZ2VP` (R8).

| Route | Active link | Active class string |
| --- | --- | --- |
| `/` | `Intro and contact Info` | `header_link__Dge_q header_linkActive__QZ2VP` |
| `/employmentHistory` | `Employment History` | `header_link__Dge_q header_linkActive__QZ2VP` |
| `/blogIndex` | `Blog` | `header_link__Dge_q header_linkActive__QZ2VP` |
| `/nope` (404) | none | — |

## Scroll-landing check (R7)

From `/`, clicking each header nav link and reading `window.scrollY` at the
target, at both 320px and 1280px:

| Width | Target | `scrollY` |
| --- | --- | --- |
| 320 | `/employmentHistory` | 0 |
| 320 | `/blogIndex` | 0 |
| 1280 | `/employmentHistory` | 0 |
| 1280 | `/blogIndex` | 0 |

Every header link lands at the top of its target route at both widths. No
`scroll-behavior` declaration exists in the repo (`grep -rn "scroll-behavior"`
is empty), consistent with spec R7's decision not to add
`data-scroll-behavior="smooth"`.

## Filter chips baseline (R9)

The skill chips on `/employmentHistory`, in DOM order — the order and set that
Phase 2 must reproduce exactly:

```
Javascript, Typescript, .Net, SQL Server, Microservices, CSS,
.NetCore, Azure, React, AWS, Vue
```

(11 chips.)

## Company names baseline (R9 — JS-off content)

All five company names are present in the static HTML of `/employmentHistory`
(`curl` body, no JS executed), so filtering degrades to a full list when JS is
off:

```
GreenSlate, Gorilla Logic, Growth Acceleration Partners, Ernst&Young,
Datasoft Netsolutions
```

## 404 baseline (Phase 2 parity source)

`/nope` returns `404` with the pages-router default error page. Visible text:

```
404   This page could not be found .
```

It renders an `h1` with class `next-error-h1` and an inline `<style>` block
(including `@media (prefers-color-scheme: dark)`). The full body is saved at
`~/epic1-baseline/curl-404.html`. Phase 2 must reproduce this body text and
structure with the App Router default `not-found`, or add `app/not-found.tsx`
to match (spec R5).

## Screenshots (12 full-page, outside repo)

| File (in `~/epic1-baseline/`) | Width (CSS px) | Rendered size (px) |
| --- | --- | --- |
| `root-320.png` | 320 | 320 × 854 |
| `root-768.png` | 768 | 768 × 800 |
| `root-1280.png` | 1280 | 1280 × 800 |
| `employment-320.png` | 320 | **332** × 2153 |
| `employment-768.png` | 768 | 768 × 2061 |
| `employment-1280.png` | 1280 | 1280 × 1148 |
| `blog-320.png` | 320 | 320 × 800 |
| `blog-768.png` | 768 | 768 × 800 |
| `blog-1280.png` | 1280 | 1280 × 800 |
| `notfound-320.png` | 320 | 320 × 994 |
| `notfound-768.png` | 768 | 768 × 994 |
| `notfound-1280.png` | 1280 | 1280 × 994 |

## Notes / evidence recorded alongside

- **320px horizontal overflow on `/employmentHistory` is real.** The full-page
  screenshot at 320px renders **332px wide** — the page overflows horizontally,
  consistent with spec D4 (`.mainWHI { width: 18.75rem }` exceeds the available
  width at 320px). Confirmed in the browser, not just by arithmetic.
- All other routes fit their viewport width at 320px (screenshots are exactly
  320px wide).
- `caniuse-lite` is outdated and logs a warning on build (known noise, not a
  failure).
