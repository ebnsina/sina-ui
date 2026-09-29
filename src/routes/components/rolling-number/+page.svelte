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
	<title>Rolling number — Sina UI</title>
	<meta name="description" content="Numbers whose digits roll to their new value." />
	<meta property="og:title" content="Rolling number — Sina UI" />
	<meta property="og:description" content="Numbers whose digits roll to their new value." />
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Rolling number</h1>
<p class="lede">
	A number whose digits roll to the new value when it changes, like a mechanical counter. For
	totals, prices and stats.
</p>

<h2 id="installation">Installation</h2>
<Install names="rolling-number">
	<p>
		Copy <code>src/lib/ui/RollingNumber.svelte</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="counter"
	title="A counter"
	description="Only the digits that change roll, each the shortest way round."
	{...ex('counter')}
/>
<Example
	id="formats"
	title="Prices and percentages"
	description="Give it Intl.NumberFormat options: currency, percent and units all roll."
	{...ex('formats')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>value</code></td><td><code>number | string</code></td><td>required</td></tr>
		<tr><td><code>format</code></td><td><code>Intl.NumberFormatOptions</code></td><td></td></tr>
		<tr><td><code>locales</code></td><td><code>Intl.LocalesArgument</code></td><td></td></tr>
	</tbody>
</table>
<p>
	Use it for values that change now and then. A value that changes several times a second (a
	stopwatch) is better as plain text.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Read as the whole number, not digit by digit.</li>
	<li>With reduced motion, the new value simply replaces the old.</li>
</ul>
