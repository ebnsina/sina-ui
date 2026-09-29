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
	<title>Toolbar — Sina UI</title>
	<meta name="description" content="A row of related controls that is one stop for the Tab key." />
	<meta property="og:title" content="Toolbar — Sina UI" />
	<meta
		property="og:description"
		content="A row of related controls that is one stop for the Tab key."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Toolbar</h1>
<p class="lede">
	Groups related controls, such as formatting buttons, into one bar. Tab reaches it once; the arrow
	keys move along it.
</p>

<h2 id="installation">Installation</h2>
<Install names="toolbar">
	<p>Copy <code>src/lib/ui/Toolbar.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="formatting"
	title="Formatting"
	description="Toggles show when they're on. Tab into the bar, then use the arrow keys; the menu at the end opens with Down."
	{...ex('formatting')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>orientation</code></td><td><code>'horizontal' | 'vertical'</code></td><td
				><code>'horizontal'</code></td
			></tr
		>
	</tbody>
</table>
<p>
	Put any buttons inside. Divide groups with <code>&lt;span role="separator"&gt;&lt;/span&gt;</code
	>; give toggles <code>aria-pressed</code>.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>One tab stop for the whole bar; it remembers where you were.</li>
	<li>
		Arrow keys move along it (Up and Down when vertical), wrapping; Home and End jump to the ends.
		Right to left, the arrows follow the reading direction.
	</li>
	<li>Disabled controls are skipped.</li>
</ul>
