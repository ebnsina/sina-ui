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
	<title>Tabs — Sina UI</title>
	<meta
		name="description"
		content="Tabs with a sliding indicator, automatic or manual activation, vertical layout and right-to-left support."
	/>
	<meta property="og:title" content="Tabs — Sina UI" />
	<meta
		property="og:description"
		content="Tabs with a sliding indicator, automatic or manual activation, vertical layout and right-to-left support."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Tabs</h1>
<p class="lede">Switches between related panels of content in the same place.</p>

<h2 id="installation">Installation</h2>
<Install names="tabs">
	<p>Copy the <code>src/lib/ui/tabs/</code> folder and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>

<Example
	id="basic"
	title="Basic"
	stack
	description="Click a tab and the indicator slides; use the arrow keys and it snaps. Disabled tabs are skipped."
	{...ex('basic')}
/>

<Example
	id="vertical"
	title="Vertical, manual activation"
	stack
	description="Arrows move focus without switching; Enter or Space opens the tab. Use manual activation when panels are slow to render."
	{...ex('vertical')}
/>

<h2 id="props">Props</h2>
<h3 id="props-root">Tabs.Root</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td>first enabled tab</td
			></tr
		>
		<tr
			><td><code>orientation</code></td><td><code>'horizontal' | 'vertical'</code></td><td
				><code>'horizontal'</code></td
			></tr
		>
		<tr
			><td><code>activation</code></td><td><code>'automatic' | 'manual'</code></td><td
				><code>'automatic'</code></td
			></tr
		>
	</tbody>
</table>
<h3 id="props-parts">Tabs.List, Tabs.Tab, Tabs.Panel</h3>
<table>
	<thead><tr><th>Part</th><th>Props</th></tr></thead>
	<tbody>
		<tr><td><code>Tabs.List</code></td><td><code>label</code>: names the tab set</td></tr>
		<tr
			><td><code>Tabs.Tab</code></td><td><code>value</code> (required), <code>disabled</code></td
			></tr
		>
		<tr><td><code>Tabs.Panel</code></td><td><code>value</code> (required), matching its tab</td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Follows the WAI-ARIA tabs pattern with a roving tab stop: <kbd>Tab</kbd> enters at the selected tab,
		arrows move within the list.
	</li>
	<li>Left and right arrows follow reading direction in right-to-left pages.</li>
	<li>
		Hidden panels stay in the page, so each tab's <code>aria-controls</code> always points at something
		that exists.
	</li>
	<li>
		The indicator only moves with transforms, and snaps for keyboard moves and reduced motion.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>→</kbd> / <kbd>←</kbd> (<kbd>↓</kbd> / <kbd>↑</kbd> vertical)</td><td
				>Next / previous tab, wrapping and skipping disabled tabs.</td
			></tr
		>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>First / last tab.</td></tr>
		<tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td
				>Selects the focused tab (manual activation).</td
			></tr
		>
	</tbody>
</table>
