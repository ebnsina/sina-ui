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
	<title>Fluid orb — Sina UI</title>
	<meta name="description" content="A liquid orb that shows what a voice assistant is doing." />
	<meta property="og:title" content="Fluid orb — Sina UI" />
	<meta
		property="og:description"
		content="A liquid orb that shows what a voice assistant is doing."
	/>
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Fluid orb</h1>
<p class="lede">
	A glass sphere of moving liquid that shows what a voice assistant is doing: calm when ready,
	rising as you speak, churning while it thinks, swelling as it answers.
</p>

<h2 id="installation">Installation</h2>
<Install names="orb">
	<p>Copy <code>src/lib/ui/Orb.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="voice"
	title="A voice assistant"
	description="Talk to the librarian to watch a whole turn, or hold one state. The liquid follows the voice's loudness while listening and speaking."
	{...ex('voice')}
/>
<Example
	id="small"
	title="Small"
	description="Sits beside a message. The default, lg, is the voice screen above; any number of pixels works too."
	{...ex('small')}
/>
<Example id="medium" title="Medium" description="For a toolbar or a card." {...ex('medium')} />
<Example
	id="extra-large"
	title="Extra large"
	description="For a full-screen call."
	{...ex('extra-large')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>state</code></td><td
				><code>'idle' | 'listening' | 'thinking' | 'speaking'</code></td
			><td><code>'idle'</code></td></tr
		>
		<tr
			><td><code>level</code></td><td><code>number</code>, loudness from 0 to 1</td><td
				><code>0</code></td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Assistant'</code></td></tr
		>
		<tr
			><td><code>size</code></td><td
				><code>'sm' | 'md' | 'lg' | 'xl'</code> (32, 64, 160, 240px), or a number of px</td
			><td><code>'lg'</code></td></tr
		>
		<tr><td><code>color</code></td><td>any CSS color</td><td>the accent</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Read as its label and state: “Librarian, listening”. Say the same in words beside it, as the
		example does.
	</li>
	<li>With reduced motion, the liquid holds still and changes level without waves.</li>
</ul>
