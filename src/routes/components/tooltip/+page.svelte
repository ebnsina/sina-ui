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
	<title>Tooltip — Sina UI</title>
	<meta
		name="description"
		content="Tooltip that names or describes a control, shows on hover and keyboard focus, and can always be dismissed."
	/>
	<meta property="og:title" content="Tooltip — Sina UI" />
	<meta
		property="og:description"
		content="Tooltip that names or describes a control, shows on hover and keyboard focus, and can always be dismissed."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Tooltip</h1>
<p class="lede">A short hint about a control, shown on hover or keyboard focus.</p>

<h2 id="installation">Installation</h2>
<Install names="tooltip">
	<p>
		Copy <code>src/lib/ui/Tooltip.svelte</code>, <code>floating.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="icon"
	title="Naming icon buttons"
	description="Hover one, then slide along: once a tooltip has shown, the next opens instantly."
	{...ex('icon')}
/>
<Example
	id="description"
	title="Adding a description"
	description="On a control that already has a name, the tooltip is read after it as extra detail."
	{...ex('description')}
/>
<Example
	id="sides"
	title="All four sides"
	description="Each tooltip prefers the side you ask for and flips to the opposite one when there isn't room; the arrow always points at the trigger."
	{...ex('sides')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>text</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>labels</code></td><td><code>boolean</code>: tooltip is the trigger's name</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>side</code></td><td><code>'top' | 'right' | 'bottom' | 'left'</code></td><td
				><code>'top'</code></td
			></tr
		>
		<tr
			><td><code>trigger</code></td><td>Snippet receiving trigger props (required)</td><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Follows the WAI-ARIA tooltip pattern: <code>role="tooltip"</code>, linked with
		<code>aria-describedby</code>, or <code>aria-labelledby</code> when it's the name.
	</li>
	<li>
		Meets WCAG 1.4.13: it can be dismissed with <kbd>Escape</kbd> from anywhere, the pointer can move
		onto it, and it stays until you leave.
	</li>
	<li>
		Shows at once on keyboard focus; not on touch, where hover doesn't exist. Don't hide anything
		essential in a tooltip.
	</li>
	<li>Plain text only: nobody could reach a link or button inside it.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Focusing the trigger shows the tooltip.</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Hides it without moving focus.</td></tr>
	</tbody>
</table>
