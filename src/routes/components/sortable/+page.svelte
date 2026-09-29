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
	<title>Sortable — Sina UI</title>
	<meta
		name="description"
		content="Reorder items by dragging, with touch and keyboard as first-class as the mouse."
	/>
	<meta property="og:title" content="Sortable — Sina UI" />
	<meta
		property="og:description"
		content="Reorder items by dragging, with touch and keyboard as first-class as the mouse."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Sortable</h1>
<p class="lede">
	Put things in order by dragging them: a list, a grid or a row. Works the same with a mouse, a
	finger, a pen or the keyboard.
</p>

<h2 id="installation">Installation</h2>
<Install names="sortable">
	<p>
		Copy <code>src/lib/ui/Sortable.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="reading-list"
	title="With a handle"
	description="Drag by the grip. The others make room as you go, and it settles where you let go."
	{...ex('reading-list')}
/>
<Example
	id="folios"
	title="A grid, dragged by the whole tile"
	description="On a phone, press and hold a tile to pick it up; a quick swipe still scrolls the page."
	{...ex('folios')}
/>
<Example
	id="chapters"
	title="A row"
	description="Chips in one line, reordered left and right."
	{...ex('chapters')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>items</code></td><td><code>T[]</code> (bindable)</td><td>required</td></tr>
		<tr
			><td><code>key</code></td><td><code>(item) =&gt; string | number</code></td><td>required</td
			></tr
		>
		<tr
			><td><code>itemLabel</code></td><td
				><code>(item) =&gt; string</code>, read aloud as it moves</td
			><td>required</td></tr
		>
		<tr><td><code>label</code></td><td><code>string</code>, names the list</td><td>required</td></tr
		>
		<tr
			><td><code>layout</code></td><td><code>'list' | 'row' | 'grid'</code></td><td
				><code>'list'</code></td
			></tr
		>
		<tr
			><td><code>onreorder</code></td><td><code>(items) =&gt; void</code>, after a drop</td><td
			></td></tr
		>
		<tr
			><td><code>children</code></td><td
				>snippet: <code>(item, handle, {'{ dragging, index }'})</code></td
			><td>required</td></tr
		>
	</tbody>
</table>
<p>
	Spread <code>handle</code> onto the button people grab. Add <code>data-sortable-item</code> to it
	when it's the whole item, so a touch waits for a press-and-hold. Set grid columns with
	<code>--sortable-columns</code> and the gap with <code>--sortable-gap</code>.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Space</kbd> or <kbd>Enter</kbd></td><td>Pick up, then drop</td></tr>
		<tr><td>Arrow keys</td><td>Move one place (up and down by a row in a grid)</td></tr>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>Move to the start or end</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Put it back where it was</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Each handle says what it moves and how; picking up, every move and the drop are announced with
		the position.
	</li>
	<li>Focus stays on the item you're moving.</li>
	<li>Near an edge while dragging, the list or page scrolls.</li>
	<li>With reduced motion, items move without sliding.</li>
</ul>
