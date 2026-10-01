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
	<title>Meter — Sina UI</title>
	<meta name="description" content="Shows a measurement within a known range, like space used." />
	<meta property="og:title" content="Meter — Sina UI" />
	<meta
		property="og:description"
		content="Shows a measurement within a known range, like space used."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Meter</h1>
<p class="lede">A measurement within a known range: space used, ink left, how full a room is.</p>

<h2 id="installation">Installation</h2>
<Install names="meter">
	<p>
		Copy <code>src/lib/ui/Meter.svelte</code>, <code>RollingNumber.svelte</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
	<p>
		For work on its way to done (an upload, a download), use <a
			href={resolve('/components/progress')}>Progress</a
		>
		instead.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="basic" title="Basic" stack {...ex('basic')} />
<Example
	id="ranges"
	title="Good, fair and poor ranges"
	stack
	description="Set low, high and optimum as on HTML's own meter: past 60% the bar turns amber, past 85% red."
	{...ex('ranges')}
/>
<Example
	id="format"
	title="Your own units"
	stack
	description="Here more is better, so the bar turns red when it runs low."
	{...ex('format')}
/>
<Example
	id="usage"
	title="What it's made of"
	stack
	description="Give segments and the bar splits into parts, one shade each, with a legend. Add scans: every number rolls and the bar settles into place."
	{...ex('usage')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>number</code> (required)</td><td></td></tr>
		<tr
			><td><code>min</code>, <code>max</code></td><td><code>number</code></td><td
				><code>0</code>, <code>100</code></td
			></tr
		>
		<tr
			><td><code>low</code>, <code>high</code>, <code>optimum</code></td><td
				><code>number</code>: the ranges</td
			><td></td></tr
		>
		<tr
			><td><code>format</code></td><td><code>(value, min, max) =&gt; string</code></td><td
				>a percentage</td
			></tr
		>
		<tr
			><td><code>segments</code></td><td
				><code>{'{ label, value }[]'}</code>: the parts of the value</td
			><td></td></tr
		>
		<tr
			><td><code>formatSegment</code></td><td
				><code>(value) =&gt; string</code>: each part's amount</td
			><td>a number</td></tr
		>
		<tr><td><code>showValue</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A meter: screen readers read its label and the formatted value (“3.5 L of 20 L”).</li>
	<li>Color is never the only sign: the number is always there, and turns color with the bar.</li>
	<li>It fills from empty when it appears; with reduced motion it simply shows.</li>
</ul>
