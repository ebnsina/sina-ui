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
	<title>Avatar group — Sina UI</title>
	<meta
		name="description"
		content="Overlapping avatars for a team or the readers of a page, with the rest folded into +N."
	/>
	<meta property="og:title" content="Avatar group — Sina UI" />
	<meta
		property="og:description"
		content="Overlapping avatars for a team or the readers of a page, with the rest folded into +N."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Avatar group</h1>
<p class="lede">
	Overlapping avatars for a team, a thread or the readers of a page. Past a few, the rest fold into
	“+N”, which opens the full list.
</p>

<h2 id="installation">Installation</h2>
<Install names="avatar-group">
	<p>
		Copy <code>src/lib/ui/AvatarGroup.svelte</code>, with <code>Avatar.svelte</code>,
		<code>Tooltip.svelte</code>, <code>Popover.svelte</code> and <code>tokens.css</code>. No
		dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Readers of a manuscript"
	description="Point at the group and it fans out; point at a face for the name. Press +3 for everyone else."
	{...ex('basic')}
/>
<Example id="small" title="Small" description="For lists and dense rows." {...ex('small')} />
<Example id="large" title="Large" description="For headers and profile pages." {...ex('large')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>people</code></td><td><code>{'{ name, src? }[]'}</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>max</code></td><td><code>number</code>: shown before “+N”</td><td
				><code>4</code></td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr
			><td><code>label</code></td><td><code>string</code>: names the group</td><td>“N people”</td
			></tr
		>
		<tr><td><code>onselect</code></td><td><code>(person) =&gt; void</code></td><td></td></tr>
	</tbody>
</table>
<p>
	Set <code>--ring</code> to the background color behind the group, so the gaps between faces match it.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves from face to face; each shows its name</td></tr>
		<tr
			><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>On “+N”, opens the rest; Escape closes it</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A group named with its count, so it's read as “7 readers” before the names.</li>
	<li>Each face is named by its tooltip; the list behind “+N” has every other name.</li>
	<li>Exactly one extra person shows as a face, never as “+1”.</li>
	<li>With reduced motion, faces don't fan out or lift.</li>
</ul>
