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
	<title>File drop — Sina UI</title>
	<meta
		name="description"
		content="Choose files or drag them in, with type and size checks and previews."
	/>
	<meta property="og:title" content="File drop — Sina UI" />
	<meta
		property="og:description"
		content="Choose files or drag them in, with type and size checks and previews."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>File drop</h1>
<p class="lede">
	Takes files by dragging them in or choosing them, and says plainly when one can't be used.
</p>

<h2 id="installation">Installation</h2>
<Install names="file-drop">
	<p>
		Copy <code>src/lib/ui/FileDrop.svelte</code>, <code>announce.ts</code>, <code>Icon.svelte</code>
		and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="images"
	title="Several images"
	stack
	description="Pictures show a preview. Files of the wrong type, too large, or over the limit are turned away with the reason."
	{...ex('images')}
/>
<Example
	id="single"
	title="One file"
	stack
	description="Without multiple, a new file replaces the old one."
	{...ex('single')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>File[]</code>, bindable</td><td><code>[]</code></td></tr
		>
		<tr
			><td><code>accept</code></td><td><code>string</code>, e.g. <code>'.pdf,image/*'</code></td><td
				>any</td
			></tr
		>
		<tr><td><code>multiple</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>maxSize</code></td><td><code>number</code> (bytes)</td><td></td></tr>
		<tr><td><code>maxFiles</code></td><td><code>number</code></td><td></td></tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>
<p>The chosen files stay in a real file input, so a plain form submit sends them.</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Dragging is a shortcut: the “choose” link opens the file picker by keyboard, touch or screen
		reader.
	</li>
	<li>Screen readers hear how many files were added, and why any were turned away.</li>
	<li>Each file in the list has its own remove button, named after the file.</li>
</ul>
