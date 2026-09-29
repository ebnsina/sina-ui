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
	<title>Switch — Sina UI</title>
	<meta
		name="description"
		content="On/off switch built on a native checkbox: keyboard, forms and labels work for free."
	/>
	<meta property="og:title" content="Switch — Sina UI" />
	<meta
		property="og:description"
		content="On/off switch built on a native checkbox: keyboard, forms and labels work for free."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Switch</h1>
<p class="lede">Turns a single setting on or off, taking effect immediately.</p>

<h2 id="installation">Installation</h2>
<Install names="switch">
	<p>Copy <code>src/lib/ui/Switch.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>

<Example
	id="basic"
	title="Basic"
	description="A native checkbox underneath: it submits with its form as name=on."
	{...ex('basic')}
/>

<Example id="disabled" title="Disabled" {...ex('disabled')} />

<Example
	id="without-label"
	title="Without a visible label"
	description="When the context makes it obvious, name it with aria-label instead."
	{...ex('without-label')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>checked</code></td><td><code>boolean</code>, bindable</td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>children</code></td><td>Snippet: the visible label</td><td></td></tr>
		<tr
			><td>…rest</td><td colspan="2"
				>Any <code>&lt;input&gt;</code> attribute (<code>name</code>, <code>disabled</code>,
				<code>aria-label</code>…).</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A native checkbox with <code>role="switch"</code>: form submission, reset and label clicks need
		no JavaScript.
	</li>
	<li>The thumb, not the track, shows the state, with at least 3:1 contrast in both positions.</li>
	<li>
		Use a switch for settings that apply immediately; use a checkbox for choices submitted with a
		form.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Space</kbd></td><td>Toggles the switch.</td></tr>
	</tbody>
</table>
