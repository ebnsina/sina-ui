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
	<title>Signature pad — Sina UI</title>
	<meta
		name="description"
		content="A drawn signature with ink that thins with speed, undo and clear, a typed alternative, and PNG or SVG out."
	/>
	<meta property="og:title" content="Signature pad — Sina UI" />
	<meta
		property="og:description"
		content="A drawn signature with ink that thins with speed, undo and clear, a typed alternative, and PNG or SVG out."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Signature pad</h1>
<p class="lede">
	Sign with a finger, pen or mouse: the ink thins as it speeds up, and a pen's pressure is felt.
	Anyone who can't draw can type their name instead.
</p>

<h2 id="installation">Installation</h2>
<Install names="signature-pad">
	<p>
		Copy <code>src/lib/ui/SignaturePad.svelte</code>, with <code>Button.svelte</code>,
		<code>Input.svelte</code>, <code>Icon.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Signing for a loan"
	description="Draw above the line. Undo takes back the last stroke; Clear starts again."
	{...ex('basic')}
/>
<Example
	id="form"
	title="In a form"
	description="With a name, the signature posts as a PNG data URL. toSVG() gives the strokes as SVG."
	{...ex('form')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Signature'</code></td></tr
		>
		<tr
			><td><code>signer</code></td><td><code>string</code>: printed under the line</td><td></td></tr
		>
		<tr
			><td><code>value</code></td><td><code>string</code>: a PNG data URL (bindable)</td><td
				><code>''</code></td
			></tr
		>
		<tr
			><td><code>empty</code></td><td><code>boolean</code> (bindable)</td><td><code>true</code></td
			></tr
		>
		<tr
			><td><code>name</code></td><td><code>string</code>: posts the PNG with a form</td><td
			></td></tr
		>
	</tbody>
</table>
<p>
	Bind the component to call <code>toSVG()</code> or <code>toPNG()</code>; both return
	<code>''</code> when it's empty.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>⌘</kbd> <kbd>Z</kbd> / <kbd>Ctrl</kbd> <kbd>Z</kbd></td><td>Undo the last stroke</td
			></tr
		>
		<tr><td><kbd>Tab</kbd></td><td>Reach "Type instead", Undo and Clear</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>"Type instead" swaps drawing for a name field, so it can be signed from the keyboard.</li>
	<li>Whether it's signed is read out as it changes.</li>
	<li>The ink follows the text color, so it stays readable in dark mode.</li>
</ul>
