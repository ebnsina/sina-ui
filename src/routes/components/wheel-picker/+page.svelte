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
	<title>Wheel picker — Sina UI</title>
	<meta name="description" content="A scrolling wheel of choices, as on iOS." />
	<meta property="og:title" content="Wheel picker — Sina UI" />
	<meta property="og:description" content="A scrolling wheel of choices, as on iOS." />
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Wheel picker</h1>
<p class="lede">
	A spinning wheel of choices, as on iOS: for durations, times and short lists people flick through.
</p>

<h2 id="installation">Installation</h2>
<Install names="wheel-picker">
	<p>
		Copy <code>src/lib/ui/WheelPicker.svelte</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="duration"
	title="A duration"
	description="Two wheels side by side, each with its unit beside the chosen row."
	{...ex('duration')}
/>
<Example
	id="words"
	title="Words, not numbers"
	description="Any short list works: flick it, or drag."
	{...ex('words')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>items</code></td><td><code>{'{ value, label }[]'}</code></td><td>required</td></tr
		>
		<tr><td><code>value</code></td><td>the chosen value (bindable)</td><td>required</td></tr>
		<tr
			><td><code>unit</code></td><td><code>string</code>, shown beside the chosen row</td><td
			></td></tr
		>
		<tr
			><td><code>spoken</code></td><td><code>(value) =&gt; string</code>, how it's read aloud</td
			><td>the label</td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A spin button for screen readers: Up and Down arrows move one row, Page Up and Page Down five,
		Home and End to the ends.
	</li>
	<li>It snaps to a row, so it never stops between two.</li>
</ul>
