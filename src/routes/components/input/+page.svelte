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
	<title>Input — Sina UI</title>
	<meta
		name="description"
		content="Text field with a built-in label, hint and error message, wired for screen readers."
	/>
	<meta property="og:title" content="Input — Sina UI" />
	<meta
		property="og:description"
		content="Text field with a built-in label, hint and error message, wired for screen readers."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Input</h1>
<p class="lede">A text field that always has a label, with optional hint and error text.</p>

<h2 id="installation">Installation</h2>
<Install names="input">
	<p>Copy <code>src/lib/ui/Input.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>

<Example id="basic" title="Basic" stack {...ex('basic')} />

<Example
	id="hint"
	title="With a hint"
	stack
	description="The hint is read out after the label, so instructions reach screen reader users too."
	{...ex('hint')}
/>

<Example
	id="error"
	title="With an error"
	stack
	description="An error marks the field invalid and is read out with it. Type a full address to clear it."
	{...ex('error')}
/>

<Example id="disabled" title="Disabled" stack {...ex('disabled')} />

<Example
	id="addons"
	title="With a prefix and suffix"
	stack
	description="Text or an icon inside the box, before or after what's typed."
	{...ex('addons')}
/>
<Example
	id="copy"
	title="With a button"
	stack
	description="A button inside the box: here, copying the link, with a tick to say it worked."
	{...ex('copy')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string | number | null</code>, bindable</td><td
			></td></tr
		>
		<tr
			><td><code>start</code>, <code>end</code></td><td><code>Snippet</code>: inside the box</td><td
			></td></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td>…rest</td><td colspan="2">Any <code>&lt;input&gt;</code> attribute.</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		<code>label</code> is required and linked to the field: clicking it focuses the field, and screen
		readers announce it.
	</li>
	<li>
		<code>hint</code> and <code>error</code> are joined with <code>aria-describedby</code>; an error
		also sets <code>aria-invalid</code>.
	</li>
	<li>Text is at least 16px so iOS Safari doesn't zoom the page on focus.</li>
</ul>
