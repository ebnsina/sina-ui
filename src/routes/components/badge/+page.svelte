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
	<title>Badge — Sina UI</title>
	<meta name="description" content="Small status labels in a tone, readable on any background." />
	<meta property="og:title" content="Badge — Sina UI" />
	<meta
		property="og:description"
		content="Small status labels in a tone, readable on any background."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Badge</h1>
<p class="lede">A short label for status or category.</p>

<h2 id="installation">Installation</h2>
<Install names="badge">
	<p>Copy <code>src/lib/ui/Badge.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="tones"
	title="Tones"
	description="Each tone carries its icon, as Alert does, so the meaning never rests on colour alone."
	{...ex('tones')}
/>
<Example
	id="icons"
	title="Your own icon"
	description="Any Hugeicons icon in place of the tone's, or none."
	{...ex('icons')}
/>
<Example
	id="dot"
	title="With a status dot"
	description="For live status; replaces the icon."
	{...ex('dot')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>tone</code></td><td><code>'neutral' | 'accent' | 'warning' | 'danger'</code></td
			><td><code>'neutral'</code></td></tr
		>
		<tr>
			<td><code>icon</code></td><td><code>boolean | IconNode</code></td><td><code>true</code></td>
		</tr>
		<tr><td><code>dot</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Plain text in a <code>&lt;span&gt;</code>: the words carry the meaning, never the colour alone.
	</li>
	<li>
		Every tone keeps at least 4.5:1 text contrast on its tint, and its icon at least 3:1, in light
		and dark.
	</li>
	<li>The icon is decorative (hidden from screen readers): the words already say it.</li>
</ul>
