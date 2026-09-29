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
	<title>Table — Sina UI</title>
	<meta name="description" content="A plain, readable table for a short, fixed set of rows." />
	<meta property="og:title" content="Table — Sina UI" />
	<meta
		property="og:description"
		content="A plain, readable table for a short, fixed set of rows."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Table</h1>
<p class="lede">A plain table that reads well: for a short, fixed set of rows.</p>

<h2 id="installation">Installation</h2>
<Install names="table">
	<p>
		Copy <code>src/lib/ui/Table.svelte</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
	<p>
		You write the rows as ordinary HTML. To sort, search or page through many rows, use the
		<a href={resolve('/components/data-table')}>Data table</a>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="Each row starts with its own name, so screen readers say which scholar a cell belongs to. Numbers line up on the right."
	{...ex('basic')}
/>
<Example
	id="totals"
	title="With a total"
	description="A footer row for totals."
	{...ex('totals')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>caption</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>hideCaption</code></td><td><code>boolean</code></td><td><code>false</code></td></tr
		>
		<tr
			><td><code>children</code></td><td
				><code>&lt;thead&gt;</code>, <code>&lt;tbody&gt;</code>, <code>&lt;tfoot&gt;</code></td
			><td></td></tr
		>
	</tbody>
</table>
<p>Give number cells <code>class="num"</code> to right-align them with even-width digits.</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A real table: screen readers announce rows and columns and move by cell.</li>
	<li>
		The caption names it; use <code>scope="col"</code> for column headings and
		<code>scope="row"</code> for the cell that names each row.
	</li>
	<li>
		On narrow screens it scrolls sideways inside a focusable region, and the cut-off edge fades.
	</li>
</ul>
