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
	<title>Resizable panels — Sina UI</title>
	<meta
		name="description"
		content="Panels side by side or stacked, resized by dragging or with the keyboard."
	/>
	<meta property="og:title" content="Resizable panels — Sina UI" />
	<meta
		property="og:description"
		content="Panels side by side or stacked, resized by dragging or with the keyboard."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Resizable panels</h1>
<p class="lede">
	Panels side by side or stacked, sized by dragging the line between them, or from the keyboard.
</p>

<h2 id="installation">Installation</h2>
<Install names="resizable">
	<p>Copy <code>src/lib/ui/resizable/</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="reading-room"
	title="Side by side"
	description="Drag a line, or focus it and use the arrow keys. The catalog collapses when dragged small, or with Enter; double-click a line to reset. The layout is remembered."
	{...ex('reading-room')}
/>
<Example id="stacked" title="Stacked" {...ex('stacked')} />

<h2 id="props">Props</h2>
<h3 id="props-group">Resizable.Group</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>orientation</code></td><td><code>'horizontal' | 'vertical'</code></td><td
				><code>'horizontal'</code></td
			></tr
		>
		<tr><td><code>persist</code></td><td><code>string</code>: a storage key</td><td></td></tr>
	</tbody>
</table>
<h3 id="props-panel">Resizable.Panel</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>defaultSize</code></td><td><code>number</code>: percent</td><td>an equal share</td
			></tr
		>
		<tr
			><td><code>minSize</code>, <code>maxSize</code></td><td><code>number</code>: percent</td><td
				><code>10</code>, <code>100</code></td
			></tr
		>
		<tr
			><td><code>collapsible</code></td><td><code>boolean</code></td><td><code>false</code></td></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<h3 id="props-handle">Resizable.Handle</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code> (required): what it resizes</td><td
			></td></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Arrow keys</td><td>Move the line by 5% (10% with Shift)</td></tr>
		<tr><td>Home / End</td><td>The panel before it at its smallest or largest</td></tr>
		<tr><td>Enter</td><td>Collapse a collapsible panel, or bring it back</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Each line is a focusable separator: screen readers hear its name and the size of the panel it
		controls.
	</li>
	<li>A collapsed panel is taken out of the page, so Tab never lands inside it.</li>
	<li>The grab area is wider than the line it draws, and wider still on touch screens.</li>
</ul>
