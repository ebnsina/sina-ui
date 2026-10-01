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
	<title>Command palette — Sina UI</title>
	<meta name="description" content="Search and run any command from the keyboard with ⌘K." />
	<meta property="og:title" content="Command palette — Sina UI" />
	<meta property="og:description" content="Search and run any command from the keyboard with ⌘K." />
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Command palette</h1>
<p class="lede">
	Finds and runs any command by typing a few letters. Opens with <kbd>⌘</kbd> <kbd>K</kbd> (<kbd
		>Ctrl</kbd
	> <kbd>K</kbd> on Windows and Linux).
</p>

<h2 id="installation">Installation</h2>
<Install names="command-palette">
	<p>
		Copy <code>src/lib/ui/CommandPalette.svelte</code>, <code>glide.ts</code>,
		<code>announce.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="Matches the start of a label first, then the start of a word, then anywhere, then keywords; accents don't matter."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr>
			<td><code>commands</code></td>
			<td><code>{'{'} id, label, onselect, group?, keywords?, shortcut?, icon? }[]</code></td>
			<td></td>
		</tr>
		<tr
			><td><code>open</code></td><td><code>boolean</code>, bindable</td><td><code>false</code></td
			></tr
		>
		<tr><td><code>shortcut</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
		<tr
			><td><code>label</code></td><td><code>string</code></td><td><code>'Command palette'</code></td
			></tr
		>
		<tr
			><td><code>placeholder</code>, <code>empty</code></td><td><code>string</code></td><td
			></td></tr
		>
	</tbody>
</table>
<p>A command's <code>shortcut</code> is shown beside it; the keys themselves are yours to bind.</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A modal dialog: the page behind can't be reached, and closing puts focus back where it was.
	</li>
	<li>
		Focus stays in the search box and points at the highlighted command; the number of matches is
		announced as you type.
	</li>
	<li>The list keeps one height while you type, so nothing jumps under the pointer.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>⌘</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>K</kbd></td><td>Open or close.</td></tr
		>
		<tr><td><kbd>↓</kbd> <kbd>↑</kbd></td><td>Next / previous command, wrapping round.</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Run the highlighted command.</td></tr>
		<tr><td><kbd>Esc</kbd></td><td>Close.</td></tr>
	</tbody>
</table>
