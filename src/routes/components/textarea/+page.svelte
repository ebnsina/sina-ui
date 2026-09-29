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
	<title>Textarea — Sina UI</title>
	<meta
		name="description"
		content="Multi-line text field with label, hint and error, growing with its content."
	/>
	<meta property="og:title" content="Textarea — Sina UI" />
	<meta
		property="og:description"
		content="Multi-line text field with label, hint and error, growing with its content."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Textarea</h1>
<p class="lede">For longer text: notes, descriptions, messages.</p>

<h2 id="installation">Installation</h2>
<Install names="textarea">
	<p>Copy <code>src/lib/ui/Textarea.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Grows with its text in browsers that support field-sizing; elsewhere it's a resizable box."
	{...ex('basic')}
/>
<Example
	id="error"
	title="With validation"
	stack
	description="Start typing: the error clears once there's enough to file."
	{...ex('error')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>string | null</code>, bindable</td><td></td></tr>
		<tr
			><td><code>rows</code></td><td><code>number</code>: minimum height</td><td><code>3</code></td
			></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Same wiring as Input: required label, hint and error via <code>aria-describedby</code>,
		<code>aria-invalid</code> on error.
	</li>
	<li>16px text so iOS Safari doesn't zoom in on focus.</li>
</ul>
