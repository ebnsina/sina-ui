import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rewrite } from './index.js';

test('lib imports become relative to where the file is written', () => {
	assert.equal(rewrite(`import B from '#lib/ui/Button.svelte';`, 'blocks/chat/Chat.svelte'), `import B from '../../ui/Button.svelte';`);
	assert.equal(rewrite(`import { a } from "#lib/ui/announce.js";`, 'ui/Toolbar.svelte'), `import { a } from "./announce.js";`);
	assert.equal(rewrite(`import x from './floating';`, 'ui/Popover.svelte'), `import x from './floating';`);
});
