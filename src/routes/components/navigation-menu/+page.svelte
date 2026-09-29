<script lang="ts">
	import { resolve } from '$app/paths';
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
	<title>Navigation menu — Sina UI</title>
	<meta name="description" content="A site header whose items open panels of links." />
	<meta property="og:title" content="Navigation menu — Sina UI" />
	<meta property="og:description" content="A site header whose items open panels of links." />
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Navigation menu</h1>
<p class="lede">
	A site header whose items open panels of links, for sites with more pages than fit in a row.
</p>

<h2 id="installation">Installation</h2>
<Install names="navigation-menu">
	<p>
		Copy <code>src/lib/ui/navigation-menu/</code>, <code>glide.ts</code>, <code>Icon.svelte</code>
		and
		<code>tokens.css</code>. No dependencies.
	</p>
	<p>
		For commands in an app (File, Edit, View), use a <a href={resolve('/components/menubar')}
			>Menubar</a
		> instead.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="site"
	title="A site header"
	description="Point at Collections, then slide across to Scholars: the card follows and resizes, and the links slide in from the side you came from."
	{...ex('site')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Part</th><th>Props</th></tr></thead>
	<tbody>
		<tr><td><code>Nav.Root</code></td><td><code>label</code> (required), <code>class</code></td></tr
		>
		<tr
			><td><code>Nav.Item</code></td><td><code>label</code> (required); its content is the panel</td
			></tr
		>
		<tr
			><td><code>Nav.Link</code></td><td><code>href</code> (required), <code>current</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A navigation landmark of links and buttons: each item's button shows or hides its panel, and Tab
		goes from the button into the panel's links.
	</li>
	<li>
		Escape closes the panel and returns to its button; tabbing away or clicking outside closes it
		too.
	</li>
	<li>
		Hover waits a moment before opening, so passing the pointer across never flashes a panel open.
	</li>
	<li>The current page's link is marked as current.</li>
</ul>
