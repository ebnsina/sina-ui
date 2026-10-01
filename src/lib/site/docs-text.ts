// The docs as plain text, for language models (llms.txt, llms-full.txt, the skill). Read from the
// pages themselves, so it says exactly what the site says.
import { nav } from './nav';

const pages = import.meta.glob<string>('/src/routes/**/+page.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const examples = import.meta.glob<string>('/src/routes/**/examples/*.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const fileOf = (href: string) => `/src/routes${href === '/' ? '' : href}/+page.svelte`;
const decode = (s: string) =>
	s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&nbsp;/g, ' ');
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];

export type Doc = { title: string; section: string; href: string; description: string };

/** Every page in the navigation, with its one-line description. */
export const docs: Doc[] = nav.flatMap((section) =>
	section.items.map((item) => {
		const src = pages[fileOf(item.href)] ?? '';
		return {
			title: item.title,
			section: section.title,
			href: item.href,
			description: decode(src.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? '')
		};
	})
);

/** One page as Markdown: its prose, install command, props and every example's source. */
export function markdown(href: string): string {
	const src = pages[fileOf(href)] ?? '';
	const dir = fileOf(href).replace('/+page.svelte', '');
	// Code is set aside while tags and expressions are stripped from the prose, then put back intact.
	const kept: string[] = [];
	// Imports point where the CLI puts files in your project, not at this site's own folders.
	const keep = (block: string) =>
		`\u0000${kept.push(block.replaceAll("'#lib/ui/", "'$lib/sinaui/ui/").replaceAll("'#lib/blocks/", "'$lib/sinaui/blocks/")) - 1}\u0000`;
	let body = src
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<style[\s\S]*?<\/style>/g, '')
		.replace(/<svelte:head>[\s\S]*?<\/svelte:head>/g, '');
	body = body
		.replace(/<Install names="([^"]+)"\s*\/?>/g, (_, n) =>
			keep(`\n\`\`\`sh\nnpx sinaui add ${n}\n\`\`\`\n`)
		)
		.replace(/<Code\s+code="([^"]*)"[^>]*\/>/g, (_, c) => keep(`\n\`\`\`\n${decode(c)}\n\`\`\`\n`))
		.replace(/<Example\b([\s\S]*?)\/>/g, (tag) => {
			const id = attr(tag, 'id');
			// Pro examples pass no code to the page, so none goes in the text either.
			const code = id && tag.includes('ex(') ? examples[`${dir}/examples/${id}.svelte`] : undefined;
			return `\n### Example: ${attr(tag, 'title') ?? id}\n\n${attr(tag, 'description') ?? ''}\n${
				code ? keep(`\n\`\`\`svelte\n${code.trim()}\n\`\`\`\n`) : ''
			}`;
		})
		.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '\n# $1\n')
		.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n## $1\n')
		.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n### $1\n')
		.replace(/<\/t[dh]>\s*<t[dh][^>]*>/g, ' | ')
		.replace(/<\/tr>/g, '\n')
		.replace(/<li[^>]*>/g, '\n- ')
		.replace(/<\/p>/g, '\n\n')
		.replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
		.replace(/\{'([^']*)'\}/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/\{[^{}]*\}/g, '');
	return (
		decode(body)
			.split('\n')
			.map((l) => l.replace(/\s+$/, '').replace(/^\t+/, ''))
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			// eslint-disable-next-line no-control-regex -- NUL marks the kept code blocks; it can't occur in source text
			.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[+i])
			.trim()
	);
}
