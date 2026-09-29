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
	import Code from '#lib/site/Code.svelte';

	const keepOpen = `<Dropdown.Item onselect={(e) => { e.preventDefault(); toggleBookmark(); }}>
  Bookmark
</Dropdown.Item>`;
</script>

<svelte:head>
	<title>Dropdown — Sina UI</title>
	<meta
		name="description"
		content="Menu button that grows out of its trigger, positions itself around the viewport and follows the WAI-ARIA menu pattern."
	/>
	<meta property="og:title" content="Dropdown — Sina UI" />
	<meta
		property="og:description"
		content="Menu button that grows out of its trigger, positions itself around the viewport and follows the WAI-ARIA menu pattern."
	/>
</svelte:head>

<p class="eyebrow">Overlays</p>
<h1>Dropdown</h1>
<p class="lede">
	A menu of actions behind a button. It opens below or above, aligns to whichever edge fits, and
	grows out of its trigger.
</p>

<h2 id="installation">Installation</h2>
<Install names="dropdown">
	<p>
		Copy the <code>src/lib/ui/dropdown/</code> folder, <code>floating.ts</code> and
		<code>tokens.css</code>. No dependencies (icons in the examples are optional).
	</p>
</Install>

<h2 id="examples">Examples</h2>

<Example
	id="basic"
	title="Basic"
	description="Spread props onto your trigger: it carries the ARIA attributes, keyboard handling and a reference for positioning. Try the arrow keys, or type a letter."
	{...ex('basic')}
/>

<Example
	id="icon-trigger"
	title="Icon trigger"
	description="Near the viewport's edge the menu aligns to the trigger's other side instead of being pushed in."
	{...ex('icon-trigger')}
/>
<Example
	id="submenu"
	title="Submenus"
	description="Point at an item with an arrow and its submenu opens beside it; it stays open while you move across. From the keyboard, Right arrow opens it and Left arrow or Escape comes back."
	{...ex('submenu')}
/>

<h3 id="keep-open">Keeping the menu open</h3>
<p>
	Call <code>preventDefault()</code> in <code>onselect</code> for items that toggle something the user
	may want to toggle again.
</p>
<Code code={keepOpen} label="Keeping the menu open code" />

<h2 id="props">Props</h2>
<h3 id="props-root">Dropdown.Root</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>open</code></td><td><code>boolean</code>, bindable</td><td><code>false</code></td
			></tr
		>
		<tr
			><td><code>trigger</code></td><td>Snippet receiving trigger props (required)</td><td></td></tr
		>
	</tbody>
</table>
<h3 id="props-item">Dropdown.Item</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>onselect</code></td><td><code>(e: MouseEvent) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>variant</code></td><td><code>'default' | 'danger'</code></td><td
				><code>'default'</code></td
			></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h3 id="props-sub">Dropdown.Sub</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>label</code></td><td><code>string</code>, the item that opens it</td><td
				>required</td
			></tr
		>
		<tr><td><code>start</code></td><td>Snippet before the label: an icon</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Follows the WAI-ARIA menu button pattern: <code>aria-haspopup</code>, <code>aria-expanded</code>
		and <code>aria-controls</code> on the trigger, <code>role="menu"</code> and
		<code>menuitem</code> inside.
	</li>
	<li>Opens in the top layer (Popover API), so no parent's overflow or z-index can clip it.</li>
	<li>Disabled items stay focusable so they're announced, but can't be chosen.</li>
	<li>Choosing an item or pressing <kbd>Escape</kbd> returns focus to the trigger.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd></td><td
				>On the trigger: opens and focuses the first item.</td
			></tr
		>
		<tr><td><kbd>↑</kbd></td><td>On the trigger: opens and focuses the last item.</td></tr>
		<tr><td><kbd>↓</kbd> / <kbd>↑</kbd></td><td>Next / previous item, wrapping around.</td></tr>
		<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>First / last item.</td></tr>
		<tr><td>A letter</td><td>Next item starting with that letter.</td></tr>
		<tr><td><kbd>→</kbd></td><td>On a submenu's item: opens it and focuses its first item.</td></tr>
		<tr
			><td><kbd>←</kbd> / <kbd>Escape</kbd></td><td>In a submenu: closes it, back to its item.</td
			></tr
		>
		<tr><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>Chooses the focused item.</td></tr>
		<tr
			><td><kbd>Escape</kbd> / <kbd>Tab</kbd></td><td>Closes and returns focus to the trigger.</td
			></tr
		>
	</tbody>
</table>
