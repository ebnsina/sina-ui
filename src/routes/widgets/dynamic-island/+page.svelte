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
	<title>Dynamic island — Sina UI</title>
	<meta name="description" content="A live activity that grows out of a black pill and back." />
	<meta property="og:title" content="Dynamic island — Sina UI" />
	<meta
		property="og:description"
		content="A live activity that grows out of a black pill and back."
	/>
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Dynamic island</h1>
<p class="lede">
	Something happening right now, kept in a black pill at the top: glanceable when small, full
	controls when opened.
</p>

<h2 id="installation">Installation</h2>
<Install names="dynamic-island">
	<p>
		Copy <code>src/lib/ui/DynamicIsland.svelte</code>, <code>spring.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="activities"
	title="Live activities"
	description="Switch between them: the island springs to each one's size, and the new content comes in out of a blur."
	{...ex('activities')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>view</code></td><td><code>string</code>: which activity is showing</td><td
			></td></tr
		>
		<tr
			><td><code>children</code></td><td><code>Snippet&lt;[view]&gt;</code>: draws each activity</td
			><td></td></tr
		>
	</tbody>
</table>
<p>Each activity sets its own size by its content; the island springs to fit it.</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The compact pill is a button named for the activity (“Timer, 4:12 left”) that says whether it's
		open.
	</li>
	<li>Opened, it's a named region; Escape closes it and returns focus to the pill.</li>
	<li>With reduced motion, it changes size at once and the contents simply fade.</li>
</ul>
