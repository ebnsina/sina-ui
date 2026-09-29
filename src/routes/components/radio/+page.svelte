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
	<title>Radio group — Sina UI</title>
	<meta
		name="description"
		content="Native radio group with a legend, hints and horizontal layout."
	/>
	<meta property="og:title" content="Radio group — Sina UI" />
	<meta
		property="og:description"
		content="Native radio group with a legend, hints and horizontal layout."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Radio group</h1>
<p class="lede">Chooses exactly one option from a short list.</p>

<h2 id="installation">Installation</h2>
<Install names="radio">
	<p>
		Copy the <code>src/lib/ui/radio/</code> folder and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="basic" title="Basic" stack {...ex('basic')} />
<Example
	id="hints"
	title="With hints"
	stack
	description="Each hint is read out with its option. Disabled options stay visible so people know they exist."
	{...ex('hints')}
/>
<Example
	id="horizontal"
	title="Horizontal"
	stack
	description="For two or three short options. Arrow keys still move in reading order."
	{...ex('horizontal')}
/>
<Example
	id="error"
	title="Hint and error"
	stack
	description="Both belong to the whole group and are read with its question."
	{...ex('error')}
/>

<h2 id="props">Props</h2>
<h3 id="props-group">Radio.Group</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>legend</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>string</code>, bindable</td><td></td></tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td>a unique id</td></tr>
		<tr
			><td><code>orientation</code></td><td><code>'vertical' | 'horizontal'</code></td><td
				><code>'vertical'</code></td
			></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>required</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>error</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<h3 id="props-item">Radio.Item</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>value</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code>: screen readers announce the
		question with each option.
	</li>
	<li>Native radios: the group is one <kbd>Tab</kbd> stop, and arrow keys move and select.</li>
	<li>
		Each group gets a unique <code>name</code> by default, so two groups on a page never merge.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves into the group at the selected option.</td></tr>
		<tr
			><td><kbd>↓</kbd> / <kbd>→</kbd>, <kbd>↑</kbd> / <kbd>←</kbd></td><td
				>Selects the next / previous option.</td
			></tr
		>
		<tr><td><kbd>Space</kbd></td><td>Selects the focused option if none is selected.</td></tr>
	</tbody>
</table>
