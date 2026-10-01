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
	<title>Separator — Sina UI</title>
	<meta name="description" content="A line between groups of content, with optional words." />
	<meta property="og:title" content="Separator — Sina UI" />
	<meta
		property="og:description"
		content="A line between groups of content, with optional words."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Separator</h1>
<p class="lede">
	Divides content into groups, across or down, with a word in the middle when it helps.
</p>

<h2 id="installation">Installation</h2>
<Install names="separator">
	<p>Copy <code>src/lib/ui/Separator.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="horizontal"
	title="Across"
	description="Between sections of a card or page."
	{...ex('horizontal')}
/>
<Example
	id="vertical"
	title="Down"
	description="Between links or actions in a row."
	{...ex('vertical')}
/>
<Example
	id="labeled"
	title="With words"
	stack
	description="For a choice between two ways of doing the same thing."
	{...ex('labeled')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>orientation</code></td><td><code>'horizontal' | 'vertical'</code></td><td
				><code>'horizontal'</code></td
			></tr
		>
		<tr
			><td><code>children</code></td><td><code>Snippet</code>: words in the middle</td><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Read as a separator, with its direction, so screen reader users hear where one group ends.
	</li>
	<li>With words, the line is drawn around them and the words are read as ordinary text.</li>
</ul>
