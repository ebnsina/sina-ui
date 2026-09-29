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
	<title>Select — Sina UI</title>
	<meta
		name="description"
		content="Native select styled to match Input, with label, hint, error and the platform picker on phones."
	/>
	<meta property="og:title" content="Select — Sina UI" />
	<meta
		property="og:description"
		content="Native select styled to match Input, with label, hint, error and the platform picker on phones."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Select</h1>
<p class="lede">
	Chooses one option from a list. Two variants: the browser's own, and a custom list you can style.
</p>

<h2 id="installation">Installation</h2>
<Install names="select custom-select" />

<h2 id="which">Which one?</h2>
<ul>
	<li>
		<strong>Native</strong> for plain text options. Phones open their system picker, and it works with
		no JavaScript. Prefer it.
	</li>
	<li>
		<strong>Custom</strong> when options need a second line, an icon or a swatch, or the list must match
		your design exactly.
	</li>
</ul>

<h2 id="native">Native</h2>
<p>
	Copy <code>src/lib/ui/Select.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>.
</p>
<Example
	id="native-placeholder"
	title="With a placeholder"
	stack
	description="The placeholder reads as a hint and can't be chosen back once something is picked."
	{...ex('basic')}
/>
<Example id="native-groups" title="Grouped options" stack {...ex('groups')} />
<Example id="native-error" title="With an error" stack {...ex('error')} />

<h2 id="custom">Custom</h2>
<p>
	Copy <code>src/lib/ui/CustomSelect.svelte</code>, <code>floating.ts</code>,
	<code>Icon.svelte</code>
	and <code>tokens.css</code>. No other dependencies.
</p>
<Example
	id="custom-basic"
	title="Basic"
	stack
	description="Type to jump: several letters in a row search together, so “sam” reaches Samarkand. With a name, a hidden input submits the value."
	{...ex('custom-basic')}
/>
<Example
	id="custom-descriptions"
	title="With descriptions"
	stack
	description="A second line per option. Disabled options stay visible but can't be chosen."
	{...ex('custom-descriptions')}
/>
<Example
	id="custom-items"
	title="Custom rendering"
	stack
	description="The item snippet renders each option however you like; the check mark and keyboard behaviour stay."
	{...ex('custom-items')}
/>

<h2 id="props">Props</h2>
<h3 id="props-native">Select</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr
			><td><code>placeholder</code>, <code>hint</code>, <code>error</code></td><td
				><code>string</code></td
			><td></td></tr
		>
		<tr
			><td><code>children</code></td><td
				><code>&lt;option&gt;</code> and <code>&lt;optgroup&gt;</code> elements</td
			><td></td></tr
		>
	</tbody>
</table>
<h3 id="props-custom">CustomSelect</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>options</code></td><td
				><code>{'{'} value, label, description?, disabled? {'}'}[]</code></td
			><td></td></tr
		>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr
			><td><code>placeholder</code></td><td><code>string</code></td><td><code>'Choose…'</code></td
			></tr
		>
		<tr
			><td><code>name</code></td><td><code>string</code>: submits via a hidden input</td><td
			></td></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>item</code></td><td>Snippet <code>(option, selected)</code></td><td></td></tr>
		<tr
			><td><code>searchable</code></td><td
				><code>boolean</code>: a search box above the list (<a
					href="/components/combobox#search-in-list">example</a
				>)</td
			><td><code>false</code></td></tr
		>
		<tr
			><td><code>searchLabel</code>, <code>empty</code></td><td><code>string</code></td><td
				><code>'Search'</code>, <code>'No matches'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Native: a real <code>&lt;select&gt;</code> with the platform's picker, keyboard and typeahead.
	</li>
	<li>
		Custom: the WAI-ARIA select-only combobox pattern. Focus stays on the button (<code
			>role="combobox"</code
		>) and the highlighted option is announced through <code>aria-activedescendant</code>.
	</li>
	<li>Both: the same label, hint and error wiring as Input; 16px text so iOS doesn't zoom.</li>
</ul>
<h3 id="keys-custom">Keyboard (custom)</h3>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> / <kbd>↑</kbd></td><td
				>Closed: opens at the current option.</td
			></tr
		>
		<tr
			><td><kbd>↓</kbd> / <kbd>↑</kbd></td><td>Open: next / previous option (skips disabled).</td
			></tr
		>
		<tr
			><td><kbd>Home</kbd> / <kbd>End</kbd>, <kbd>PageUp</kbd> / <kbd>PageDown</kbd></td><td
				>First / last, or ten at a time.</td
			></tr
		>
		<tr><td>Letters</td><td>Jump to the first match; keep typing to refine.</td></tr>
		<tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>Tab</kbd></td><td
				>Chooses the highlighted option (<kbd>Tab</kbd> also moves on).</td
			></tr
		>
		<tr><td><kbd>Escape</kbd></td><td>Closes without changing anything.</td></tr>
	</tbody>
</table>
