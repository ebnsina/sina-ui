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
	<title>Checkbox — Sina UI</title>
	<meta
		name="description"
		content="Native checkbox with label, hint and an indeterminate state for select-all."
	/>
	<meta property="og:title" content="Checkbox — Sina UI" />
	<meta
		property="og:description"
		content="Native checkbox with label, hint and an indeterminate state for select-all."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Checkbox</h1>
<p class="lede">Chooses any number of options, submitted with a form.</p>

<h2 id="installation">Installation</h2>
<Install names="checkbox">
	<p>
		Copy <code>src/lib/ui/Checkbox.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. The tick and dash come from <code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="With a hint"
	description="The hint is read out as the checkbox's description."
	{...ex('basic')}
/>
<Example
	id="indeterminate"
	title="Select all"
	stack
	description="The parent shows a dash, announced as “mixed”, when only some of its children are chosen."
	{...ex('indeterminate')}
/>
<Example id="disabled" title="Disabled" {...ex('disabled')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>checked</code></td><td><code>boolean</code>, bindable</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>indeterminate</code></td><td><code>boolean</code>, bindable</td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>children</code></td><td>Snippet: the visible label</td><td></td></tr>
		<tr><td>…rest</td><td colspan="2">Any <code>&lt;input&gt;</code> attribute.</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A real <code>&lt;input type="checkbox"&gt;</code>: keyboard, forms, reset and label clicks need
		no JavaScript.
	</li>
	<li>
		The box outline keeps at least 3:1 contrast even when unchecked, since nothing else shows it's
		there.
	</li>
	<li>The hit area is 44px even though the box is 18px, so it's easy to tap.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody><tr><td><kbd>Space</kbd></td><td>Toggles the checkbox.</td></tr></tbody>
</table>
