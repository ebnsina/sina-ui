<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';

	const ex = examples(
		import.meta.glob<Component>('./examples/*.svelte', { eager: true, import: 'default' }),
		import.meta.glob<string>('./examples/*.svelte', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	);
</script>

<svelte:head>
	<title>Mention input — Sina UI</title>
	<meta
		name="description"
		content="A text box where typing @ suggests people at the caret; each mention becomes one token and is tracked by id."
	/>
	<meta property="og:title" content="Mention input — Sina UI" />
	<meta
		property="og:description"
		content="A text box where typing @ suggests people at the caret; each mention becomes one token and is tracked by id."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Mention input</h1>
<p class="lede">
	For comments and notes where people are tagged. Type <kbd>@</kbd> and matching names appear right at
	the caret; each mention is tinted, deleted in one go, and handed back as an id.
</p>

<h2 id="installation">Installation</h2>
<Install names="mention-input">
	<p>
		Copy <code>src/lib/ui/MentionInput.svelte</code>, with <code>Avatar.svelte</code>,
		<code>announce.ts</code>, <code>floating.ts</code>, <code>glide.ts</code>,
		<code>motion.ts</code>, <code>spring.ts</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="From a list"
	stack
	description="Type @ and a few letters. Enter or Tab puts the name in; Backspace straight after a name removes all of it."
	{...ex('basic')}
/>
<Example
	id="search"
	title="From your server"
	stack
	description="Pass search to look people up as you type; only the latest answer is shown."
	{...ex('search')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code> (bindable)</td><td><code>''</code></td
			></tr
		>
		<tr
			><td><code>mentions</code></td><td
				><code>string[]</code>: ids of the people in the text (bindable)</td
			><td><code>[]</code></td></tr
		>
		<tr
			><td><code>people</code></td><td><code>{'{ id, name, detail?, avatar? }[]'}</code></td><td
				><code>[]</code></td
			></tr
		>
		<tr
			><td><code>search</code></td><td><code>(query) =&gt; Promise&lt;Person[]&gt;</code></td><td
			></td></tr
		>
		<tr
			><td><code>rows</code></td><td><code>number</code>: starting height in lines</td><td
				><code>3</code></td
			></tr
		>
		<tr
			><td><code>placeholder</code>, <code>hint</code>, <code>error</code>, <code>name</code></td
			><td><code>string</code></td><td></td></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>empty</code></td><td><code>string</code></td><td
				><code>'No one by that name'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>@</kbd></td><td>Starts a mention and shows suggestions</td></tr>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Moves through the suggestions</td></tr>
		<tr><td><kbd>Enter</kbd> <kbd>Tab</kbd></td><td>Puts the highlighted name in</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Closes the suggestions and keeps typing plain text</td></tr>
		<tr><td><kbd>Backspace</kbd></td><td>Straight after a mention, removes the whole name</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The text box points at the highlighted suggestion, so screen readers read it as you move.</li>
	<li>The number of matches is announced, and so is each name added or removed.</li>
	<li>Names are plain text in the field: copying and pasting keeps them readable.</li>
</ul>
