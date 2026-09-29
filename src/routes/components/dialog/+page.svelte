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
	<title>Dialog — Sina UI</title>
	<meta
		name="description"
		content="Modal dialog and side sheet on the native dialog element: focus trap, Escape and focus return built in."
	/>
	<meta property="og:title" content="Dialog — Sina UI" />
	<meta
		property="og:description"
		content="Modal dialog and side sheet on the native dialog element: focus trap, Escape and focus return built in."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Dialog</h1>
<p class="lede">
	Interrupts the page for a focused task, as a centred modal or a sheet from the side.
</p>

<h2 id="installation">Installation</h2>
<Install names="dialog">
	<p>
		Copy <code>src/lib/ui/Dialog.svelte</code>, <code>Icon.svelte</code> and
		<code>tokens.css</code>. The close button's icon comes from
		<code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>

<Example
	id="modal"
	title="Modal"
	description="Centred, with a title, description and footer actions. Clicking the backdrop or pressing Escape closes it."
	{...ex('modal')}
/>

<Example
	id="sheet"
	title="Side sheet"
	description="side=&quot;start&quot; slides in from the reading-start edge, and from the right in right-to-left pages. The docs' mobile navigation uses it."
	{...ex('sheet')}
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
		<tr><td><code>description</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>side</code></td><td><code>'center' | 'start'</code></td><td
				><code>'center'</code></td
			></tr
		>
		<tr
			><td><code>closeLabel</code></td><td><code>string</code></td><td><code>'Close'</code></td></tr
		>
		<tr><td><code>footer</code></td><td>Snippet</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Built on <code>&lt;dialog&gt;</code> with <code>showModal()</code>: focus stays inside, the page
		behind is inert, and focus returns to the trigger on close.
	</li>
	<li>Labelled by its <code>title</code> and described by its <code>description</code>.</li>
	<li>Dragging a text selection out onto the backdrop doesn't close it.</li>
	<li>
		Add <code>autofocus</code> to the field that should receive focus when it opens. Translate
		<code>closeLabel</code> for non-English interfaces.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>Tab</kbd> / <kbd>Shift</kbd> <kbd>Tab</kbd></td><td
				>Moves between controls inside the dialog.</td
			></tr
		>
		<tr><td><kbd>Escape</kbd></td><td>Closes the dialog and returns focus.</td></tr>
	</tbody>
</table>
