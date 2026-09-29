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
	<title>Spinner — Sina UI</title>
	<meta name="description" content="A small indicator that something is loading." />
	<meta property="og:title" content="Spinner — Sina UI" />
	<meta property="og:description" content="A small indicator that something is loading." />
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Spinner</h1>
<p class="lede">Shows that something is on its way when you cannot say how long it will take.</p>

<h2 id="installation">Installation</h2>
<Install names="spinner">
	<p>
		Copy <code>src/lib/ui/Spinner.svelte</code> and <code>tokens.css</code>. No dependencies. When
		you know how far along it is, use <a href="/components/progress">Progress</a> instead.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Sizes and colour"
	stack
	description="It takes the text colour around it. Beside its own words it needs no label."
	{...ex('basic')}
/>
<Example
	id="delay"
	title="Only when it takes a while"
	stack
	description="With a delay, a quick load never flashes a spinner; a slow one still shows it."
	{...ex('delay')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>size</code></td><td><code>number</code>: px</td><td><code>16</code></td></tr>
		<tr><td><code>label</code></td><td><code>string</code>: what is loading</td><td></td></tr>
		<tr
			><td><code>delay</code></td><td><code>number</code>: ms before it appears</td><td
				><code>0</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		With a <code>label</code> it is a progress indicator with no value, read as “Loading” (or your words).
	</li>
	<li>Without one it is hidden, for when text beside it already says what is happening.</li>
	<li>Mark the area that is loading with <code>aria-busy="true"</code>.</li>
	<li>
		With reduced motion it keeps turning, slowly: it is the only sign that something is happening.
	</li>
</ul>
