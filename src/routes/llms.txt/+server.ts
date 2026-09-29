import { docs } from '#lib/site/docs-text.js';
import type { RequestHandler } from './$types';

// The llms.txt index (llmstxt.org): what Sina UI is, and every page with a line on what it's for.
export const GET: RequestHandler = ({ url }) => {
	const sections = [...new Set(docs.map((d) => d.section))];
	const text = `# Sina UI

> Accessible Svelte 5 components that feel finished: copy them into your project with the sina-ui CLI and own the code. Built on CSS variables, with keyboard and screen reader support, right-to-left, light and dark, and motion throughout.

Install any component with \`npx sina-ui add <name>\` (for example \`npx sina-ui add dropdown blocks/chat\`). Components read their colours, corners and type from tokens.css.

- [Everything in one file](${url.origin}/llms-full.txt): every page with its examples' source
- [Skill for AI coding assistants](${url.origin}/skill.md): how to build with Sina UI
- [Registry](${url.origin}/r/index.json): installable items; /r/<name>.json has one item's files

${sections
	.map(
		(s) =>
			`## ${s}\n\n${docs
				.filter((d) => d.section === s)
				.map(
					(d) =>
						`- [${d.title}](${url.origin}${d.href})${d.description ? `: ${d.description}` : ''}`
				)
				.join('\n')}`
	)
	.join('\n\n')}
`;
	return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
