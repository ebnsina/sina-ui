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
	<title>Accordion — Sina UI</title>
	<meta
		name="description"
		content="Expandable sections on native details and summary, optionally one open at a time."
	/>
	<meta property="og:title" content="Accordion — Sina UI" />
	<meta
		property="og:description"
		content="Expandable sections on native details and summary, optionally one open at a time."
	/>
</svelte:head>

<p class="eyebrow">Disclosure</p>
<h1>Accordion</h1>
<p class="lede">Stacks sections so people can open only what they need.</p>

<h2 id="installation">Installation</h2>
<Install names="accordion">
	<p>
		Copy the <code>src/lib/ui/accordion/</code> folder, <code>Icon.svelte</code> and
		<code>tokens.css</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Any number of sections can be open."
	{...ex('basic')}
/>
<Example
	id="exclusive"
	title="One at a time"
	stack
	description="Opening a section closes the others, using the browser's own details grouping."
	{...ex('exclusive')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Part</th><th>Props</th></tr></thead>
	<tbody>
		<tr
			><td><code>Accordion.Root</code></td><td><code>exclusive</code>: one item open at a time</td
			></tr
		>
		<tr
			><td><code>Accordion.Item</code></td><td
				><code>title</code> (required), <code>open</code> (bindable)</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Built on <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code>: expanded state, keyboard
		and screen reader support come from the browser.
	</li>
	<li>
		In Chromium, find-in-page opens a closed section that contains the match; other browsers don't
		search closed sections yet.
	</li>
	<li>
		Opening animates height where supported (Chromium today) and is instant elsewhere and under
		reduced motion.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody
		><tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>Opens or closes the focused section.</td></tr
		></tbody
	>
</table>
