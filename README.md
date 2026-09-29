# Sina UI

Accessible Svelte 5 components that feel finished. You copy a component into your project and own
the code: no package to update, nothing hidden.

**[Browse the components →](https://ebnsina.github.io/sina-ui/)**

[Report a bug](https://github.com/ebnsina/sina-ui/issues/new?template=bug_report.yml) ·
[Ask for a component](https://github.com/ebnsina/sina-ui/issues/new?template=feature_request.yml) ·
[Contribute](#contributing)

## What you get

- **Works for everyone.** Every component follows the WAI-ARIA patterns, works with only a
  keyboard, and reads correctly in screen readers.
- **Every screen size.** Each page fits a 320px phone with nothing hidden off the side, and touch
  targets are big enough for a thumb.
- **Right-to-left languages.** Arabic, Urdu and Hebrew layouts mirror correctly.
- **Light and dark.** It follows the reader's system setting, or their own choice.
- **Calm motion.** Animations are short, and they turn down for readers who ask their system for
  less motion.
- **Your brand.** Change colours, corners, type and motion with a few CSS variables. See
  [Theming](https://ebnsina.github.io/sina-ui/theming).

There are 68 components, 7 widgets and 6 full blocks: an AI chat, a calendar, a dashboard, a file
explorer, a kanban board and a media generator.

## Using a component

1. Open the component's page, for example
   [Dialog](https://ebnsina.github.io/sina-ui/components/dialog).
2. Copy the files listed under **Installation** into your project. Most need only the component
   and `tokens.css`.
3. Import `tokens.css` once in your root layout, then use the component.

Each component's files are also available as JSON, for tools and scripts:
`https://ebnsina.github.io/sina-ui/r/<name>.json`, with a full list at
[`/r/index.json`](https://ebnsina.github.io/sina-ui/r/index.json).

Needs Svelte 5 and SvelteKit.

## Where it's tested

Before every deploy, each page is checked automatically for accessibility problems (WCAG 2.2 AA)
and for sideways scrolling, on:

| Desktop                 | Phone and tablet                                 |
| ----------------------- | ------------------------------------------------ |
| Chrome, Safari, Firefox | iPhone (Safari), Android (Chrome), iPad (Safari) |

The components also have their own tests, in light and dark, for keyboard use, focus and screen
reader output. These are
automated checks in real browser engines, not a substitute for trying a component on your own phone.
If something is off on your device, please [tell us](#reporting-a-bug).

## Reporting a bug

[Open a bug report](https://github.com/ebnsina/sina-ui/issues/new?template=bug_report.yml). The
form asks for:

- the component and what you did
- what you expected, and what happened instead
- your browser and device, plus whether you were using a screen reader or keyboard only

A link to a small reproduction, or a screen recording, makes a fix much faster.

**Found a security problem?** Please don't open a public issue. Use
[Report a vulnerability](https://github.com/ebnsina/sina-ui/security/advisories/new) instead, which
only the maintainer can see.

## Asking for a component

[Open a request](https://github.com/ebnsina/sina-ui/issues/new?template=feature_request.yml) and
describe what you're building. The real situation helps more than a component name.

## Contributing

Fixes, new examples and clearer docs are all welcome. For a new component or a large change, please
open an issue first so we can agree on the approach before you spend time on it.

You'll need Node 24 and [pnpm](https://pnpm.io) 11.

```sh
git clone git@github.com:ebnsina/sina-ui.git
cd sina-ui
pnpm install
pnpm dev                # the docs site, at http://localhost:5173
```

Before you send a pull request, check that these pass:

```sh
pnpm check              # types
pnpm test:unit --run    # component tests in Chromium and WebKit
pnpm exec playwright test   # every page on every browser and device
```

What we look for in a change:

- **Accessible first.** Keyboard use, focus and screen reader output work, and there's a test that
  shows it.
- **Fits a phone.** Nothing makes a 320px-wide page scroll sideways.
- **Plain words.** Docs and error messages are written for people, not for the code.
- **Small.** Use the platform (HTML, CSS, `Intl`) before adding a dependency.

## Supporting the project

Sina UI is free, and built in the open. You can help by starring the repository, reporting bugs,
improving the docs, or telling someone who's building with Svelte. Sponsorship will open here once
it's set up.

## For maintainers

### Deploying

Every push to `main` runs the page checks on all six browsers and devices, then builds the site and
publishes it to GitHub Pages (`.github/workflows/deploy.yml`). Nothing is published if a check fails.
The build turns every page into static HTML and fails if any link points to a page or section that
doesn't exist.

### What the site serves besides pages

| Path                              | What                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `/r/index.json`, `/r/<name>.json` | The component registry, built from the source on every deploy      |
| `/llms.txt`, `/llms-full.txt`     | The docs for language models: an index, and everything in one file |
| `/skill.md`                       | An agent skill for building with Sina UI                           |
| `/sitemap.xml`, `/robots.txt`     | Generated from the navigation                                      |
| `/og/<page>.png`                  | Social preview images                                              |

### Preview images

Pages share one card design. After adding or renaming pages, regenerate the images with the dev
server running, and commit them:

```sh
SITE=http://localhost:5173 pnpm og
```

### The command

`cli/` holds the `sina-ui` command: `init`, `add <name…>` and `list`. It isn't published yet, and
the `sina-ui` name on npm belongs to an unrelated package. Run it from the repository:

```sh
SINA_UI_REGISTRY=https://ebnsina.github.io/sina-ui node cli/index.js add dropdown
```
