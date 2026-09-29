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
	<title>Timer — Sina UI</title>
	<meta name="description" content="A countdown set on a ruler, with a chime when time is up." />
	<meta property="og:title" content="Timer — Sina UI" />
	<meta
		property="og:description"
		content="A countdown set on a ruler, with a chime when time is up."
	/>
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Timer</h1>
<p class="lede">
	Counts down from a few minutes, then chimes. For tea, study sessions and anything that needs a
	nudge.
</p>

<h2 id="installation">Installation</h2>
<Install names="timer">
	<p>
		Copy <code>src/lib/ui/Widget.svelte</code>, <code>src/lib/ui/Timer.svelte</code>,
		<code>chime.ts</code>,
		<code>RollingNumber.svelte</code>, <code>Button.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="A study session"
	description="Drag the ruler (or swipe, or use the arrow keys) to set minutes, then start. While it runs, the ruler slides back toward zero. When it ends, it chimes and the tab title says so."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>minutes</code></td><td><code>number</code>: starting length</td><td
				><code>15</code></td
			></tr
		>
		<tr
			><td><code>max</code></td><td><code>number</code>: longest, in minutes</td><td
				><code>60</code></td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Timer'</code></td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The time left is not read aloud as it counts; “Time’s up” is announced at once when it ends.
	</li>
	<li>
		The ruler is a slider named “Length” and read in minutes; arrow keys move it one minute, Page Up
		and Page Down five.
	</li>
	<li>With reduced motion, nothing breathes or pulses.</li>
</ul>
