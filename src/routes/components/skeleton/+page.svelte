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
	<title>Skeleton — Sina UI</title>
	<meta name="description" content="Loading placeholders that stay quiet for screen readers." />
	<meta property="og:title" content="Skeleton — Sina UI" />
	<meta
		property="og:description"
		content="Loading placeholders that stay quiet for screen readers."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Skeleton</h1>
<p class="lede">Holds the shape of content while it loads, so nothing jumps when it arrives.</p>

<h2 id="installation">Installation</h2>
<Install names="skeleton">
	<p>Copy <code>src/lib/ui/Skeleton.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="card" title="Loading a card" stack {...ex('card')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>width</code></td><td><code>string</code></td><td><code>100%</code></td></tr>
		<tr><td><code>height</code></td><td><code>string</code></td><td><code>1rem</code></td></tr>
		<tr><td><code>circle</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Hidden from screen readers. Put <code>aria-busy="true"</code> on the region that is loading instead.
	</li>
	<li>Size it like the real content so the swap causes no layout shift.</li>
	<li>The sheen stops with reduced motion.</li>
</ul>
