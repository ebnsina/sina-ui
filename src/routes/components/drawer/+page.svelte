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
	<title>Drawer — Sina UI</title>
	<meta name="description" content="A bottom sheet you can swipe down to close." />
	<meta property="og:title" content="Drawer — Sina UI" />
	<meta property="og:description" content="A bottom sheet you can swipe down to close." />
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Drawer</h1>
<p class="lede">
	A panel that slides up from the bottom, for details and quick actions, especially on phones.
</p>

<h2 id="installation">Installation</h2>
<Install names="drawer">
	<p>
		Copy <code>src/lib/ui/Drawer.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="Drag the handle down, or flick it, to close; let go early and it springs back."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>open</code></td><td><code>boolean</code>, bindable</td><td><code>false</code></td
			></tr
		>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>description</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>closeLabel</code></td><td><code>string</code></td><td><code>'Close'</code></td></tr
		>
		<tr><td><code>footer</code></td><td><code>Snippet</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A modal dialog: the page behind can't be reached, Escape closes, and focus goes back where it
		was.
	</li>
	<li>It opens on itself, so its title is read first.</li>
	<li>Dragging is a shortcut; the Close button and Escape do the same.</li>
</ul>
