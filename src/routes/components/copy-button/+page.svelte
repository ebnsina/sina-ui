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
	<title>Copy button — Sina UI</title>
	<meta
		name="description"
		content="Copies text to the clipboard and says so: the icon turns into a tick and the label into “Copied”, then both come back."
	/>
	<meta property="og:title" content="Copy button — Sina UI" />
	<meta
		property="og:description"
		content="Copies text to the clipboard and says so: the icon turns into a tick and the label into “Copied”, then both come back."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Copy button</h1>
<p class="lede">
	Copies text to the clipboard and says so: the icon turns into a tick and the label into “Copied”,
	then both come back. The button never changes width.
</p>

<h2 id="installation">Installation</h2>
<Install names="copy-button">
	<p>
		Copy <code>src/lib/ui/CopyButton.svelte</code>, with <code>Button.svelte</code>,
		<code>Icon.svelte</code>, <code>Tooltip.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example id="label" title="With a label" {...ex('label')} />
<Example
	id="icon"
	title="Icon only"
	description="Next to the thing it copies. The tooltip names it, and says “Copied” after."
	{...ex('icon')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>value</code></td><td
				><code>string | () =&gt; string | Promise&lt;string&gt;</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>variant</code></td><td><code>'primary' | 'secondary' | 'ghost'</code></td><td
				><code>'secondary'</code></td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr
			><td><code>square</code></td><td><code>boolean</code>: icon only</td><td
				><code>false</code></td
			></tr
		>
		<tr><td><code>copied</code></td><td><code>string</code></td><td><code>'Copied'</code></td></tr>
		<tr><td><code>children</code></td><td>the label</td><td>“Copy”</td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Copies</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>“Copied”, or “Couldn't copy” if the browser refuses, is announced to screen readers.</li>
	<li>The icon-only button is named by its tooltip.</li>
	<li>With reduced motion, the icons and labels crossfade without scaling.</li>
</ul>
