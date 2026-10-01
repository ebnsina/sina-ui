<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>AI media — Sina UI</title>
	<meta
		name="description"
		content="Generate images, speech and video, and transcribe audio, with TanStack AI."
	/>
	<meta property="og:title" content="AI media — Sina UI" />
	<meta
		property="og:description"
		content="Generate images, speech and video, and transcribe audio, with TanStack AI."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>AI media</h1>
<p class="lede">
	Beyond chat: make images, read text aloud, turn speech into text, and make short videos. Each
	works with any provider TanStack AI supports.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="image"
	title="Images"
	description="Describe an image, pick a shape and generate two. The demo draws star patterns colored by your words; your app shows the model's images."
	{...ex('image')}
/>
<Example
	id="speech"
	title="Read aloud"
	description="Turns text into speech and plays it as soon as it's ready. In this demo a short melody stands in for the voice."
	{...ex('speech')}
/>
<Example
	id="transcribe"
	title="Transcribe"
	description="Record from the microphone, or upload a recording, and get the words back as text. The demo returns a fixed line."
	{...ex('transcribe')}
/>
<Example
	id="video"
	title="Video"
	description="Describe a scene and choose a length. The demo records a turning star pattern; your app shows the model's video."
	{...ex('video')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/media">
	<p>
		Copy the block you want from <code>src/lib/blocks/media/</code>, with the <code>Button</code>,
		<code>Icon</code>, <code>Segmented</code>, <code>Textarea</code>, <code>Slider</code>,
		<code>Progress</code> and <code>Spinner</code> components it uses. Then install TanStack AI:
	</p>
	<Code
		code="pnpm add @tanstack/ai@0.63.0 @tanstack/ai-svelte@0.24.3"
		lang="shell"
		label="Install command"
	/>
	<p>
		TanStack AI is still before version 1, so these versions are exact: a newer one may change its
		API.
	</p>
	<p>
		Each block takes a <code>connection</code> to your endpoint, such as
		<code>fetchServerSentEvents('/api/image')</code>, or a <code>fetcher</code> function that returns
		the result directly.
	</p>
</Install>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Block</th><th>Props</th></tr></thead>
	<tbody>
		<tr
			><td><code>ImageStudio</code></td><td
				><code>connection</code> or <code>fetcher</code>, <code>count</code> (2),
				<code>placeholder</code></td
			></tr
		>
		<tr
			><td><code>SpeechStudio</code></td><td
				><code>connection</code> or <code>fetcher</code>, <code>voices</code>, <code>text</code> (bindable)</td
			></tr
		>
		<tr
			><td><code>Transcriber</code></td><td><code>connection</code> or <code>fetcher</code></td></tr
		>
		<tr
			><td><code>VideoStudio</code></td><td
				><code>connection</code> or <code>fetcher</code>, <code>placeholder</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Results are announced when ready; the areas they appear in are busy while working.</li>
	<li>Every generation can be stopped part way.</li>
	<li>
		The record button says whether it's recording; a blocked microphone is explained, with upload
		offered instead.
	</li>
	<li>The player's position is a slider read as elapsed and total time.</li>
</ul>
