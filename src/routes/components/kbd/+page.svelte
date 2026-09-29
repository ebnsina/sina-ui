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
	<title>Kbd — Sina UI</title>
	<meta
		name="description"
		content="Keyboard keys and shortcuts, shown the way each platform writes them."
	/>
	<meta property="og:title" content="Kbd — Sina UI" />
	<meta
		property="og:description"
		content="Keyboard keys and shortcuts, shown the way each platform writes them."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Kbd</h1>
<p class="lede">
	Shows a key or a shortcut, with the right symbols on Apple devices and the right names elsewhere.
</p>

<h2 id="installation">Installation</h2>
<Install names="kbd">
	<p>
		Copy <code>src/lib/ui/Kbd.svelte</code>, <code>announce.ts</code> and <code>tokens.css</code>.
		No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="shortcuts"
	title="Shortcuts"
	stack
	description="mod is ⌘ on Apple devices and Ctrl elsewhere. Try pressing them: keys light up while held."
	{...ex('shortcuts')}
/>
<Example id="inline" title="In a sentence" stack {...ex('inline')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>keys</code></td><td
				><code>string[]</code>: <code>mod</code>, <code>ctrl</code>, <code>shift</code>,
				<code>alt</code>, <code>enter</code>, <code>esc</code>, <code>backspace</code>,
				<code>tab</code>, arrows (<code>up</code>…), or any key</td
			><td></td></tr
		>
		<tr
			><td><code>children</code></td><td><code>Snippet</code>: a single key written out</td><td
			></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Symbols are read by name: ⌘K is read “Command+K”, not “place of interest sign K”.</li>
	<li>
		Only shows keys: it does not bind them. Add the shortcut yourself, and say so with <code
			>aria-keyshortcuts</code
		> on the control it triggers.
	</li>
</ul>
