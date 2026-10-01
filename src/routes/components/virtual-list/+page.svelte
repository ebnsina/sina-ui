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
	<title>Virtual list — Sina UI</title>
	<meta name="description" content="Lists of thousands of rows that scroll as smoothly as ten." />
	<meta property="og:title" content="Virtual list — Sina UI" />
	<meta
		property="og:description"
		content="Lists of thousands of rows that scroll as smoothly as ten."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Virtual list</h1>
<p class="lede">
	For lists of thousands of rows: only the rows in view are drawn, so it scrolls as smoothly as a
	short one. Rows can be any height.
</p>

<h2 id="installation">Installation</h2>
<Install names="virtual-list">
	<p>
		Copy <code>src/lib/ui/VirtualList.svelte</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. Then install TanStack Virtual:
	</p>
	<Code code="pnpm add @tanstack/svelte-virtual" lang="shell" label="Install command" />
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="catalog"
	title="Ten thousand rows"
	description="Scroll as fast as you like: only about twenty rows exist in the page at any moment."
	{...ex('catalog')}
/>
<Example
	id="load-more"
	title="Loading more as you scroll"
	description="onend runs as the last rows come into view; add the next page to items and the list grows."
	{...ex('load-more')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>items</code></td><td><code>T[]</code></td><td>required</td></tr>
		<tr
			><td><code>key</code></td><td><code>(item) =&gt; string | number</code></td><td>required</td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>estimate</code></td><td><code>number</code>, a guess at a row's height in px</td
			><td><code>48</code></td></tr
		>
		<tr
			><td><code>gap</code></td><td><code>number</code>, px between rows</td><td><code>0</code></td
			></tr
		>
		<tr><td><code>height</code></td><td>CSS length</td><td><code>'24rem'</code></td></tr>
		<tr><td><code>onend</code></td><td><code>() =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>children</code></td><td>snippet: <code>(item, index)</code></td><td>required</td
			></tr
		>
		<tr><td><code>footer</code></td><td>snippet after the rows</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A list that can take focus and scroll with the keyboard.</li>
	<li>
		Each row is read with its place in the whole list (“row 5,021 of 10,000”), not just among those
		drawn.
	</li>
	<li>Browser find (⌘F) only sees the rows drawn; offer your own search for long lists.</li>
</ul>
