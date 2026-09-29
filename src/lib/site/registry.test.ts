import { describe, expect, it } from 'vitest';
import { registry } from './registry';

const pages = import.meta.glob<string>('/src/routes/**/+page.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

describe('registry', () => {
	it('builds every item, each with its files and no import left unresolved', () => {
		for (const [name, build] of Object.entries(registry)) {
			const item = build();
			expect(item.files.length, name).toBeGreaterThan(0);
		}
	});
	it('installs every name the docs pages tell people to add', () => {
		const named = Object.entries(pages).flatMap(([path, src]) =>
			[...src.matchAll(/<Install names="([^"]+)"/g)].flatMap((m) =>
				m[1].split(' ').map((n) => [path, n] as const)
			)
		);
		expect(named.length).toBeGreaterThan(70);
		for (const [path, name] of named) expect(registry[name], `${path}: ${name}`).toBeDefined();
	});
});
