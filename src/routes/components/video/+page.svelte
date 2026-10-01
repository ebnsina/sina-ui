<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>Video — Sina UI</title>
	<meta
		name="description"
		content="A video player with keyboard shortcuts, captions, speed, picture in picture and full screen; plus a streaming variant for HLS and DASH."
	/>
	<meta property="og:title" content="Video — Sina UI" />
	<meta
		property="og:description"
		content="A video player with keyboard shortcuts, captions, speed, picture in picture and full screen; plus a streaming variant for HLS and DASH."
	/>
</svelte:head>

<p class="eyebrow">Media</p>
<h1>Video</h1>
<p class="lede">
	Plays a video with controls that match the rest of your app. Two variants: <code>Video</code> for
	a file, and <code>ShakaVideo</code> for adaptive streams (HLS and DASH).
</p>

<h2 id="installation">Installation</h2>
<Install names="video shaka-video">
	<p>
		For a file, copy <code>src/lib/ui/Video.svelte</code> with the <code>dropdown</code> folder,
		<code>Icon.svelte</code>, <code>Spinner.svelte</code> and <code>tokens.css</code>. No
		dependencies.
	</p>
	<p>For streams, also copy <code>ShakaVideo.svelte</code> and install Shaka Player:</p>
	<Code code="pnpm add shaka-player" lang="shell" label="Install command" />
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="A file, with captions"
	description="Press the captions button or C to show them. Cross-origin captions need crossorigin on the video."
	{...ex('basic')}
/>
<Example
	id="stream"
	title="A stream"
	description="Picks the quality to suit the connection; choose one yourself from the quality menu."
	{...ex('stream')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>src</code></td><td><code>string</code> (Video)</td><td></td></tr>
		<tr
			><td><code>manifest</code></td><td
				><code>string</code>, a <code>.mpd</code> or <code>.m3u8</code> (ShakaVideo, required)</td
			><td></td></tr
		>
		<tr
			><td><code>title</code></td><td
				><code>string</code>: names the player and shows in the system media controls</td
			><td></td></tr
		>
		<tr><td><code>artist</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>artwork</code></td><td><code>string</code>: image for the lock screen</td><td
				><code>poster</code></td
			></tr
		>
		<tr><td><code>poster</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>aspectRatio</code></td><td><code>string</code></td><td><code>'16 / 9'</code></td
			></tr
		>
		<tr
			><td><code>element</code></td><td
				><code>HTMLVideoElement</code>, bindable: for libraries that attach to the video</td
			><td></td></tr
		>
		<tr
			><td><code>error</code></td><td><code>string</code>: a message to show over the player</td><td
			></td></tr
		>
		<tr
			><td><code>children</code></td><td
				><code>&lt;source&gt;</code> and <code>&lt;track&gt;</code> elements</td
			><td></td></tr
		>
		<tr
			><td><code>controls</code></td><td
				><code>Snippet</code>: your own buttons, placed before full screen</td
			><td></td></tr
		>
	</tbody>
</table>
<p>Any other attribute (<code>loop</code>, <code>crossorigin</code>, …) goes on the video.</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Space</kbd> / <kbd>K</kbd></td><td>Play or pause</td></tr>
		<tr><td><kbd>←</kbd> / <kbd>→</kbd></td><td>Back or forward 5 seconds</td></tr>
		<tr><td><kbd>J</kbd> / <kbd>L</kbd></td><td>Back or forward 10 seconds</td></tr>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>Start or end (on the seek bar)</td></tr>
		<tr><td><kbd>M</kbd></td><td>Mute</td></tr>
		<tr><td><kbd>C</kbd></td><td>Captions on or off</td></tr>
		<tr><td><kbd>F</kbd></td><td>Full screen</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Every control is a labeled button or slider; the seek bar reads “1:15 of 3:20”.</li>
	<li>Controls fade while it plays and come back on any mouse move, touch or key press.</li>
	<li>Headphone buttons, the lock screen and the system media panel control it too.</li>
	<li>Errors are announced in plain words over the player.</li>
	<li>With reduced motion, controls fade without sliding.</li>
</ul>
