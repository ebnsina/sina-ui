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
	<title>Menubar — Sina UI</title>
	<meta name="description" content="A row of menus, like a desktop app's File and Edit menus." />
	<meta property="og:title" content="Menubar — Sina UI" />
	<meta
		property="og:description"
		content="A row of menus, like a desktop app's File and Edit menus."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Menubar</h1>
<p class="lede">
	A row of menus, like a desktop app’s File, Edit and View: for tools with many commands.
</p>

<h2 id="installation">Installation</h2>
<Install names="menubar">
	<p>
		Copy <code>src/lib/ui/menubar/</code> and <code>src/lib/ui/dropdown/</code>, with
		<code>floating.ts</code>, <code>glide.ts</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
	<p>
		For a single menu, use a <a href="/components/dropdown">Dropdown</a>. For moving between pages,
		use links (a <a href="/components/sidebar">Sidebar layout</a> or
		<a href="/components/navigation-menu">Navigation menu</a>), not a menubar.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="editor"
	title="An editor"
	stack
	description="Open a menu, then move along the bar with the pointer or the arrow keys: the next menu opens without another click."
	{...ex('editor')}
/>

<h2 id="props">Props</h2>
<h3 id="props-root">Menubar.Root</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>children</code></td><td><code>Menubar.Menu</code> elements</td><td></td></tr>
	</tbody>
</table>
<h3 id="props-menu">Menubar.Menu</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>children</code></td><td
				><code>Menubar.Item</code>, <code>Menubar.Separator</code></td
			><td></td></tr
		>
	</tbody>
</table>
<p>
	Items are the <a href="/components/dropdown#props">Dropdown</a>’s: <code>onselect</code>,
	<code>href</code>, <code>disabled</code>, <code>variant</code>.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Tab</td><td>Into the bar (one stop for the whole bar), and out again</td></tr>
		<tr
			><td>Arrow Left / Right</td><td>The previous or next menu; if one is open, that one opens</td
			></tr
		>
		<tr><td>Arrow Down, Enter, Space</td><td>Open the menu on its first item</td></tr>
		<tr><td>Arrow Up</td><td>Open the menu on its last item</td></tr>
		<tr><td>Home / End</td><td>The first or last menu</td></tr>
		<tr><td>Escape</td><td>Close the menu, back to its name</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A menu bar of menu items, each owning its menu, as desktop screen readers expect.</li>
	<li>One Tab stop for the whole bar; the arrow keys do the rest, and remember where you were.</li>
	<li>Shortcuts shown in items are read by name (“Command+S”).</li>
</ul>
