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
	<title>Toast — Sina UI</title>
	<meta
		name="description"
		content="Brief notifications that announce themselves, pause while read, and never steal focus."
	/>
	<meta property="og:title" content="Toast — Sina UI" />
	<meta
		property="og:description"
		content="Brief notifications that announce themselves, pause while read, and never steal focus."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Toast</h1>
<p class="lede">Brief news about something that just happened, shown without interrupting.</p>

<h2 id="installation">Installation</h2>
<Install names="toast">
	<p>
		Copy the <code>src/lib/ui/toast/</code> folder, <code>Button.svelte</code>,
		<code>Icon.svelte</code>
		and <code>tokens.css</code>, and add <code>&lt;Toaster /&gt;</code> once to your root layout.
		Then call <code>toast()</code> from anywhere.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="default"
	title="Default"
	description="For news that needs no color. Hover or focus a toast and its timer pauses."
	{...ex('default')}
/>
<Example
	id="success"
	title="Success"
	description="When something worked, with a line of detail."
	{...ex('success')}
/>
<Example
	id="error"
	title="Error"
	description="When something failed: say what happened and what to do."
	{...ex('failed')}
/>
<Example
	id="action"
	title="With an action"
	description="One action, such as Undo. Toasts with an action stay twice as long."
	{...ex('action')}
/>

<h2 id="api">API</h2>
<table>
	<thead><tr><th>Call</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><code>toast(message, options?)</code></td><td>Shows a toast; returns its id.</td></tr>
		<tr
			><td><code>toast.success(…)</code> / <code>toast.error(…)</code></td><td
				>With an icon, and the kind spoken to screen readers.</td
			></tr
		>
		<tr><td><code>dismiss(id)</code></td><td>Removes one early.</td></tr>
		<tr
			><td><code>options</code></td><td
				><code>description</code>, <code>action: {'{'} label, onclick }</code>,
				<code>duration</code> (ms)</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Toasts live in a labeled region that's always in the page, so screen readers announce each one
		politely without moving focus.
	</li>
	<li>
		The countdown pauses while any toast is hovered or focused and while the tab is hidden (WCAG
		2.2.1); errors stay 8 seconds, others 5, doubled when there's an action.
	</li>
	<li>
		Every toast has a close button. Anything people must act on belongs in a Dialog, not a toast.
	</li>
	<li>
		Closing a focused toast moves focus to the next one, or back to where you were: it never drops
		to the top of the page.
	</li>
	<li>Enter, exit and restacking move with transforms only, and switch off with reduced motion.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>F6</kbd></td><td>Jumps to the newest toast, and back to where you were.</td></tr>
		<tr
			><td><kbd>Tab</kbd></td><td>Moves between a toast's buttons and on to the next toast.</td></tr
		>
	</tbody>
</table>
