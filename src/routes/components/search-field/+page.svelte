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
	<title>Search field — Sina UI</title>
	<meta name="description" content="A search box with a clear button and Escape to clear." />
	<meta property="og:title" content="Search field — Sina UI" />
	<meta property="og:description" content="A search box with a clear button and Escape to clear." />
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Search field</h1>
<p class="lede">A box for searching, with a quick way to start again.</p>

<h2 id="installation">Installation</h2>
<Install names="search-field">
	<p>
		Copy <code>src/lib/ui/SearchField.svelte</code>, <code>Input.svelte</code>,
		<code>InputButton.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>. No other
		dependencies.
	</p>
	<p>
		For choosing from a list of options while typing, use a <a
			href={resolve('/components/combobox')}>Combobox</a
		>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Filtering a list"
	stack
	description="The clear button appears once there's text. Escape clears too."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr
			><td><code>onsearch</code></td><td><code>(query) =&gt; void</code>: on Enter</td><td></td></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A search box: screen readers announce it as one, and phones show a Search key.</li>
	<li>
		The clear button is named and only reachable once there's something to clear; clearing returns
		focus to the box.
	</li>
	<li>Escape clears; with nothing to clear, it's left for a surrounding dialog to close.</li>
</ul>
