<script lang="ts">
	import { resolve } from '$app/paths';
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import CodeBlock from '#lib/ui/CodeBlock.svelte';
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
	<title>File explorer — Sina UI</title>
	<meta
		name="description"
		content="A file manager: open folders, choose several, move, sort, preview, upload, and undo from the Trash."
	/>
	<meta property="og:title" content="File explorer — Sina UI" />
	<meta
		property="og:description"
		content="A file manager: open folders, choose several, move, sort, preview, upload, and undo from the Trash."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>File explorer</h1>
<p class="lede">
	Browse, organise and upload files: open folders, choose several at once, drag them into place,
	sort, preview, and send things to the Trash with an undo.
</p>

<h2 id="installation">Installation</h2>
<Install names="blocks/file-explorer">
	<p>
		Copy <code>src/lib/blocks/file-explorer/</code> with the components it uses: Sidebar layout,
		File tree, Folder, Breadcrumb, Dropdown, Dialog, Alert dialog, Search field, Segmented, Meter,
		Empty state, Upload tray, Toast, Button, Input and Icon. Mount <code>&lt;Toaster /&gt;</code> once
		in your layout for the undo messages. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="library"
	title="A library's files"
	description="Double-click a folder to open it, or use the tree on the left. Shift- or ⌘-click to choose several, then move or delete them together. Deleted things go to the Trash, and every move and delete can be undone. Star tables › Book of Fixed Stars holds over a thousand files, drawn as you scroll. Drop files from your computer to watch them upload."
	{...ex('library')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>items</code></td><td><code>ExplorerItem[]</code> (bindable)</td><td>required</td
			></tr
		>
		<tr
			><td><code>onchange</code></td><td
				><code>(change) =&gt; Promise&lt;void&gt; | void</code>: save a change</td
			><td></td></tr
		>
		<tr
			><td><code>send</code></td><td
				><code>Send</code>: upload each file, with progress in a tray</td
			><td></td></tr
		>
		<tr
			><td><code>onopen</code></td><td><code>(item) =&gt; void</code>: a file was opened</td><td
			></td></tr
		>
		<tr><td><code>quota</code></td><td><code>number</code>, bytes</td><td>15 GB</td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>
<p>
	An item is <code
		>{'{ id, name, folder?, parent, kind?, size?, modified, color?, starred?, trashed?, thumbnail? }'}</code
	>.
	<code>parent</code> is the folder it's in (<code>null</code> at the top), <code>kind</code> is one
	of pdf, image, doc, sheet, audio, video, code or other, and <code>thumbnail</code> is an image URL for
	its preview.
</p>

<h3 id="saving">Saving changes</h3>
<p>
	Every change shows at once and is passed to <code>onchange</code>. If it rejects, the change is
	put back and people see a short message saying so.
</p>
<CodeBlock
	lang="ts"
	code={`type ExplorerChange =
  | { type: 'create'; item }
  | { type: 'move'; items; to }        // to: folder id, or null for Home
  | { type: 'rename'; item; name }
  | { type: 'star'; item; starred }
  | { type: 'trash'; items; trashed } // false when restored
  | { type: 'delete'; items };        // gone for good, with everything inside`}
/>
<p>
	With <code>send</code> (the same function <a href={resolve('/components/upload')}>Upload</a> takes),
	a file joins its folder once it has uploaded; without it, files are added straight away.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></td><td
				>Move between items, row by row.</td
			></tr
		>
		<tr><td><kbd>Shift</kbd> + arrows</td><td>Choose a run of items.</td></tr>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>First / last item.</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Open.</td></tr>
		<tr><td><kbd>Shift</kbd> <kbd>F10</kbd>, or the Menu key</td><td>The item's menu.</td></tr>
		<tr><td><kbd>⌘</kbd> <kbd>A</kbd></td><td>Choose everything here.</td></tr>
		<tr><td><kbd>⌘</kbd> <kbd>Space</kbd></td><td>Add or remove this item from the choice.</td></tr>
		<tr><td><kbd>F2</kbd></td><td>Rename.</td></tr>
		<tr><td><kbd>Delete</kbd></td><td>Move to the Trash (in the Trash: delete forever).</td></tr>
		<tr
			><td><kbd>⌘</kbd> <kbd>X</kbd>, then <kbd>⌘</kbd> <kbd>V</kbd></td><td
				>Move into the folder you're in.</td
			></tr
		>
		<tr><td><kbd>Escape</kbd></td><td>Clear the choice.</td></tr>
	</tbody>
</table>
<p>
	Use <kbd>Ctrl</kbd> for <kbd>⌘</kbd> on Windows and Linux. Right to left, <kbd>←</kbd> and
	<kbd>→</kbd> swap.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The items are one Tab stop; arrows move within them.</li>
	<li>
		Every item's ⋯ menu can rename, star, move and delete, and each has a checkbox to add it to the
		choice, so nothing needs dragging or a modifier key.
	</li>
	<li>
		Opening, moving, restoring and deleting are announced; sort buttons say which way they sort.
	</li>
	<li>Only deleting forever asks first; everything else can be undone.</li>
	<li>A folder can't be moved into itself or into anything inside it.</li>
</ul>
