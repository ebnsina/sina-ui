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
	<title>Context menu — Sina UI</title>
	<meta
		name="description"
		content="A menu at the pointer on right-click, long-press or Shift+F10."
	/>
	<meta property="og:title" content="Context menu — Sina UI" />
	<meta
		property="og:description"
		content="A menu at the pointer on right-click, long-press or Shift+F10."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Context menu</h1>
<p class="lede">
	Offers actions for a thing where it is: right-click it, long-press it, or press Shift+F10.
</p>

<h2 id="installation">Installation</h2>
<Install names="context-menu">
	<p>
		Copy <code>src/lib/ui/ContextMenu.svelte</code> and the <code>dropdown/</code> folder, with
		<code>floating.ts</code>, <code>glide.ts</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="The menu opens at the pointer and flips to stay on screen. Its items are Dropdown items: links or actions, with the same keys."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code> (required): names the menu</td><td
			></td></tr
		>
		<tr
			><td><code>children</code></td><td><code>Snippet</code>: the thing with the menu</td><td
			></td></tr
		>
		<tr
			><td><code>menu</code></td><td
				><code>Snippet</code>: <code>Dropdown.Item</code>s and <code>Dropdown.Separator</code>s</td
			><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The thing can be focused, and screen readers hear how to open its menu.</li>
	<li>
		A right-click is a shortcut: keep the same actions reachable another way, like a “More” button.
	</li>
	<li>Closing puts focus back on the thing.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Shift</kbd> <kbd>F10</kbd>, <kbd>Menu</kbd></td><td>Open the menu.</td></tr>
		<tr><td><kbd>↓</kbd> <kbd>↑</kbd></td><td>Next / previous item.</td></tr>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Choose the item.</td></tr>
		<tr><td><kbd>Esc</kbd></td><td>Close.</td></tr>
	</tbody>
</table>
