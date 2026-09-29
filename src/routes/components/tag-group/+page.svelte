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
	<title>Tag group — Sina UI</title>
	<meta
		name="description"
		content="A set of tags, such as active filters, each of which can be removed."
	/>
	<meta property="og:title" content="Tag group — Sina UI" />
	<meta
		property="og:description"
		content="A set of tags, such as active filters, each of which can be removed."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Tag group</h1>
<p class="lede">
	A set of tags, such as the filters on a search, each of which can be removed. To type new tags,
	use
	<a href="/components/tag-input">Tag input</a>.
</p>

<h2 id="installation">Installation</h2>
<Install names="tag-group">
	<p>
		Copy <code>src/lib/ui/TagGroup.svelte</code>, <code>Icon.svelte</code>, <code>announce.ts</code>
		and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="filters"
	title="Search filters"
	description="Remove a tag with its ×, or focus it and press Backspace. The others slide over to close the gap."
	{...ex('filters')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>tags</code></td><td><code>{'{ id, label }[]'}</code></td><td>required</td></tr>
		<tr
			><td><code>onremove</code></td><td
				><code>(tag) =&gt; void</code>; without it, tags can't be removed</td
			><td></td></tr
		>
		<tr><td><code>empty</code></td><td><code>string</code>, shown with no tags</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Each removable tag's button is named “Remove Optics”.</li>
	<li>One tab stop; arrow keys move between tags, Backspace or Delete removes one.</li>
	<li>After a removal, focus moves to the next tag, and the removal is announced.</li>
</ul>
