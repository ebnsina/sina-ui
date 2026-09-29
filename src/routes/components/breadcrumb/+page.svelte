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
	<title>Breadcrumb — Sina UI</title>
	<meta
		name="description"
		content="Shows where the current page sits in the site, with links back up."
	/>
	<meta property="og:title" content="Breadcrumb — Sina UI" />
	<meta
		property="og:description"
		content="Shows where the current page sits in the site, with links back up."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Breadcrumb</h1>
<p class="lede">Shows where the current page sits, with links back up the way.</p>

<h2 id="installation">Installation</h2>
<Install names="breadcrumb">
	<p>
		Copy <code>src/lib/ui/Breadcrumb.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="The last item is the current page, so it isn't a link."
	{...ex('basic')}
/>
<Example
	id="collapsed"
	title="Long trails"
	description="Past three levels, the middle folds into a “…” menu of links; the first level and the last two stay in view."
	{...ex('collapsed')}
/>
<Example
	id="long"
	title="Long names"
	description="Each name stops at a readable width and ends in an ellipsis. Only names that are cut short show the full name in a tooltip, on hover or focus."
	{...ex('long')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr>
			<td><code>items</code></td><td><code>{'{'} label, href? {'}'}[]</code></td><td></td>
		</tr>
		<tr><td><code>max</code></td><td><code>number</code></td><td><code>3</code></td></tr>
		<tr
			><td><code>label</code></td><td><code>string</code></td><td><code>'Breadcrumb'</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A <code>&lt;nav&gt;</code> landmark named “Breadcrumb” around an ordered list, so screen readers say
		how many levels deep the page is.
	</li>
	<li>
		The “…” button says how many levels it hides, and opens a menu of real links (they open in a new
		tab too).
	</li>
	<li>Cut-short names are shortened on screen only: screen readers always get the full name.</li>
	<li>
		The current page carries <code>aria-current="page"</code>; the separators are hidden from screen
		readers.
	</li>
</ul>
