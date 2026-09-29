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
	<title>Carousel — Sina UI</title>
	<meta
		name="description"
		content="Slides that swipe, scroll and snap natively, with buttons, indicators and an optional pause-able autoplay."
	/>
	<meta property="og:title" content="Carousel — Sina UI" />
	<meta
		property="og:description"
		content="Slides that swipe, scroll and snap natively, with buttons, indicators and an optional pause-able autoplay."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Carousel</h1>
<p class="lede">Shows a set of slides one view at a time; swipe, scroll or use the buttons.</p>

<h2 id="installation">Installation</h2>
<Install names="carousel">
	<p>
		Copy <code>src/lib/ui/Carousel.svelte</code>, <code>glide.ts</code>, <code>Icon.svelte</code>
		and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Swipe or scroll with a trackpad and it snaps to each slide; the indicator glides with it."
	{...ex('basic')}
/>
<Example
	id="several"
	title="Several in view, playing"
	stack
	description="Moves on by itself every four seconds, and waits while it's hovered, focused or the tab is hidden. The pause button stops it."
	{...ex('several')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>slides</code></td><td><code>T[]</code></td><td></td></tr>
		<tr><td><code>slide</code></td><td><code>Snippet&lt;[T, index]&gt;</code></td><td></td></tr>
		<tr><td><code>perView</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr><td><code>autoplay</code></td><td><code>number</code> (ms)</td><td>off</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Announced as a carousel, and each slide as “slide, 3 of 5”; changing slide is announced (not
		while playing).
	</li>
	<li>Slides out of view can't be reached by Tab or screen readers until they're shown.</li>
	<li>
		Playing by itself always has a pause button, and waits while hovered, focused or hidden (WCAG
		2.2.2).
	</li>
	<li>The slides can be focused and scrolled with the arrow keys.</li>
</ul>
