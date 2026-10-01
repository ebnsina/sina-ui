<script lang="ts">
	import { resolve } from '$app/paths';
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
	<title>Toggle group — Sina UI</title>
	<meta
		name="description"
		content="A row of on/off buttons where any number can be on, like text styles."
	/>
	<meta property="og:title" content="Toggle group — Sina UI" />
	<meta
		property="og:description"
		content="A row of on/off buttons where any number can be on, like text styles."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Toggle group</h1>
<p class="lede">Turns several options on and off, like bold, italic and underline.</p>

<h2 id="installation">Installation</h2>
<Install names="toggle-group">
	<p>
		Copy <code>src/lib/ui/ToggleGroup.svelte</code>, <code>Tooltip.svelte</code>,
		<code>floating.ts</code>, <code>Icon.svelte</code> and <code>tokens.css</code>. No other
		dependencies.
	</p>
	<p>
		To choose exactly one option, use a <a href={resolve('/components/segmented')}
			>Segmented control</a
		>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="icons"
	title="Icons"
	description="Icon buttons are named by their tooltip, shown on hover or keyboard focus."
	{...ex('icons')}
/>
<Example
	id="labels"
	title="Text labels"
	description="A disabled button is skipped by the arrow keys."
	{...ex('labels')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr>
			<td><code>items</code></td>
			<td><code>{'{'} value, label, icon?, disabled? }[]</code></td>
			<td></td>
		</tr>
		<tr
			><td><code>value</code></td><td><code>string[]</code>, bindable</td><td><code>[]</code></td
			></tr
		>
		<tr><td><code>size</code></td><td><code>'sm' | 'md'</code></td><td><code>'md'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A toolbar with one Tab stop; each button says whether it's on (<code>aria-pressed</code>).
	</li>
	<li>Buttons are 44px on touch screens.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves into the group, to the last button used.</td></tr>
		<tr
			><td><kbd>←</kbd> <kbd>→</kbd></td><td
				>Previous / next button (mirrored right to left), wrapping round.</td
			></tr
		>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>First / last button.</td></tr>
		<tr><td><kbd>Space</kbd> <kbd>Enter</kbd></td><td>Turn the button on or off.</td></tr>
	</tbody>
</table>
