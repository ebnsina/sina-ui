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
	<title>Action button — Sina UI</title>
	<meta
		name="description"
		content="A button that runs a task and shows it working, then done or failed, without changing size."
	/>
	<meta property="og:title" content="Action button — Sina UI" />
	<meta
		property="og:description"
		content="A button that runs a task and shows it working, then done or failed, without changing size."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Action button</h1>
<p class="lede">
	Runs a task and says how it went: working, then done or failed, in the button itself. The button
	keeps its size through every state.
</p>

<h2 id="installation">Installation</h2>
<Install names="action-button">
	<p>
		Copy <code>src/lib/ui/ActionButton.svelte</code>, with <code>Button.svelte</code>,
		<code>Morph.svelte</code>, <code>Icon.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Send and confirm"
	description="Press it: a spinner while it works, then a tick."
	{...ex('basic')}
/>
<Example
	id="failing"
	title="When it fails"
	description="This one fails the first time. It says so in red, then goes back so you can try again. With pending, words sit beside the spinner while it works."
	{...ex('failing')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>action</code></td><td><code>() =&gt; Promise | void</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>pending</code></td><td><code>string</code>: words beside the spinner</td><td
			></td></tr
		>
		<tr><td><code>done</code></td><td><code>string</code></td><td><code>'Done'</code></td></tr>
		<tr
			><td><code>failed</code></td><td><code>string</code></td><td><code>'Didn’t work'</code></td
			></tr
		>
		<tr><td><code>onerror</code></td><td><code>(error) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>variant</code></td><td><code>'primary' | 'secondary' | 'ghost'</code></td><td
				><code>'primary'</code></td
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
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Run it</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Working, done and failed are each announced; failure is announced straight away.</li>
	<li>While it works, presses are ignored, so a task never runs twice.</li>
	<li>With reduced motion, labels fade without sliding.</li>
</ul>
