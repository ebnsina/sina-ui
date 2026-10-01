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
	<title>Sidebar layout — Sina UI</title>
	<meta
		name="description"
		content="An app shell with a sidebar that collapses to icons, and a sheet on small screens."
	/>
	<meta property="og:title" content="Sidebar layout — Sina UI" />
	<meta
		property="og:description"
		content="An app shell with a sidebar that collapses to icons, and a sheet on small screens."
	/>
</svelte:head>

<p class="eyebrow">Navigation</p>
<h1>Sidebar layout</h1>
<p class="lede">The frame of an app: navigation down the side, the page beside it.</p>

<h2 id="installation">Installation</h2>
<Install names="sidebar-layout">
	<p>
		Copy <code>src/lib/ui/SidebarLayout.svelte</code>, <code>Dialog.svelte</code>,
		<code>Tooltip.svelte</code>, <code>floating.ts</code>, <code>glide.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>. No other dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Library app"
	description="Collapse to an icon rail with the button or ⌘B; the icons name themselves in tooltips. The highlight glides to the page you choose."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>groups</code></td><td
				><code>{'{'} title?, items: {'{'} label, href, icon }[] }[]</code></td
			><td></td></tr
		>
		<tr
			><td><code>current</code></td><td><code>string</code>: href of the page shown</td><td
			></td></tr
		>
		<tr
			><td><code>collapsed</code></td><td><code>boolean</code>, bindable</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>persist</code></td><td><code>string</code>: remember collapsed under this key</td
			><td></td></tr
		>
		<tr><td><code>onselect</code></td><td><code>(item) =&gt; void</code></td><td></td></tr>
		<tr><td><code>header</code>, <code>footer</code></td><td><code>Snippet</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A labeled navigation landmark; the current page carries <code>aria-current="page"</code>.
	</li>
	<li>Collapsed, each icon's tooltip is its name, for sighted people and screen readers alike.</li>
	<li>The collapse button says whether the sidebar is open, and its shortcut is announced.</li>
	<li>On narrow screens the same links open in a modal sheet with a close button.</li>
</ul>
