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
	<title>Audio player — Sina UI</title>
	<meta
		name="description"
		content="An audio player with a seekable timeline, 15-second skips, speed, volume and lock-screen controls."
	/>
	<meta property="og:title" content="Audio player — Sina UI" />
	<meta
		property="og:description"
		content="An audio player with a seekable timeline, 15-second skips, speed, volume and lock-screen controls."
	/>
</svelte:head>

<p class="eyebrow">Media</p>
<h1>Audio player</h1>
<p class="lede">
	Plays a recording with a timeline you can drag or step through, skips of 15 seconds, speed and
	volume. Its title and controls also appear on the lock screen and respond to headphone buttons.
</p>

<h2 id="installation">Installation</h2>
<Install names="audio-player">
	<p>
		Copy <code>src/lib/ui/AudioPlayer.svelte</code>, with <code>Visualizer</code>,
		<code>Button</code>, <code>Icon</code>, <code>Spinner</code>, <code>motion.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="Taxim Hicaz, played by Ahmed Djewdet around 1928. Public domain, via Wikimedia Commons."
	{...ex('basic')}
/>
<Example
	id="with-visualizer"
	title="With a visualizer"
	description="Bars that move with the music. The file's host must allow cross-origin requests; Wikimedia Commons does."
	{...ex('with-visualizer')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>src</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>artist</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>artwork</code></td><td><code>string</code>: image URL</td><td></td></tr>
		<tr
			><td><code>visualizer</code></td><td><code>boolean | 'bars' | 'wave'</code></td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>element</code></td><td><code>HTMLAudioElement</code>, bindable</td><td></td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<p>On the timeline:</p>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>→</kbd> / <kbd>↑</kbd></td><td>Forward 5 seconds</td></tr>
		<tr><td><kbd>←</kbd> / <kbd>↓</kbd></td><td>Back 5 seconds</td></tr>
		<tr><td><kbd>PageUp</kbd> / <kbd>PageDown</kbd></td><td>Forward / back 30 seconds</td></tr>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>Start / end</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The timeline is a native slider; screen readers hear “1 minute, 23 seconds of 3 minutes, 5
		seconds”.
	</li>
	<li>Every button is named: play or pause, back and forward 15 seconds, speed, mute.</li>
	<li>Right-to-left: the timeline fills from the right and the arrow keys follow it.</li>
	<li>If the file can’t load, a plain message and a Try again button replace the timeline.</li>
	<li>With reduced motion, play and pause swap with a fade only.</li>
</ul>
