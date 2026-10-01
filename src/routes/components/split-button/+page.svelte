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
	<title>Split button — Sina UI</title>
	<meta
		name="description"
		content="A main action joined to a menu of related ones: press the left part to act, the arrow for the alternatives."
	/>
	<meta property="og:title" content="Split button — Sina UI" />
	<meta
		property="og:description"
		content="A main action joined to a menu of related ones: press the left part to act, the arrow for the alternatives."
	/>
</svelte:head>

<p class="eyebrow">Buttons</p>
<h1>Split button</h1>
<p class="lede">
	A main action joined to a menu of related ones: press the left part to act, the arrow for the
	alternatives.
</p>

<h2 id="installation">Installation</h2>
<Install names="split-button">
	<p>
		Copy <code>src/lib/ui/SplitButton.svelte</code>, with <code>Button.svelte</code>,
		<code>Icon.svelte</code>, the <code>dropdown/</code> folder and <code>tokens.css</code>. No
		dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Save, or save another way"
	description="Put the most common action on the left; the menu holds its variations."
	{...ex('basic')}
/>
<Example id="secondary" title="Secondary" {...ex('secondary')} />

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>variant</code></td><td><code>'primary' | 'secondary'</code></td><td
				><code>'primary'</code></td
			></tr
		>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr><td><code>onclick</code></td><td>the main action</td><td></td></tr>
		<tr
			><td><code>menu</code></td><td
				><code>Snippet</code> of <code>Dropdown.Item</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>menuLabel</code></td><td><code>string</code>: the arrow's name</td><td
				><code>'More options'</code></td
			></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Tab</kbd></td><td>Moves between the action and the arrow</td></tr>
		<tr
			><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td
				>Runs the action, or opens the menu on the arrow</td
			></tr
		>
		<tr><td><kbd>↓</kbd></td><td>Opens the menu from either part</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Closes the menu, back on the arrow</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The two parts are separate buttons in one group; the arrow is a menu button named by <code
			>menuLabel</code
		>.
	</li>
	<li>
		The menu follows the Dropdown: arrow keys, typeahead, and focus returns to the arrow on close.
	</li>
	<li>With reduced motion, the arrow flips without turning.</li>
</ul>
