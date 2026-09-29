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
	<title>Button — Sina UI</title>
	<meta
		name="description"
		content="Buttons and link buttons with variants, sizes, icon-only and a spinner-only loading state."
	/>
	<meta property="og:title" content="Button — Sina UI" />
	<meta
		property="og:description"
		content="Buttons and link buttons with variants, sizes, icon-only and a spinner-only loading state."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Button</h1>
<p class="lede">Triggers an action, or navigates when given an <code>href</code>.</p>

<h2 id="installation">Installation</h2>
<Install names="button">
	<p>
		Copy <code>src/lib/ui/Button.svelte</code> into your project, with <code>tokens.css</code> if you
		haven't already. No dependencies; icons are optional.
	</p>
</Install>

<h2 id="examples">Examples</h2>

<Example
	id="variants"
	title="Variants"
	description="One primary action per view; secondary and ghost for everything else; danger only for what can't be undone."
	{...ex('variants')}
/>

<Example
	id="sizes"
	title="Sizes"
	description="On touch screens every size grows to at least 44px tall."
	{...ex('sizes')}
/>

<Example
	id="loading"
	title="Loading"
	description="The label is swapped for a spinner at the same width, so nothing around it moves. It keeps its name and focus, and ignores repeat clicks."
	{...ex('loading')}
/>

<Example
	id="icon"
	title="With an icon"
	description="Icon-only buttons are square and need an aria-label."
	{...ex('icon')}
/>

<Example
	id="disabled"
	title="Disabled"
	description="Prefer explaining why something is unavailable; a disabled button can't be focused or explain itself."
	{...ex('disabled')}
/>

<Example
	id="link"
	title="As a link"
	description="With href it renders a real link. variant=&quot;link&quot; looks like one; keep a button style only when navigation is the page's main call to action."
	{...ex('link')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>variant</code></td><td
				><code>'primary' | 'secondary' | 'ghost' | 'danger' | 'link'</code></td
			><td><code>'primary'</code></td></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>square</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>href</code></td><td><code>string</code></td><td>renders <code>&lt;a&gt;</code></td
			></tr
		>
		<tr
			><td>…rest</td><td colspan="2"
				>Any <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code> attribute.</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Renders <code>&lt;button type="button"&gt;</code>, so it can't submit a form by accident. Pass
		<code>type="submit"</code> when it should.
	</li>
	<li>
		While loading it uses <code>aria-disabled</code>, not <code>disabled</code>: it stays in the tab
		order, so screen reader users don't lose their place.
	</li>
	<li><code>aria-pressed</code> turns it into a toggle button with a visible pressed state.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td
				>Activates the button (links: <kbd>Enter</kbd> only).</td
			></tr
		>
	</tbody>
</table>
