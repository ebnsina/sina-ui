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
	<title>Tag input — Sina UI</title>
	<meta name="description" content="Type several short values, each becoming a removable tag." />
	<meta property="og:title" content="Tag input — Sina UI" />
	<meta
		property="og:description"
		content="Type several short values, each becoming a removable tag."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Tag input</h1>
<p class="lede">Collects several short values, like keywords, each as a tag you can remove.</p>

<h2 id="installation">Installation</h2>
<Install names="tag-input">
	<p>
		Copy <code>src/lib/ui/TagInput.svelte</code>, <code>announce.ts</code>, <code>Icon.svelte</code>
		and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Enter or a comma adds a tag. Adding one that's already there makes it pulse instead."
	{...ex('basic')}
/>
<Example
	id="max"
	title="With a limit and an error"
	stack
	description="Once the limit is reached, the text box steps aside until a tag is removed."
	{...ex('max')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string[]</code>, bindable</td><td><code>[]</code></td
			></tr
		>
		<tr><td><code>max</code></td><td><code>number</code></td><td></td></tr>
		<tr
			><td><code>name</code></td><td><code>string</code>: each tag is submitted under it</td><td
			></td></tr
		>
		<tr
			><td><code>placeholder</code>, <code>hint</code>, <code>error</code></td><td
				><code>string</code></td
			><td></td></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The tags are a list, read with how many there are; each has a remove button named after it.
	</li>
	<li>Adding, removing and duplicates are announced.</li>
	<li>
		Backspace in the empty text box moves to the last tag first, so a tag isn't deleted by accident.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> <kbd>,</kbd></td><td>Add what was typed.</td></tr>
		<tr><td><kbd>Backspace</kbd> (empty box)</td><td>Move to the last tag.</td></tr>
		<tr
			><td><kbd>←</kbd> <kbd>→</kbd></td><td
				>Move between tags (mirrored right to left); past the last, back to the text box.</td
			></tr
		>
		<tr><td><kbd>Backspace</kbd> <kbd>Delete</kbd> (on a tag)</td><td>Remove it.</td></tr>
	</tbody>
</table>
