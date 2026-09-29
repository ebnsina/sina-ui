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
	<title>Folder — Sina UI</title>
	<meta
		name="description"
		content="A folder you can see into: frosted glass, papers inside, opening as you point."
	/>
	<meta property="og:title" content="Folder — Sina UI" />
	<meta
		property="og:description"
		content="A folder you can see into: frosted glass, papers inside, opening as you point."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Folder</h1>
<p class="lede">
	A folder that looks like one: a frosted front with papers behind it, tipping open as you point at
	it or move to it with the keyboard. For file browsers and anywhere things are grouped.
</p>

<h2 id="installation">Installation</h2>
<Install names="folder">
	<p>Copy <code>src/lib/ui/Folder.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="colours"
	title="Colours"
	description="Any colour; the back is a shade darker and the front lets the papers show through."
	{...ex('colours')}
/>
<Example id="sizes" title="Sizes" {...ex('sizes')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>name</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>count</code></td><td><code>number</code>, items inside</td><td></td></tr>
		<tr><td><code>color</code></td><td>any CSS colour</td><td>the accent</td></tr>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr
			><td><code>open</code></td><td
				><code>boolean</code>: held open, while something is dragged over it</td
			><td><code>false</code></td></tr
		>
		<tr><td><code>selected</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>
<p>It's a button: add <code>onclick</code>, <code>ondblclick</code> or any other attribute.</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A button named by the folder's name, with its item count read after.</li>
	<li>It opens on keyboard focus just as on hover.</li>
	<li>With reduced motion it opens without moving.</li>
</ul>
