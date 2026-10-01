<script lang="ts">
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
	<title>Rich text editor — Sina UI</title>
	<meta
		name="description"
		content="A rich text editor with a formatting toolbar, a menu over selected text, links, and HTML out."
	/>
	<meta property="og:title" content="Rich text editor — Sina UI" />
	<meta
		property="og:description"
		content="A rich text editor with a formatting toolbar, a menu over selected text, links, and HTML out."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Rich text editor</h1>
<p class="lede">
	Headings, lists, quotes, code and links, with a toolbar above and a small menu over whatever you
	select. Markdown shortcuts work as you type: <code>## </code> for a heading, <code>- </code> for a
	list, <code>&gt; </code> for a quote.
</p>

<h2 id="installation">Installation</h2>
<Install names="rich-text-editor">
	<p>
		Copy <code>src/lib/ui/RichTextEditor.svelte</code>, with <code>Toolbar.svelte</code>,
		<code>Tooltip.svelte</code>, <code>Button.svelte</code>, <code>Icon.svelte</code>,
		<code>floating.ts</code>, <code>scroll-edges.ts</code>, <code>announce.ts</code> and
		<code>tokens.css</code>, then install the editor engine:
	</p>
	<Code
		code="pnpm add @tiptap/core @tiptap/starter-kit @tiptap/pm @tiptap/extensions"
		lang="shell"
		label="Install command"
	/>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="notes"
	title="A catalog note"
	description="Select some words to format them from the menu that appears over them."
	{...ex('notes')}
/>
<Example
	id="limit"
	title="With a length limit"
	description="The count turns amber near the limit and red past it. The HTML is what you'd save."
	{...ex('limit')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>hideLabel</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>html</code></td><td><code>string</code> (bindable)</td><td><code>''</code></td></tr
		>
		<tr
			><td><code>placeholder</code></td><td><code>string</code></td><td
				><code>'Write something…'</code></td
			></tr
		>
		<tr
			><td><code>maxLength</code></td><td><code>number</code>: shows a character count</td><td
			></td></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<p>
	On Windows and Linux, use <kbd>Ctrl</kbd> for <kbd>⌘</kbd> and <kbd>Alt</kbd> for <kbd>⌥</kbd>.
</p>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>⌘</kbd> <kbd>B</kbd> / <kbd>I</kbd> / <kbd>E</kbd></td><td>Bold, italic, code</td
			></tr
		>
		<tr><td><kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>S</kbd></td><td>Strikethrough</td></tr>
		<tr
			><td><kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>2</kbd> / <kbd>3</kbd></td><td>Heading, subheading</td
			></tr
		>
		<tr
			><td><kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>8</kbd> / <kbd>7</kbd></td><td>Bulleted, numbered list</td
			></tr
		>
		<tr><td><kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>B</kbd></td><td>Quote</td></tr>
		<tr><td><kbd>⌘</kbd> <kbd>K</kbd></td><td>Add or edit a link</td></tr>
		<tr
			><td><kbd>⌘</kbd> <kbd>Z</kbd> / <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>Z</kbd></td><td>Undo, redo</td
			></tr
		>
		<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Move along the toolbar</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Close the link field</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The writing area is a multi-line text box named by the label.</li>
	<li>
		The toolbar is one Tab stop; arrow keys move between its buttons, and each says whether its
		style is on.
	</li>
	<li>Every button's shortcut is in its tooltip, shown on hover and keyboard focus.</li>
	<li>With a limit, the count is read with the text box.</li>
	<li>With reduced motion, the menu over a selection fades in without moving.</li>
</ul>
