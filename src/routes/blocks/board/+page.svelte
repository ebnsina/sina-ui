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
	<title>Board — Sina UI</title>
	<meta
		name="description"
		content="A task board: drag cards between lists, reorder lists, add and edit cards."
	/>
	<meta property="og:title" content="Board — Sina UI" />
	<meta
		property="og:description"
		content="A task board: drag cards between lists, reorder lists, add and edit cards."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Board</h1>
<p class="lede">
	Cards in lists, moved by dragging: across lists, up and down, with lists that reorder too. For
	tasks, pipelines and anything that moves through stages.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="translation"
	title="A translation workshop"
	description="Drag a card to another list, or a list by its grip. On a phone, press and hold a card first. Add cards at the bottom of a list; open one to rename it, label it or delete it. The board is kept in this browser."
	{...ex('translation')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/board">
	<p>
		Copy <code>src/lib/blocks/board/</code>, with <code>Sortable</code>, <code>Button</code>,
		<code>Dialog</code>, <code>Icon</code>, <code>Input</code>, <code>scroll-edges.ts</code>,
		<code>announce.ts</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>columns</code></td><td
				><code>{'{ id, title, cards: { id, title, labels? }[] }[]'}</code> (bindable)</td
			><td>required</td></tr
		>
		<tr
			><td><code>labels</code></td><td><code>{'{ id, name, color }[]'}</code></td><td
				><code>[]</code></td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Board'</code></td></tr>
		<tr
			><td><code>onmove</code></td><td
				><code>(card, {'{ column, index }'}) =&gt; Promise&lt;void&gt; | void</code>: save a drop</td
			><td></td></tr
		>
	</tbody>
</table>
<p>
	A dropped card moves at once. If <code>onmove</code> rejects, it goes back to where it was picked
	up and a short message says so (mount <code>&lt;Toaster /&gt;</code> once in your layout to show it).
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Space</kbd></td><td>Pick up a card, then drop it</td></tr>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Move it within its list</td></tr>
		<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Move it to the next list</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Put it back</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Open the card</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Every pick-up, move and drop is announced with the list and position.</li>
	<li>Lists are named with their card count; each card is a button.</li>
	<li>Dragging near the board's sides or a list's ends scrolls it.</li>
	<li>With reduced motion, cards move without sliding or tilting.</li>
</ul>
