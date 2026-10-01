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
	<title>Radio cards — Sina UI</title>
	<meta
		name="description"
		content="A choice shown as cards, each with a description and a price or time, one selection that glides between them."
	/>
	<meta property="og:title" content="Radio cards — Sina UI" />
	<meta
		property="og:description"
		content="A choice shown as cards, each with a description and a price or time, one selection that glides between them."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Radio cards</h1>
<p class="lede">
	A single choice where each option needs a few words to decide: plans, delivery, sizes. The
	selection glides from card to card.
</p>

<h2 id="installation">Installation</h2>
<Install names="radio-cards">
	<p>
		Copy <code>src/lib/ui/RadioCards.svelte</code>, with <code>Icon.svelte</code>,
		<code>glide.ts</code>, <code>motion.ts</code>, <code>spring.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="plans"
	title="Side by side"
	description="Cards wrap to fit. One can't be chosen right now, and says why."
	{...ex('plans')}
/>
<Example
	id="list"
	title="One per row, with icons"
	description="layout=&quot;list&quot; puts the detail at the end of each row."
	{...ex('list')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>legend</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>options</code></td><td
				><code>{'{ value, label, description?, detail?, icon?, disabled?, reason? }[]'}</code></td
			><td></td></tr
		>
		<tr><td><code>value</code></td><td><code>string</code> (bindable)</td><td></td></tr>
		<tr
			><td><code>layout</code></td><td><code>'grid' | 'list'</code></td><td><code>'grid'</code></td
			></tr
		>
		<tr><td><code>name</code></td><td><code>string</code></td><td>a unique id</td></tr>
		<tr
			><td><code>required</code>, <code>disabled</code></td><td><code>boolean</code></td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves into the group, onto the chosen card</td></tr>
		<tr
			><td><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td
				>Chooses the previous or next card</td
			></tr
		>
		<tr><td><kbd>Space</kbd></td><td>Chooses the focused card</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Real radios in a fieldset: the legend is read with each card, and forms send the value.</li>
	<li>Each card's description (or the reason it's unavailable) is read after its name.</li>
	<li>The chosen card shows a filled mark as well as its color.</li>
	<li>With reduced motion, the selection moves without gliding.</li>
</ul>
