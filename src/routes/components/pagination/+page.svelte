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
	<title>Pagination — Sina UI</title>
	<meta
		name="description"
		content="Moves between pages of results, with a marker that glides to the current page."
	/>
	<meta property="og:title" content="Pagination — Sina UI" />
	<meta
		property="og:description"
		content="Moves between pages of results, with a marker that glides to the current page."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Pagination</h1>
<p class="lede">Moves between pages of a long list.</p>

<h2 id="installation">Installation</h2>
<Install names="pagination">
	<p>
		Copy <code>src/lib/ui/Pagination.svelte</code>, <code>glide.ts</code>, <code>Icon.svelte</code>
		and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Buttons"
	stack
	description="The marker glides to the page you pick. The row always holds the same number of items, so the buttons never jump out from under the pointer."
	{...ex('basic')}
/>
<Example
	id="links"
	title="Links"
	description="With href, every page is a real link: it can be opened in a new tab, and it works before JavaScript loads."
	{...ex('links')}
/>
<Example
	id="few"
	title="A few pages"
	description="Every page shows when they fit."
	{...ex('few')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>page</code></td><td><code>number</code>, bindable</td><td><code>1</code></td></tr>
		<tr><td><code>count</code></td><td><code>number</code> (required)</td><td></td></tr>
		<tr><td><code>siblings</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr><td><code>href</code></td><td><code>(page) =&gt; string</code></td><td>buttons</td></tr>
		<tr
			><td><code>label</code></td><td><code>string</code></td><td><code>'Pagination'</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A <code>&lt;nav&gt;</code> landmark with a list inside; the current page carries
		<code>aria-current="page"</code>.
	</li>
	<li>
		Page numbers are read as “Page 5”, not a bare number; the gaps (…) are hidden from screen
		readers.
	</li>
	<li>Give each pagination its own <code>label</code> when a page has more than one.</li>
</ul>
