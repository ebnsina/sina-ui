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
	<title>Mind map — Sina UI</title>
	<meta
		name="description"
		content="A mind map for Svelte: branches on both sides or one, pan and zoom, closing branches, and editing by keyboard or by dragging topics."
	/>
	<meta property="og:title" content="Mind map — Sina UI" />
	<meta
		property="og:description"
		content="A mind map for Svelte: branches on both sides or one, pan and zoom, closing branches, and editing by keyboard or by dragging topics."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Mind map</h1>
<p class="lede">
	One idea in the middle and everything that grows from it. Drag to look around, pinch or use the
	buttons to zoom, and close branches you don’t need right now.
</p>

<h2 id="installation">Installation</h2>
<Install names="mind-map">
	<p>
		Copy <code>src/lib/ui/MindMap.svelte</code> and <code>mindmap.ts</code>, with
		<code>Button.svelte</code>, <code>Icon.svelte</code>, <code>Tooltip.svelte</code>,
		<code>toast/</code>, <code>announce.ts</code>, <code>motion.ts</code> and
		<code>tokens.css</code>. No other dependencies. Put a <code>&lt;Toaster /&gt;</code> in your layout
		so removing a topic can be undone.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="wisdom"
	title="The House of Wisdom"
	description="Read only. Astronomy starts closed: its number says how much is inside. Tap it to open."
	{...ex('wisdom')}
/>
<Example
	id="plan"
	title="Plan the library’s new reading room"
	description="Editable. Pick a topic and press Tab to add inside it, Enter to add beside it, F2 or double-click to rename, Delete to remove (with undo). Drag a topic onto another to move it there."
	{...ex('plan')}
/>
<Example
	id="outline"
	title="A book’s outline"
	description="All branches to the right, reading like a table of contents."
	{...ex('outline')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>root</code></td><td
				><code>MindNode</code>, bindable:
				<code>&#123; id, label, children?, collapsed?, color?, icon?, note? &#125;</code></td
			><td></td></tr
		>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>editable</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>sides</code></td><td><code>'both' | 'right'</code></td><td><code>'both'</code></td
			></tr
		>
		<tr><td><code>onchange</code></td><td><code>(root) =&gt; void</code></td><td></td></tr>
	</tbody>
</table>
<p>
	A first-level topic’s <code>color</code> colors its whole branch. The map fills its container:
	give the container a height. <code>mindmap.ts</code> also exports
	<code>toOutline(root)</code> (indented text) and <code>toJSON(root)</code>.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></td><td
				>The nearest topic in that direction.</td
			></tr
		>
		<tr><td><kbd>Home</kbd></td><td>The center.</td></tr>
		<tr><td><kbd>Space</kbd></td><td>Open or close a branch.</td></tr>
		<tr
			><td><kbd>Enter</kbd></td><td
				>Editable: add a topic beside this one. Otherwise: open or close.</td
			></tr
		>
		<tr
			><td><kbd>Tab</kbd></td><td
				>Editable: add a topic inside this one. <kbd>Shift</kbd> <kbd>Tab</kbd> leaves the map.</td
			></tr
		>
		<tr
			><td><kbd>F2</kbd></td><td>Rename. <kbd>Enter</kbd> keeps it, <kbd>Esc</kbd> cancels.</td></tr
		>
		<tr
			><td><kbd>Delete</kbd> <kbd>Backspace</kbd></td><td>Remove the topic and what’s inside it.</td
			></tr
		>
		<tr><td><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + scroll</td><td>Zoom.</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A tree with one Tab stop. Each topic is read with its level and place, branches say whether
		they’re open, and the chosen topic is marked selected.
	</li>
	<li>The keys are described to screen readers; closing, moving and removing are announced.</li>
	<li>The map follows the keyboard: moving to a topic off screen brings it into view.</li>
	<li>Topics are real text, so they can be found, read and translated.</li>
	<li>With reduced motion, topics appear and move without gliding.</li>
</ul>
