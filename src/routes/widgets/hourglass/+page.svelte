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
	<title>Hourglass — Sina UI</title>
	<meta name="description" content="A sand timer: flip it to start, the sand runs down." />
	<meta property="og:title" content="Hourglass — Sina UI" />
	<meta property="og:description" content="A sand timer: flip it to start, the sand runs down." />
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Hourglass</h1>
<p class="lede">A sand timer: flip it and the sand runs down. A calmer way to show time passing.</p>

<h2 id="installation">Installation</h2>
<Install names="hourglass">
	<p>
		Copy <code>src/lib/ui/Widget.svelte</code>, <code>src/lib/ui/Hourglass.svelte</code>,
		<code>Button.svelte</code>, <code>Segmented.svelte</code>,
		<code>RollingNumber.svelte</code>, <code>chime.ts</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="A sand timer"
	description="Flip to start. Flip again part way and it turns over as a real one would: the sand that had fallen becomes the time left."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>seconds</code></td><td><code>number</code></td><td><code>60</code></td></tr>
		<tr
			><td><code>presets</code></td><td><code>number[]</code>: minutes</td><td
				><code>[1, 3, 5]</code></td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Hourglass'</code></td></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The glass is a picture named with the time left; the time is also written under it.</li>
	<li>Running out is announced and chimes; the time is never read aloud as it counts.</li>
	<li>With reduced motion, the glass turns over at once and the falling sand holds still.</li>
</ul>
