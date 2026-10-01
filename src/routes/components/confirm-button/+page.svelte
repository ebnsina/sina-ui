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
	<title>Confirm button — Sina UI</title>
	<meta
		name="description"
		content="A button that asks “Are you sure?” in place, then acts on a second press."
	/>
	<meta property="og:title" content="Confirm button — Sina UI" />
	<meta
		property="og:description"
		content="A button that asks “Are you sure?” in place, then acts on a second press."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Confirm button</h1>
<p class="lede">
	For actions worth a second thought. The first press turns it red and asks; a second press within a
	few seconds goes ahead. Otherwise it quietly goes back.
</p>

<h2 id="installation">Installation</h2>
<Install names="confirm-button">
	<p>
		Copy <code>src/lib/ui/ConfirmButton.svelte</code>, with <code>Button.svelte</code>,
		<code>Morph.svelte</code>, <code>Icon.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Withdraw a loan"
	description="Press once to be asked, again to confirm. Wait, press Escape or move away and it goes back."
	{...ex('basic')}
/>
<Example
	id="async"
	title="Deleting something"
	description="When onconfirm returns a promise, it works, then shows it’s done. This one waits five seconds for an answer."
	{...ex('async')}
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
			><td><code>confirm</code></td><td><code>string</code></td><td><code>'Are you sure?'</code></td
			></tr
		>
		<tr><td><code>done</code></td><td><code>string</code></td><td><code>'Done'</code></td></tr>
		<tr><td><code>timeout</code></td><td><code>number</code> (ms)</td><td><code>3000</code></td></tr
		>
		<tr
			><td><code>variant</code></td><td
				><code>'danger' | 'primary'</code>: a light tint at rest, solid once it asks</td
			><td><code>'danger'</code></td></tr
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
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Ask, then confirm</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Change your mind</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The question is announced with how to confirm it.</li>
	<li>Moving focus away, Escape or waiting cancels it.</li>
	<li>With reduced motion, labels fade without sliding.</li>
</ul>
