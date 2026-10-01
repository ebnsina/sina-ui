# Sina UI

Accessible Svelte 5 components people copy into their project (shadcn-style, no package), plus a
paid Pro tier of larger blocks and full templates. Docs site: SvelteKit, fully prerendered,
deployed to GitHub Pages.

## Commands

- `pnpm dev` — docs site (the checks below assume `pnpm dev --port 5199`)
- `pnpm check` — svelte-check; keep it at 0 errors and 0 warnings
- `pnpm lint` / `pnpm format` — prettier + eslint
- `pnpm test:unit --run` — vitest (unit + browser component tests in `src/lib/ui/ui.svelte.spec.ts`)
- `pnpm test:e2e` — builds, then axe + "no sideways scroll" on every nav page and template page
  (`src/routes/site.e2e.ts`); run a subset with `npx playwright test --project=chrome -g "…"`
- `SITE=http://localhost:5199 pnpm og` — regenerate share images (`static/og/`); the build fails
  if a page's image is missing
- `node scripts/qa.mjs freeze|clip|cover|monkey [paths…]` — freeze/crash, clipped text, covered
  text and random-interaction checks (see the header of the script)

## Layout

- `src/lib/ui/` — components (free). `tokens.css` holds every color, radius and motion token.
- `src/lib/blocks/` — free blocks. Everything under `ui/` and `blocks/` is published by the CLI
  registry (`src/lib/site/registry.ts`, built from the source).
- `src/lib/pro/` and `src/routes/pro/` — Pro blocks and templates. They live in the **private**
  `ebnsina/sinaui-pro` repo, checked out in place (git dir `.pro.git`, ignored here). Use
  `pnpm pro <git command>` for them; new files need `pnpm pro add -f`. Never commit them to this
  public repo. CI pulls them in with the `PRO_DEPLOY_KEY` deploy key. Outside the registry: never
  install-able for free. Docs pages for Pro show live previews only (`<Example component={…}>`, no code) and a
  "Get it" link to `/pro`, never an `<Install>`.
- `src/lib/site/` — docs-site pieces: `nav.ts` (the sidebar, search and changelog lists all come
  from it), `Example.svelte`, `DevicePreview.svelte`, `changelog.ts`.
- `src/routes/components|blocks|widgets/<name>/` — docs page + `examples/*.svelte`.
- `src/routes/pro/<name>/` — Pro docs page; a template's own pages live in
  `src/routes/pro/<name>/site/…` or `…/app/…`, which the root layout renders bare (no docs chrome,
  matched by `/pro/<name>/(site|app)` in `src/routes/+layout.svelte`).

## Design rules

- Tokens only (`--ui-*`), emerald accent. Radii: `--ui-radius` (surfaces), `--ui-radius-control`.
- No borders except on fields, checkbox/radio outlines, the tab hairline and accordion dividers.
  Everything else separates by tint or shadow; no colored edge stripes on cards or events.
- Motion: `--ui-ease-enter|out|exit|spring`, `--ui-dur-*`, and `ease`/`ms`/`reflow`/`pop` from
  `motion.ts`. Transform and opacity only; every animation has a reduced-motion fallback.
- One motion system per element (label swaps go through `Morph.svelte`; never two overlapping fades).
- Whatever animates in animates out: dialogs, panels, popovers and list items play their exit before
  `close()` / `hidePopover()` / removal, and keep any layout space until the exit ends.
- Every overflow area gets `{@attach scrollEdges}` + `data-fade` (`data-fade="x"` sideways).
- React Aria is the bar for keyboard, focus and screen-reader behavior; native elements first.
- Copy is plain language, including errors, in US English (color, center, gray, catalog,
  organize, canceled; display dates and numbers through `en-US`). Demo content uses Islamic Golden Age names and places.
- Formatting through `Intl` only. Dates through `@internationalized/date`.

## Templates (Pro)

Each template mirrors the Daftar ones:

- `content.ts` with the product's shared words and a base-path-aware `to()` / `app()` link helper.
  Never hard-code paths; the site may be served under a base path.
- A typed `api/` (`types.ts` interface + `ApiError` codes, `mock.ts` with delays, `failNext()` and
  localStorage, `client.ts` as the single swap point, `errors.ts` code → plain message).
- Shared page classes are prefixed (`.site-title`, never `.title`): unprefixed globals leak into
  components. The main area is `<div id="main" role="main">`, not `<main>`, so the docs'
  `main …` styles don't reach it. Page headings inside it are `<div>`s, not `<header>`: axe counts a
  `<header>` there as a second banner. Loading states still render an `<h1>` (visually hidden is fine).
- Dynamic routes need `entries` in `+page.ts` (the site is prerendered).
- The Pro bar: a signature, hard-to-build piece, many real pages, every loading/empty/error state,
  and full-page screenshot review at desktop, phone and dark before calling it done. No fake
  testimonials, logos or stats.

## Known traps

- `SpeechRecognition` (incl. `.available()`) can crash the tab in current Chromium. The voice demo
  doesn't use it; spoken input goes through a connected voice service (`VoiceAdapter`).
- An `$effect` that reads the URL and writes state it also reads loops forever and freezes the tab;
  wrap the load in `untrack`.
- svelte-check can't follow `#lib/…` TypeScript imports without the `.js` suffix.
- `resolve()` is typed to known routes; cast with `as '/'` (see `src/lib/site/root.ts`) for template
  paths built at runtime.

## Working agreements

- Changelog: `src/lib/site/changelog.ts`. 1.0 (unreleased) lists foundations plus the nav; don't add
  fix history before a release ships.
- Roadmap and plans live in `docs/` (gitignored).
- Commits as `ebnsina <ebnsina.me@gmail.com>`, no co-author trailers.
