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
	<title>Image compare — Sina UI</title>
	<meta
		name="description"
		content="Two images in one frame with a handle between them: drag, click or use the arrow keys to compare."
	/>
	<meta property="og:title" content="Image compare — Sina UI" />
	<meta
		property="og:description"
		content="Two images in one frame with a handle between them: drag, click or use the arrow keys to compare."
	/>
</svelte:head>

<p class="eyebrow">Media</p>
<h1>Image compare</h1>
<p class="lede">
	Two images in one frame with a handle between them. Drag it, press anywhere to jump there, or use
	the arrow keys. For before and after, edits, restorations and maps.
</p>

<h2 id="installation">Installation</h2>
<Install names="image-compare">
	<p>
		Copy <code>src/lib/ui/ImageCompare.svelte</code>, with <code>Icon.svelte</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Grayscale and color"
	description="Each side is a snippet, so it can be any image, picture or canvas."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>before</code>, <code>after</code></td><td><code>Snippet</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>beforeLabel</code>, <code>afterLabel</code></td><td><code>string</code></td><td
				><code>'Before'</code>, <code>'After'</code></td
			></tr
		>
		<tr
			><td><code>value</code></td><td><code>number</code>, 0–100 (bindable)</td><td
				><code>50</code></td
			></tr
		>
		<tr><td><code>ratio</code></td><td><code>string</code></td><td><code>'4 / 3'</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Move the handle by 1%</td></tr>
		<tr><td><kbd>Page Up</kbd> <kbd>Page Down</kbd></td><td>Move it by 10%</td></tr>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>All before, all after</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The handle is a slider named after both labels, announcing how much of "after" shows.</li>
	<li>Describe what the images show in text nearby, such as a caption.</li>
	<li>With reduced motion, the handle moves without gliding.</li>
</ul>
