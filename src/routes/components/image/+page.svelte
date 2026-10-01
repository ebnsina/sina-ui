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
	<title>Image — Sina UI</title>
	<meta
		name="description"
		content="An image that holds its space while it loads, arrives out of a soft blur, says so when it can't load, and can open larger."
	/>
	<meta property="og:title" content="Image — Sina UI" />
	<meta
		property="og:description"
		content="An image that holds its space while it loads, arrives out of a soft blur, says so when it can't load, and can open larger."
	/>
</svelte:head>

<p class="eyebrow">Media</p>
<h1>Image</h1>
<p class="lede">
	An image that holds its space while it loads, arrives out of a soft blur, says so when it can't
	load, and can open larger.
</p>

<h2 id="installation">Installation</h2>
<Install names="image">
	<p>
		Copy <code>src/lib/ui/Image.svelte</code>, with <code>Icon.svelte</code>,
		<code>motion.ts</code>, <code>spring.ts</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="With a placeholder and caption"
	description="Give width and height (or ratio) so the page doesn't shift when it arrives. The placeholder color shows until then."
	{...ex('basic')}
/>
<Example
	id="zoom"
	title="Open larger"
	description="Press the image: a larger file grows out of it. Escape, the close button or a press anywhere puts it back."
	{...ex('zoom')}
/>
<Example
	id="error"
	title="When it can't load"
	description="The space stays, with the description in place of the picture."
	{...ex('failed')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>src</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>alt</code></td><td
				><code>string</code> (required): what it shows; <code>""</code> for decoration</td
			><td></td></tr
		>
		<tr><td><code>width</code>, <code>height</code></td><td><code>number</code></td><td></td></tr>
		<tr
			><td><code>ratio</code></td><td><code>string</code>, e.g. <code>"4 / 3"</code></td><td
				>width / height</td
			></tr
		>
		<tr
			><td><code>fit</code></td><td><code>'cover' | 'contain'</code></td><td
				><code>'cover'</code></td
			></tr
		>
		<tr
			><td><code>placeholder</code></td><td>a color, or a tiny image as a data URL</td><td></td></tr
		>
		<tr><td><code>caption</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>zoom</code></td><td><code>boolean | string</code>: a larger file's address</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>loading</code></td><td><code>'lazy' | 'eager'</code></td><td
				><code>'lazy'</code></td
			></tr
		>
	</tbody>
</table>
<p>
	Other attributes (<code>srcset</code>, <code>sizes</code>) go to the <code>&lt;img&gt;</code>.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Open the larger view</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Close it</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>With <code>zoom</code>, the image is a button named "Enlarge" plus its description.</li>
	<li>The larger view is a modal: focus stays inside until it closes.</li>
	<li>An image that fails keeps its description, read out in its place.</li>
	<li>With reduced motion, images fade in without blur and the larger view opens in place.</li>
</ul>
