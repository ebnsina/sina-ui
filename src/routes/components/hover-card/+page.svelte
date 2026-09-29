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
	<title>Hover card — Sina UI</title>
	<meta name="description" content="A preview card on hovering or focusing a link." />
	<meta property="og:title" content="Hover card — Sina UI" />
	<meta property="og:description" content="A preview card on hovering or focusing a link." />
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Hover card</h1>
<p class="lede">Previews what a link leads to, on hover or keyboard focus.</p>

<h2 id="installation">Installation</h2>
<Install names="hover-card">
	<p>
		Copy <code>src/lib/ui/HoverCard.svelte</code>, <code>floating.ts</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
	<p>
		Put the link in a <code>&lt;div&gt;</code> of text rather than a <code>&lt;p&gt;</code>: the
		card sits right after its link, and a paragraph can't contain it.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	description="Opens after a moment, so passing over the link doesn't flash it, and waits long enough to move onto the card. Tab moves into it; Escape closes it."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>trigger</code></td><td
				><code>Snippet</code>: your link, with the props spread on it</td
			><td></td></tr
		>
		<tr
			><td><code>side</code></td><td><code>'top' | 'bottom' | 'left' | 'right'</code></td><td
				><code>'bottom'</code></td
			></tr
		>
		<tr
			><td><code>openDelay</code></td><td><code>number</code> (ms)</td><td><code>500</code></td></tr
		>
		<tr
			><td><code>closeDelay</code></td><td><code>number</code> (ms)</td><td><code>250</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Extra detail only: touch has no hover, so everything in the card must be reachable another way
		(the link's own page).
	</li>
	<li>
		It opens on keyboard focus too, stays while the pointer or focus is on it, and Escape closes it
		(WCAG 1.4.13).
	</li>
	<li>It comes right after its link, so Tab moves into it and on through its links.</li>
</ul>
