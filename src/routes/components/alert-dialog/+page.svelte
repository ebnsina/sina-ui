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
	<title>Alert dialog — Sina UI</title>
	<meta name="description" content="A confirmation that asks before something important happens." />
	<meta property="og:title" content="Alert dialog — Sina UI" />
	<meta
		property="og:description"
		content="A confirmation that asks before something important happens."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Alert dialog</h1>
<p class="lede">
	Asks before something important happens, such as deleting. It waits for an answer: a press outside
	doesn't close it.
</p>

<h2 id="installation">Installation</h2>
<Install names="alert-dialog">
	<p>
		Copy <code>src/lib/ui/AlertDialog.svelte</code>, <code>Dialog.svelte</code>,
		<code>Button.svelte</code>,
		<code>Spinner.svelte</code>, <code>scroll-edges.ts</code> and <code>tokens.css</code>. No
		dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="delete"
	title="Confirm a delete"
	description="The button waits while it works. The first try fails here, to show the dialog staying open with the reason; try again and it goes through."
	{...ex('delete')}
/>

<h2 id="writing">Writing it</h2>
<ul>
	<li>Ask a question that names the action: “Delete this manuscript?”</li>
	<li>Say what happens and whether it can be undone.</li>
	<li>Label the button with the verb (“Delete”), never “OK” or “Yes”.</li>
</ul>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>open</code></td><td><code>boolean</code> (bindable)</td><td><code>false</code></td
			></tr
		>
		<tr
			><td><code>title</code>, <code>description</code></td><td><code>string</code></td><td
				>required</td
			></tr
		>
		<tr><td><code>confirmLabel</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>cancelLabel</code></td><td><code>string</code></td><td><code>'Cancel'</code></td
			></tr
		>
		<tr
			><td><code>tone</code></td><td><code>'danger' | 'primary'</code></td><td
				><code>'danger'</code></td
			></tr
		>
		<tr
			><td><code>onconfirm</code></td><td
				><code>() =&gt; void | Promise&lt;void&gt;</code>; throw to keep it open with the message</td
			><td>required</td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>An alert dialog: the question and description are read as soon as it opens.</li>
	<li>Focus starts on Cancel, so a stray Enter never confirms.</li>
	<li>
		Escape cancels, except while the action is under way. Focus returns to the button that opened
		it.
	</li>
</ul>
