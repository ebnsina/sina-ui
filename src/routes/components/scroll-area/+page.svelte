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
	<title>Scroll area — Sina UI</title>
	<meta
		name="description"
		content="A scrolling box that shows when there's more, with a button to move on."
	/>
	<meta property="og:title" content="Scroll area — Sina UI" />
	<meta
		property="og:description"
		content="A scrolling box that shows when there's more, with a button to move on."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Scroll area</h1>
<p class="lede">
	A box that scrolls, and says so: its edges fade where there's more, and a button offers the rest.
</p>

<h2 id="installation">Installation</h2>
<Install names="scroll-area">
	<p>
		Copy <code>src/lib/ui/ScrollArea.svelte</code>, <code>scroll-edges.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>. No other dependencies.
	</p>
	<p>
		For the fading edges alone on your own scrolling element, add
		<code>{'{'}@attach scrollEdges{'}'}</code> and <code>data-fade</code> (or
		<code>data-fade="x"</code> sideways).
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="rules"
	title="Long text"
	stack
	description="The arrow appears while there's more below and moves most of a screen at a time; it leaves once you reach the end."
	{...ex('rules')}
/>
<Example
	id="dialog"
	title="In a dialog"
	description="Anything someone should read before agreeing: the buttons stay in view while the text scrolls."
	{...ex('dialog')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>maxHeight</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>children</code></td><td><code>Snippet</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The box is a named region that takes focus, so it scrolls with the arrow keys, Page Down and
		Space.
	</li>
	<li>The arrow button is for pointers and touch; keyboard users already scroll the region.</li>
	<li>
		With reduced motion, the button fades without rising and scrolling jumps instead of gliding.
	</li>
</ul>
