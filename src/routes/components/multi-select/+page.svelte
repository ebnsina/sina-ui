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
	<title>Multi select — Sina UI</title>
	<meta
		name="description"
		content="Choose several options from a searchable list; the choices sit in the field as chips you can remove."
	/>
	<meta property="og:title" content="Multi select — Sina UI" />
	<meta
		property="og:description"
		content="Choose several options from a searchable list; the choices sit in the field as chips you can remove."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Multi select</h1>
<p class="lede">
	Several choices from a fixed list, kept readable in the field as chips. The list searches as you
	type and stays open while you tick.
</p>

<h2 id="installation">Installation</h2>
<Install names="multi-select">
	<p>
		Copy <code>src/lib/ui/MultiSelect.svelte</code>, with <code>Icon.svelte</code>,
		<code>announce.ts</code>, <code>floating.ts</code>, <code>glide.ts</code>,
		<code>motion.ts</code>, <code>spring.ts</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Open it, search, tick as many as you like. Backspace in the field removes the last chip."
	{...ex('basic')}
/>
<Example
	id="limit"
	title="Up to a limit, in a form"
	stack
	description="max stops at three; the rest wait until one is removed. With name, each choice is sent with the form."
	{...ex('limit')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>options</code></td><td
				><code>{'{ value, label, description?, disabled? }[]'}</code></td
			><td></td></tr
		>
		<tr
			><td><code>value</code></td><td><code>string[]</code> (bindable)</td><td><code>[]</code></td
			></tr
		>
		<tr><td><code>max</code></td><td><code>number</code></td><td></td></tr>
		<tr
			><td><code>placeholder</code></td><td><code>string</code></td><td><code>'Choose…'</code></td
			></tr
		>
		<tr
			><td><code>name</code></td><td><code>string</code>: sends each choice with the form</td><td
			></td></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>searchLabel</code>, <code>empty</code></td><td><code>string</code></td><td
				><code>'Search'</code>, <code>'No matches'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd></td><td
				>Opens the list, with focus in its search box</td
			></tr
		>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Moves through the options</td></tr>
		<tr
			><td><kbd>Enter</kbd></td><td>Ticks or unticks the highlighted option; the list stays open</td
			></tr
		>
		<tr><td><kbd>Escape</kbd></td><td>Closes the list</td></tr>
		<tr><td><kbd>Backspace</kbd></td><td>In the closed field, removes the last choice</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The field is a combobox for a multi-select listbox; each option says whether it's chosen.</li>
	<li>Adding and removing are announced with the running count.</li>
	<li>Each chip's remove button is named after it; "Remove all" clears the field.</li>
	<li>With reduced motion, chips appear and leave without scaling.</li>
</ul>
