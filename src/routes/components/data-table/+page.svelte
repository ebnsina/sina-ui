<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>Data table — Sina UI</title>
	<meta
		name="description"
		content="A data table with sorting, search and pages, built on TanStack Table."
	/>
	<meta property="og:title" content="Data table — Sina UI" />
	<meta
		property="og:description"
		content="A data table with sorting, search and pages, built on TanStack Table."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Data table</h1>
<p class="lede">Shows rows of data people can sort, search and page through.</p>

<h2 id="installation">Installation</h2>
<Install names="data-table">
	<p>
		Copy <code>src/lib/ui/DataTable.svelte</code>, <code>Button.svelte</code>,
		<code>Input.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>, then install
		TanStack Table:
	</p>
	<Code code="pnpm add @tanstack/svelte-table" lang="shell" label="Install command" />
	<p>
		For a short, fixed table with nothing to sort or search, use <a href="/components/table"
			>Table</a
		>
		instead: no dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Sortable"
	description="Click a column heading to sort by it (numbers largest first); click again to reverse, a third time to clear. Numbers line up on the right."
	{...ex('basic')}
/>
<Example
	id="search"
	title="Search and pages"
	description="The search looks through every column, ignoring case and accents. Page controls appear only when there's more than one page."
	{...ex('search')}
/>

<h2 id="columns">Columns</h2>
<p>
	Columns are TanStack <code>ColumnDef</code>s; the <code>Column&lt;Row&gt;</code> type fills in the
	table's features for you. Format numbers and dates in <code>cell</code> with <code>Intl</code>,
	and set <code>meta: {'{'} align: 'end' {'}'}</code> on numeric columns.
</p>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>caption</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>hideCaption</code></td><td><code>boolean</code></td><td><code>false</code></td></tr
		>
		<tr><td><code>data</code></td><td><code>Row[]</code></td><td></td></tr>
		<tr><td><code>columns</code></td><td><code>Column&lt;Row&gt;[]</code></td><td></td></tr>
		<tr><td><code>searchLabel</code></td><td><code>string</code></td><td>no search box</td></tr>
		<tr><td><code>pageSize</code></td><td><code>number</code></td><td><code>10</code></td></tr>
		<tr>
			<td><code>empty</code></td><td><code>string</code></td><td><code>'No matching rows'</code></td
			>
		</tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A real <code>&lt;table&gt;</code> with a caption and column headers, so screen readers can move by
		row and column and read each cell with its heading.
	</li>
	<li>
		Sortable headings are buttons, and the sorted column carries <code>aria-sort</code>. After
		sorting or searching, screen readers hear the result, for example “5 rows, sorted by Born,
		descending”.
	</li>
	<li>
		A table wider than the screen scrolls sideways, and can be focused to scroll with arrow keys.
	</li>
</ul>
