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
	<title>Segmented control — Sina UI</title>
	<meta
		name="description"
		content="A compact single choice with a sliding thumb, built on native radios."
	/>
	<meta property="og:title" content="Segmented control — Sina UI" />
	<meta
		property="og:description"
		content="A compact single choice with a sliding thumb, built on native radios."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Segmented control</h1>
<p class="lede">Switches between a few mutually exclusive views or options.</p>

<h2 id="installation">Installation</h2>
<Install names="segmented">
	<p>
		Copy <code>src/lib/ui/Segmented.svelte</code>, <code>glide.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Click and the thumb glides; arrow keys snap it."
	{...ex('basic')}
/>
<Example id="hidden-label" title="Label for screen readers only" stack {...ex('hidden-label')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>hideLabel</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>options</code></td><td><code>{'{'} value, label {'}'}[]</code></td><td></td></tr>
		<tr><td><code>value</code></td><td><code>string</code>, bindable</td><td></td></tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td>a unique id</td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Native radios in a <code>&lt;fieldset&gt;</code>: one Tab stop, arrow keys and forms need no
		JavaScript.
	</li>
	<li>Correct before hydration: the chosen segment is raised in the server HTML.</li>
	<li>For two to five short options. More than that: a Select.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves into the control at the chosen option.</td></tr>
		<tr><td><kbd>←</kbd> / <kbd>→</kbd></td><td>Chooses the previous / next option.</td></tr>
	</tbody>
</table>
