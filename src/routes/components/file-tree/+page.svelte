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
	<title>File tree — Sina UI</title>
	<meta
		name="description"
		content="Folders and files you can open, close and choose from, by keyboard or pointer."
	/>
	<meta property="og:title" content="File tree — Sina UI" />
	<meta
		property="og:description"
		content="Folders and files you can open, close and choose from, by keyboard or pointer."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>File tree</h1>
<p class="lede">Shows folders and files, to open, close and choose from.</p>

<h2 id="installation">Installation</h2>
<Install names="file-tree">
	<p>
		Copy <code>src/lib/ui/FileTree.svelte</code> with <code>SearchField.svelte</code>,
		<code>Input.svelte</code>, <code>InputButton.svelte</code>, <code>Icon.svelte</code>,
		<code>scroll-edges.ts</code> and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Archive"
	stack
	description="Folders open smoothly and the rows below slide down to make room. Type a name's first letters to jump to it."
	{...ex('basic')}
/>
<Example
	id="catalog"
	title="Over 120,000 items, with search"
	stack
	description="Only the rows in view are ever drawn, so it scrolls as easily as a short list. Search looks through everything and opens the folders that hold the matches."
	{...ex('catalog')}
/>
<Example
	id="lazy"
	title="Loaded as it opens"
	stack
	description="Folders fetch their contents the first time they open, as from a server; a spinner turns in place of its arrow meanwhile."
	{...ex('lazy')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>items</code></td><td><code>{'{'} id, name, children? }[]</code></td><td></td></tr>
		<tr
			><td><code>expanded</code></td><td><code>string[]</code>, bindable: open folders</td><td
				><code>[]</code></td
			></tr
		>
		<tr><td><code>selected</code></td><td><code>string</code>, bindable</td><td></td></tr>
		<tr><td><code>onselect</code></td><td><code>(node) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>load</code></td><td
				><code>(node) =&gt; Promise&lt;TreeNode[]&gt;</code>: fetch a folder when first opened</td
			><td></td></tr
		>
		<tr
			><td><code>searchLabel</code></td><td><code>string</code>: shows a search box</td><td
			></td></tr
		>
		<tr
			><td><code>query</code></td><td><code>string</code>, bindable: the search</td><td
				><code>''</code></td
			></tr
		>
		<tr
			><td><code>height</code></td><td>CSS length of the scrolling area</td><td
				><code>'20rem'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A tree with one Tab stop; each item is read with its level and place ("3 of 30"), folders say
		whether they're open, and the chosen item is marked selected.
	</li>
	<li>However long the tree, the keyboard reaches every item: the list scrolls to follow.</li>
	<li>Search says how many items match; a loading folder says it's busy.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>↓</kbd> <kbd>↑</kbd></td><td>Next / previous visible item.</td></tr>
		<tr><td><kbd>→</kbd></td><td>Open a folder, or step into an open one.</td></tr>
		<tr><td><kbd>←</kbd></td><td>Close a folder, or go up to the folder it's in.</td></tr>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>First / last visible item.</td></tr>
		<tr><td><kbd>Page Up</kbd> <kbd>Page Down</kbd></td><td>A screenful up / down.</td></tr>
		<tr
			><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td
				>Choose the item (and open or close a folder).</td
			></tr
		>
		<tr><td>Letters</td><td>Jump to the next item starting with them.</td></tr>
	</tbody>
</table>
<p>Right to left, <kbd>←</kbd> and <kbd>→</kbd> swap.</p>
