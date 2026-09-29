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
	<title>Slider — Sina UI</title>
	<meta name="description" content="A range input with a formatted, announced value." />
	<meta property="og:title" content="Slider — Sina UI" />
	<meta property="og:description" content="A range input with a formatted, announced value." />
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Slider</h1>
<p class="lede">Picks a number from a range by dragging or with the keyboard.</p>

<h2 id="installation">Installation</h2>
<Install names="slider">
	<p>Copy <code>src/lib/ui/Slider.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="basic" title="Basic" stack {...ex('basic')} />
<Example id="days" title="With units and a hint" stack {...ex('days')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>number</code>, bindable</td><td><code>50</code></td></tr
		>
		<tr><td><code>min</code></td><td><code>number</code></td><td><code>0</code></td></tr>
		<tr><td><code>max</code></td><td><code>number</code></td><td><code>100</code></td></tr>
		<tr><td><code>step</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr><td><code>format</code></td><td><code>(value) =&gt; string</code></td><td>number</td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A native <code>&lt;input type="range"&gt;</code>: keyboard, touch and forms for free.</li>
	<li>
		Screen readers hear the formatted value (<code>aria-valuetext</code>), e.g. “40 days”, not just
		“40”.
	</li>
	<li>The grab area is taller than the track, and 44px on touch screens.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>→</kbd> / <kbd>↑</kbd>, <kbd>←</kbd> / <kbd>↓</kbd></td><td>One step up / down.</td
			></tr
		>
		<tr><td><kbd>PageUp</kbd> / <kbd>PageDown</kbd></td><td>A larger jump.</td></tr>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>Minimum / maximum.</td></tr>
	</tbody>
</table>
