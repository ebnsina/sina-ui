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
	<title>Card — Sina UI</title>
	<meta
		name="description"
		content="Surfaces for grouped content; linked cards are one clear link."
	/>
	<meta property="og:title" content="Card — Sina UI" />
	<meta
		property="og:description"
		content="Surfaces for grouped content; linked cards are one clear link."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Card</h1>
<p class="lede">Groups related content on a raised surface.</p>

<h2 id="installation">Installation</h2>
<Install names="card">
	<p>Copy <code>src/lib/ui/Card.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="basic" title="With actions" stack {...ex('basic')} />
<Example
	id="linked"
	title="As a link"
	stack
	description="The title’s link stretches over the whole card, so it is one link with one name, and buttons inside still work."
	{...ex('linked')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>title</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>description</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>level</code></td><td><code>2 | 3 | 4</code>: heading level</td><td
				><code>3</code></td
			></tr
		>
		<tr><td><code>href</code></td><td><code>string</code>: whole card links</td><td></td></tr>
		<tr><td><code>footer</code></td><td>Snippet</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		An <code>&lt;article&gt;</code> headed by its title at the level you choose, so it fits the page outline.
	</li>
	<li>
		Linked cards use a stretched link, not a link around the card: one short, clear name instead of
		the whole card read aloud.
	</li>
</ul>
