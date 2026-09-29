# Sina UI

Accessible Svelte 5 components that feel finished. People copy them into their projects with the
`sina-ui` command and own the code.

This repository is the docs site (SvelteKit), the components themselves (`src/lib/ui`,
`src/lib/blocks`) and the command (`cli/`).

## Working on it

```sh
pnpm install
pnpm dev                 # the docs site
pnpm check               # types
pnpm test:unit --run     # component tests in Chromium and WebKit, plus unit tests
node --test cli/         # the command's own check
```

## What the site serves besides pages

| Path | What |
| --- | --- |
| `/r/index.json`, `/r/<name>.json` | The registry the command installs from, built from the source on every deploy |
| `/llms.txt`, `/llms-full.txt` | The docs for language models: an index, and everything in one file |
| `/skill.md` | An agent skill for building with Sina UI |
| `/sitemap.xml`, `/robots.txt` | Generated from the navigation, with the address the site is served at |
| `/og/<page>.png` | Social preview images |

## Preview images

Pages share one card design. After adding or renaming pages, regenerate the images with the dev
server running, and commit them:

```sh
SITE=http://localhost:5174 pnpm og
```

## The command

`cli/` is the `sina-ui` package: `init`, `add <name…>` and `list`. It reads the site's address from
`SINA_UI_REGISTRY` until the domain is settled.

```sh
SINA_UI_REGISTRY=http://localhost:5174 node cli/index.js add dropdown
```
