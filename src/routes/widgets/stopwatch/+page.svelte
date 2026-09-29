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
	<title>Stopwatch — Sina UI</title>
	<meta name="description" content="Time things to the hundredth of a second, with laps." />
	<meta property="og:title" content="Stopwatch — Sina UI" />
	<meta property="og:description" content="Time things to the hundredth of a second, with laps." />
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Stopwatch</h1>
<p class="lede">
	Times something to the hundredth of a second, with laps: fastest and slowest marked.
</p>

<h2 id="installation">Installation</h2>
<Install names="stopwatch">
	<p>
		Copy <code>src/lib/ui/Widget.svelte</code>, <code>src/lib/ui/Stopwatch.svelte</code>,
		<code>Button.svelte</code>,
		<code>announce.ts</code>
		and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Timing an experiment"
	description="Start, then Lap as you go. With three laps or more, the fastest and slowest are marked. It keeps exact time even in a background tab."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code>: names it for screen readers</td><td
				><code>'Stopwatch'</code></td
			></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The running time is never read aloud as it changes; stopping and each lap are announced.</li>
	<li>Start and Stop share one button, as do Lap and Reset, so nothing moves under a finger.</li>
	<li>Laps are a numbered list, newest first.</li>
</ul>
