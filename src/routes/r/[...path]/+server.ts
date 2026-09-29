import { error, json } from '@sveltejs/kit';
import { registry } from '#lib/site/registry.js';
import type { EntryGenerator, RequestHandler } from './$types';

// Static files at build: /r/index.json lists everything, /r/<name>.json is one item.
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ path: 'index.json' },
	...Object.keys(registry).map((name) => ({ path: `${name}.json` }))
];

export const GET: RequestHandler = ({ params }) => {
	if (params.path === 'index.json') return json({ items: Object.keys(registry).sort() });
	const name = params.path.replace(/\.json$/, '');
	const item = registry[name];
	if (!params.path.endsWith('.json') || !item) error(404, `No component called ${name}`);
	return json(item());
};
