import { root } from '#lib/site/root.js';
import { docs } from '#lib/site/docs-text.js';
import type { RequestHandler } from './$types';

export const prerender = true;

// An Agent Skill (Claude Code and others): save as .claude/skills/sinaui/SKILL.md in a project.
export const GET: RequestHandler = ({ url }) => {
	const list = docs
		.filter(
			(d) =>
				d.href.startsWith('/components') ||
				d.href.startsWith('/widgets') ||
				d.href.startsWith('/blocks')
		)
		.map(
			(d) =>
				`- **${d.title}** (\`${d.href.split('/').pop()}\`)${d.description ? `: ${d.description}` : ''}`
		)
		.join('\n');
	const text = `---
name: sinaui
description: Build Svelte 5 interfaces with Sina UI components. Use when adding UI to a Svelte or SvelteKit app that uses (or could use) Sina UI: forms, overlays, menus, tables, date and time pickers, drag and drop, charts, AI chat, calendars, boards.
---

# Building with Sina UI

Sina UI components are copied into the project and owned there, not imported from a package.

## Adding components

1. \`npx sinaui add <name>\` (several at once: \`npx sinaui add dropdown dialog\`; everything:
   \`npx sinaui add --all\`). Blocks are \`blocks/<name>\`. It writes the files, installs the packages
   they need, and imports the tokens in \`src/routes/+layout.svelte\`.
2. Import from where the files were written (\`src/lib/sinaui/ui/...\` by default).

## Rules

- Use the components rather than raw HTML controls: Button, Input, Select, Dialog and so on.
- Style with the tokens (\`var(--ui-accent)\`, \`var(--ui-fg)\`, \`var(--ui-muted)\`, \`var(--ui-surface)\`,
  \`var(--ui-radius)\`, \`var(--ui-radius-control)\`), never hard-coded colors.
- Every form control needs a \`label\`; icon-only buttons need \`aria-label\`.
- Values bind: \`bind:value\`, \`bind:open\`, \`bind:checked\`.
- Dates use \`@internationalized/date\` (\`CalendarDate\`, \`CalendarDateTime\`); format numbers and dates with \`Intl\`.
- Keep the built-in motion, keyboard handling and announcements; don't replace them.

## Components

${list}

## More

- Full docs with every example's source: ${root(url)}/llms-full.txt
- One component's files: ${root(url)}/r/<name>.json
`;
	return new Response(text, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
