# sinaui

Adds [Sina UI](https://ebnsina.github.io/sinaui/) components to your SvelteKit project: accessible
Svelte 5 components you own, copied into your code rather than imported from a package.

Run it in your project's folder:

```sh
npx sinaui add button dialog dropdown
```

It writes each component and everything it imports to `src/lib/sinaui`, installs the packages they
need with your package manager, and imports the design tokens in `src/routes/+layout.svelte`.

```sh
npx sinaui add --all     # everything
npx sinaui list          # what can be added
```

Your edited files are kept on later runs; pass `--overwrite` to replace them. Needs Node 20+,
Svelte 5 and SvelteKit 2 or later. Works with or without Tailwind.

Components take your page's font. To use Sina UI's font tokens everywhere, add
`html { font-family: var(--ui-font); }` to your CSS. Colors and corners live in
`src/lib/sinaui/ui/tokens.css`; see [Theming](https://ebnsina.github.io/sinaui/theming).
