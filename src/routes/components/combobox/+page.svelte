<script lang="ts">
	import { resolve } from '$app/paths';
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>Combobox — Sina UI</title>
	<meta
		name="description"
		content="A text box that filters a list as you type, with keyboard and screen reader support."
	/>
	<meta property="og:title" content="Combobox — Sina UI" />
	<meta
		property="og:description"
		content="A text box that filters a list as you type, with keyboard and screen reader support."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Combobox</h1>
<p class="lede">Chooses one option from a long list by typing part of its name.</p>

<h2 id="installation">Installation</h2>
<Install names="combobox">
	<p>
		Copy <code>src/lib/ui/Combobox.svelte</code>, <code>floating.ts</code>, <code>glide.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>. No other dependencies.
	</p>
	<p>
		For a dozen options or fewer, a <a href={resolve('/components/select')}>Select</a> is quicker to use:
		nothing to type.
	</p>

	<p>
		For options from a server, loaded page by page, the example below uses TanStack Query (any data
		library works):
	</p>
	<Code code="pnpm add @tanstack/svelte-query" lang="shell" label="Install command" />
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Matches anywhere in the name, ignoring case and accents: “cordoba” finds Córdoba. With a name, a hidden input submits the value."
	{...ex('basic')}
/>
<Example
	id="descriptions"
	title="With descriptions"
	stack
	description="A second line per option. Disabled options still show up in results but can't be chosen."
	{...ex('descriptions')}
/>
<Example
	id="search-in-list"
	title="Search inside the list"
	stack
	description="A button that opens a list with its own search box: the chosen value can't be typed over, only searched for. This is Select's searchable option."
	{...ex('search-in-list')}
/>
<Example
	id="infinite"
	title="Thousands of options"
	stack
	description="With TanStack Query: the search goes to the server as you type, and the next page loads as you scroll near the end."
	{...ex('infinite')}
/>
<Example id="error" title="With an error" stack {...ex('error')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr>
			<td><code>options</code></td>
			<td><code>{'{'} value, label, description?, disabled? {'}'}[]</code></td>
			<td></td>
		</tr>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr><td><code>placeholder</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>empty</code></td><td><code>string</code></td><td><code>'No matches'</code></td></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>onsearch</code></td><td
				><code>(query) =&gt; void</code>: you filter; options show as given</td
			><td></td></tr
		>
		<tr
			><td><code>onloadmore</code></td><td><code>() =&gt; void</code>: scrolled near the end</td><td
			></td></tr
		>
		<tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Follows the WAI-ARIA combobox pattern with list autocomplete: focus stays in the text box and
		points at the highlighted option.
	</li>
	<li>Screen readers hear how many options match as you type.</li>
	<li>
		Typing never changes the value on its own. Leaving the field without choosing puts back the last
		choice.
	</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>↓</kbd> / <kbd>↑</kbd></td><td>Opens the list, then moves through it.</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Chooses the highlighted option.</td></tr>
		<tr><td><kbd>Tab</kbd></td><td>Chooses the highlighted option and moves on.</td></tr>
		<tr>
			<td><kbd>Esc</kbd></td>
			<td>Closes the list and undoes the typing. Pressed again, clears the field.</td>
		</tr>
		<tr><td><kbd>Alt</kbd> + <kbd>↓</kbd></td><td>Opens the list without moving.</td></tr>
	</tbody>
</table>
