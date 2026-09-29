import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rewrite } from './index.js';

test('lib imports become relative to where the file is written', () => {
	assert.equal(
		rewrite(`import B from '#lib/ui/Button.svelte';`, 'blocks/chat/Chat.svelte'),
		`import B from '../../ui/Button.svelte';`
	);
	assert.equal(
		rewrite(`import { a } from "#lib/ui/announce.js";`, 'ui/Toolbar.svelte'),
		`import { a } from "./announce.js";`
	);
	assert.equal(
		rewrite(`import x from './floating';`, 'ui/Popover.svelte'),
		`import x from './floating';`
	);
});

test('the tokens import goes into the layout once, and a missing layout is created', async () => {
	const { mkdtemp, readFile, writeFile } = await import('node:fs/promises');
	const { tmpdir } = await import('node:os');
	const { join } = await import('node:path');
	const { importIn } = await import('./index.js');
	const dir = await mkdtemp(join(tmpdir(), 'sinaui-'));
	const line = "import '../lib/sina-ui/ui/tokens.css';";

	const made = join(dir, 'new/+layout.svelte');
	assert.equal(await importIn(made, line), true);
	assert.match(await readFile(made, 'utf8'), /tokens\.css[\s\S]*\{@render children\(\)\}/);

	const existing = join(dir, '+layout.svelte');
	await writeFile(existing, '<script lang="ts">\n\tlet { children } = $props();\n</script>\n');
	assert.equal(await importIn(existing, line), true);
	assert.equal(await importIn(existing, line), false);
	assert.equal((await readFile(existing, 'utf8')).split(line).length, 2);
	assert.match(await readFile(existing, 'utf8'), /^<script lang="ts">\n\timport/);
});
