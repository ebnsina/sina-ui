import { root } from '#lib/site/root.js';
import { docs, markdown } from '#lib/site/docs-text.js';
import type { RequestHandler } from './$types';

export const prerender = true;

// All of the docs in one file, for tools that read everything at once.
export const GET: RequestHandler = ({ url }) => {
	const text = docs
		.map((d) => `<!-- ${root(url)}${d.href} -->\n${markdown(d.href)}`)
		.join('\n\n---\n\n');
	return new Response(`# Sina UI documentation\n\n${text}\n`, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
};
