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
	<title>Empty state — Sina UI</title>
	<meta
		name="description"
		content="What to show when there is nothing to show, and the way forward."
	/>
	<meta property="og:title" content="Empty state — Sina UI" />
	<meta
		property="og:description"
		content="What to show when there is nothing to show, and the way forward."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Empty state</h1>
<p class="lede">
	Fills the space where content would be: says why it is empty and offers the next step.
</p>

<h2 id="installation">Installation</h2>
<Install names="empty-state">
	<p>
		Copy <code>src/lib/ui/EmptyState.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="no-results"
	title="No results"
	stack
	description="Shown when a search finds nothing. Clearing puts you back in the search box."
	{...ex('no-results')}
/>
<Example
	id="first-use"
	title="Nothing here yet"
	stack
	description="Before there's anything to show, point to where it comes from."
	{...ex('first-use')}
/>
<Example
	id="error"
	title="Couldn't load"
	stack
	description="Say what went wrong in plain words, and offer to try again."
	{...ex('failed')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>icon</code></td><td>Hugeicons icon</td><td></td></tr>
		<tr
			><td><code>level</code></td><td><code>2</code>–<code>6</code>: heading level</td><td
				><code>2</code></td
			></tr
		>
		<tr><td><code>children</code></td><td><code>Snippet</code>: the explanation</td><td></td></tr>
		<tr><td><code>actions</code></td><td><code>Snippet</code>: buttons or links</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The title is a real heading, so it can be found by jumping between headings. Set <code
			>level</code
		> to fit the page.
	</li>
	<li>The icon is decoration and hidden from screen readers; the title says it all.</li>
	<li>
		When it replaces results, move focus somewhere useful: in the first example, clearing returns to
		the search box.
	</li>
	<li>Fades in with reduced motion, without the rise.</li>
</ul>
