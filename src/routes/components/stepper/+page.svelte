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
	<title>Stepper — Sina UI</title>
	<meta
		name="description"
		content="Shows progress through a multi-step form, with finished steps you can go back to."
	/>
	<meta property="og:title" content="Stepper — Sina UI" />
	<meta
		property="og:description"
		content="Shows progress through a multi-step form, with finished steps you can go back to."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Stepper</h1>
<p class="lede">Shows where someone is in a form of several steps, and lets them go back.</p>

<h2 id="installation">Installation</h2>
<Install names="stepper">
	<p>
		Copy <code>src/lib/ui/Stepper.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="flow"
	title="A borrowing request"
	description="Finished steps can be chosen to go back; steps ahead can't be skipped to. Narrow the window to see the compact form."
	{...ex('flow')}
/>
<Example
	id="vertical"
	title="Down the side, with a problem"
	stack
	description="Vertical keeps names and descriptions beside their markers, for sidebars and narrow columns. A step with an error shows it in place of its description."
	{...ex('vertical')}
/>
<p>
	The Stepper shows progress; your page shows each step's content. The example slides content in the
	direction of travel and moves focus to the new step's heading, so screen readers announce it.
</p>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>steps</code></td><td><code>{'{'} label, description?, error? }[]</code></td><td
			></td></tr
		>
		<tr
			><td><code>current</code></td><td><code>number</code>, bindable</td><td><code>0</code></td
			></tr
		>
		<tr
			><td><code>onstep</code></td><td><code>(index) =&gt; void</code></td><td
				>steps can't be chosen</td
			></tr
		>
		<tr><td><code>label</code></td><td><code>string</code></td><td><code>'Progress'</code></td></tr>
		<tr
			><td><code>orientation</code></td><td><code>'horizontal' | 'vertical'</code></td><td
				><code>'horizontal'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A navigation landmark around an ordered list; the current step carries <code
			>aria-current="step"</code
		>.
	</li>
	<li>Each step is read with its place and state: “Step 2 of 4: Manuscript, current”.</li>
	<li>Finished steps are buttons; steps not reached yet are plain text.</li>
	<li>A step with an error is read with it: “Step 3 of 5: Paper and ink, needs attention: …”.</li>
</ul>
