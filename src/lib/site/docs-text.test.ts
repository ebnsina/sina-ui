import { describe, expect, it } from 'vitest';
import { docs, markdown } from './docs-text';

describe('docs for language models', () => {
	it('gives every page in the navigation a description', () => {
		expect(docs.length).toBeGreaterThan(70);
		expect(docs.filter((d) => !d.description).map((d) => d.href)).toEqual([]);
	});
	it('keeps a page’s install command and example code intact, with project import paths', () => {
		const md = markdown('/components/sortable');
		expect(md).toContain('# Sortable');
		expect(md).toContain('npx sina-ui add sortable');
		expect(md).toContain("import Sortable from '$lib/sina-ui/ui/Sortable.svelte';");
		expect(md).toContain('{#snippet children(book, handle, { index })}');
		expect(md).not.toContain('<Example');
	});
});
