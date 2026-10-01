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
	<title>Progress — Sina UI</title>
	<meta
		name="description"
		content="Progress bars that announce their value; an indeterminate sweep when the amount is unknown."
	/>
	<meta property="og:title" content="Progress — Sina UI" />
	<meta
		property="og:description"
		content="Progress bars that announce their value; an indeterminate sweep when the amount is unknown."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Progress</h1>
<p class="lede">Shows how far along a task is.</p>

<h2 id="installation">Installation</h2>
<Install names="progress">
	<p>Copy <code>src/lib/ui/Progress.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="basic" title="Basic" stack {...ex('basic')} />
<Example
	id="format"
	title="Custom value text"
	stack
	description="format sets what is shown and what screen readers hear."
	{...ex('format')}
/>
<Example id="indeterminate" title="Indeterminate" stack {...ex('indeterminate')} />
<Example
	id="circle"
	title="As a ring"
	description="shape=circle: the value sits in the middle and the label under it."
	{...ex('circle')}
/>
<Example
	id="circle-indeterminate"
	title="Ring, indeterminate"
	description="With no value, an arc turns."
	{...ex('circle-indeterminate')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>number</code>: unset = indeterminate</td><td></td></tr>
		<tr><td><code>max</code></td><td><code>number</code></td><td><code>100</code></td></tr>
		<tr
			><td><code>format</code></td><td><code>(value, max) =&gt; string</code></td><td>percent</td
			></tr
		>
		<tr><td><code>showValue</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
		<tr
			><td><code>shape</code></td><td><code>'bar' | 'circle'</code></td><td><code>'bar'</code></td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>number</code>, the ring's diameter in px</td><td
				><code>72</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		<code>role="progressbar"</code> labeled by its label, with <code>aria-valuenow</code> and a
		formatted <code>aria-valuetext</code>.
	</li>
	<li>Numbers go through <code>Intl.NumberFormat</code>.</li>
	<li>
		Fills with <code>transform</code> only; the indeterminate sweep becomes a gentle pulse with reduced
		motion.
	</li>
</ul>
