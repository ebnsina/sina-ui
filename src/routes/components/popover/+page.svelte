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
	<title>Popover — Sina UI</title>
	<meta
		name="description"
		content="Non-modal panel anchored to a button, for extra detail or a quick edit."
	/>
	<meta property="og:title" content="Popover — Sina UI" />
	<meta
		property="og:description"
		content="Non-modal panel anchored to a button, for extra detail or a quick edit."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Popover</h1>
<p class="lede">
	A small panel beside a button, for extra detail or a quick edit, without leaving the page.
</p>

<h2 id="installation">Installation</h2>
<Install names="popover">
	<p>
		Copy <code>src/lib/ui/Popover.svelte</code>, <code>floating.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="profile"
	title="Detail on demand"
	description="Focus moves into the panel when it opens; Escape closes it and returns focus to the trigger."
	{...ex('profile')}
/>
<Example
	id="form"
	title="Quick edit"
	description="Tab or click away to close it; Save closes it too, through bind:open."
	{...ex('form')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>open</code></td><td><code>boolean</code>, bindable</td><td><code>false</code></td
			></tr
		>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>hideTitle</code></td><td><code>boolean</code>: screen readers only</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>side</code></td><td><code>'top' | 'right' | 'bottom' | 'left'</code></td><td
				><code>'bottom'</code></td
			></tr
		>
		<tr
			><td><code>align</code></td><td><code>'start' | 'center'</code></td><td
				><code>'start'</code></td
			></tr
		>
		<tr
			><td><code>trigger</code></td><td>Snippet receiving trigger props (required)</td><td></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A non-modal <code>role="dialog"</code> labeled by its title; the trigger has
		<code>aria-haspopup="dialog"</code>
		and <code>aria-expanded</code>.
	</li>
	<li>
		It sits right after its trigger in the page, so <kbd>Tab</kbd> flows from the trigger into it and
		out again.
	</li>
	<li>
		Opens in the top layer, positions itself around the viewport and follows its trigger on scroll.
	</li>
	<li>For something people must act on before continuing, use a Dialog instead.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>On the trigger: opens or closes it.</td></tr
		>
		<tr><td><kbd>Escape</kbd></td><td>Closes it and returns focus to the trigger.</td></tr>
		<tr><td><kbd>Tab</kbd></td><td>Moves through its content; leaving it closes it.</td></tr>
	</tbody>
</table>
