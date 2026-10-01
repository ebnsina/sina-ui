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
	<title>Hold to confirm — Sina UI</title>
	<meta
		name="description"
		content="A button you press and hold to confirm, filling up as you hold."
	/>
	<meta property="og:title" content="Hold to confirm — Sina UI" />
	<meta
		property="og:description"
		content="A button you press and hold to confirm, filling up as you hold."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Hold to confirm</h1>
<p class="lede">
	Press and hold until it fills. Let go early and it drains away, so nothing happens by accident.
</p>

<h2 id="installation">Installation</h2>
<Install names="hold-to-confirm">
	<p>
		Copy <code>src/lib/ui/HoldToConfirm.svelte</code>, with <code>motion.ts</code>,
		<code>spring.ts</code>, <code>Button.svelte</code>, <code>Morph.svelte</code>,
		<code>Icon.svelte</code>, <code>announce.ts</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Remove a draft"
	description="Hold until the fill reaches the end."
	{...ex('basic')}
/>
<Example
	id="publish"
	title="A longer hold"
	description="duration sets how long to hold; here 1.6 seconds, on a primary button."
	{...ex('publish')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onconfirm</code></td><td><code>() =&gt; Promise | void</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>duration</code></td><td><code>number</code> (ms)</td><td><code>1200</code></td></tr
		>
		<tr><td><code>done</code></td><td><code>string</code></td><td><code>'Done'</code></td></tr>
		<tr
			><td><code>variant</code></td><td><code>'primary' | 'danger'</code></td><td
				><code>'danger'</code></td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Hold <kbd>Space</kbd> or <kbd>Enter</kbd></td><td>Fill and confirm</td></tr>
		<tr><td>Let go</td><td>Drain away, nothing happens</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Screen readers hear “Press and hold to confirm” with the button’s name.</li>
	<li>Confirming is announced.</li>
	<li>Long-pressing on a phone doesn’t open the text menu.</li>
</ul>
