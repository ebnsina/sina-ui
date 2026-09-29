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
	<title>Color picker — Sina UI</title>
	<meta
		name="description"
		content="Choose a colour by eye, by hex value, or from suggested swatches."
	/>
	<meta property="og:title" content="Color picker — Sina UI" />
	<meta
		property="og:description"
		content="Choose a colour by eye, by hex value, or from suggested swatches."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Color picker</h1>
<p class="lede">Choose a colour by eye, by typing its hex value, or from a set of suggestions.</p>

<h2 id="installation">Installation</h2>
<Install names="color-picker">
	<p>
		Copy <code>src/lib/ui/ColorPicker.svelte</code>, <code>color.ts</code>,
		<code>Popover.svelte</code>, <code>floating.ts</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="pigments"
	title="Labelling a collection"
	description="Choose a label colour and see it in place. Swatches are read by name; in Chrome and Edge, the pipette picks a colour from anywhere on screen."
	{...ex('pigments')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code>: hex, bindable</td><td
				><code>'#047857'</code></td
			></tr
		>
		<tr
			><td><code>swatches</code></td><td><code>(string | {'{'} color, name {'}'})[]</code></td><td
			></td></tr
		>
		<tr
			><td><code>name</code></td><td><code>string</code>: a hidden input with the hex</td><td
			></td></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td>Arrow keys (colour area)</td><td
				>Saturation left and right, brightness up and down; 10× with Shift</td
			></tr
		>
		<tr><td>Arrow keys (hue)</td><td>One degree; ten with Shift or Page Up / Down</td></tr>
		<tr><td>Home / End</td><td>The ends of the range</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Colours are read in words as well as values: “dark green, #047857”.</li>
	<li>The colour area is a single two-way slider: one Tab stop, both directions by arrow keys.</li>
	<li>Swatches are read by name when given one (“Lapis lazuli”), and the chosen one is marked.</li>
	<li>Everything the pointer can do, the keyboard can do; the hex field takes a value directly.</li>
</ul>
