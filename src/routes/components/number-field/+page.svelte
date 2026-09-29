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
	<title>Number field — Sina UI</title>
	<meta
		name="description"
		content="A number input with steppers, keyboard stepping and locale-aware formatting."
	/>
	<meta property="og:title" content="Number field — Sina UI" />
	<meta
		property="og:description"
		content="A number input with steppers, keyboard stepping and locale-aware formatting."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Number field</h1>
<p class="lede">
	Enters a number, with buttons and keys to step it, written the way the reader's locale writes
	numbers.
</p>

<h2 id="installation">Installation</h2>
<Install names="number-field">
	<p>
		Copy <code>src/lib/ui/NumberField.svelte</code>, <code>announce.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Hold a button to keep stepping, faster the longer you hold. The buttons stop at the limits."
	{...ex('basic')}
/>
<Example
	id="units"
	title="With a unit"
	stack
	description="Any Intl number format: units, currency, decimals. Typed values snap to the step when you leave the field."
	{...ex('units')}
/>
<Example
	id="percent"
	title="Percent"
	stack
	description="Type 15 and it means 15%."
	{...ex('percent')}
/>
<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>number</code>, bindable</td><td></td></tr>
		<tr><td><code>min</code>, <code>max</code></td><td><code>number</code></td><td></td></tr>
		<tr><td><code>step</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr><td><code>format</code></td><td><code>Intl.NumberFormatOptions</code></td><td></td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A text field, so phones show a number keyboard and screen readers read what was typed as typed.
	</li>
	<li>
		The buttons are skipped by Tab (the arrow keys do the same job) but screen readers can press
		them, and each change is announced.
	</li>
	<li>Buttons are 44px on touch screens; holding one is the same as pressing it repeatedly.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Step up / down.</td></tr>
		<tr><td><kbd>Page Up</kbd> <kbd>Page Down</kbd></td><td>Ten steps up / down.</td></tr>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>Minimum / maximum.</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Take what was typed.</td></tr>
	</tbody>
</table>
