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
	<title>Audio visualizer — Sina UI</title>
	<meta
		name="description"
		content="Draws sound as bars or a wave, from an audio or video element or a microphone."
	/>
	<meta property="og:title" content="Audio visualizer — Sina UI" />
	<meta
		property="og:description"
		content="Draws sound as bars or a wave, from an audio or video element or a microphone."
	/>
</svelte:head>

<p class="eyebrow">Media</p>
<h1>Audio visualizer</h1>
<p class="lede">
	Draws sound as it plays: bars for loudness from low notes to high, or the wave itself. Point it at
	an <code>&lt;audio&gt;</code> or <code>&lt;video&gt;</code> element, or a microphone.
</p>

<h2 id="installation">Installation</h2>
<Install names="visualizer">
	<p>
		Copy <code>src/lib/ui/Visualizer.svelte</code>, with <code>motion.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>
<p>
	For a file on another site, give the element <code>crossorigin="anonymous"</code>, and the host
	must allow cross-origin requests. Otherwise the visualizer only hears silence.
</p>

<h2 id="examples">Examples</h2>
<Example id="bars" title="Bars" description="Press play." {...ex('bars')} />
<Example id="wave" title="Wave" {...ex('wave')} />
<Example
	id="microphone"
	title="Microphone"
	description="Your browser asks first. Nothing is recorded or sent anywhere."
	{...ex('microphone')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>source</code></td><td><code>HTMLMediaElement | MediaStream | null</code></td><td
			></td></tr
		>
		<tr
			><td><code>variant</code></td><td><code>'bars' | 'wave'</code></td><td><code>'bars'</code></td
			></tr
		>
		<tr><td><code>bars</code></td><td><code>number</code></td><td><code>32</code></td></tr>
		<tr
			><td><code>mirror</code></td><td><code>boolean</code>: grow from the middle</td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<p>
	It takes the accent color, and its height from CSS (<code>4rem</code> by default): pass a
	<code>class</code> to change either.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Decorative by default and hidden from screen readers; give it a <code>label</code> to name it.
	</li>
	<li>It only draws while sound is playing and it’s on screen.</li>
	<li>With reduced motion, it updates a few times a second instead of every frame.</li>
</ul>
