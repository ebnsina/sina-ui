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
	<title>Upload — Sina UI</title>
	<meta
		name="description"
		content="File uploads with progress, cancel and retry, inline or in a floating tray."
	/>
	<meta property="og:title" content="Upload — Sina UI" />
	<meta
		property="og:description"
		content="File uploads with progress, cancel and retry, inline or in a floating tray."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Upload</h1>
<p class="lede">Sends files and shows each one's progress, with cancel and retry.</p>

<h2 id="installation">Installation</h2>
<Install names="upload-list upload-tray">
	<p>
		Copy <code>src/lib/ui/uploads.svelte.ts</code>, <code>UploadList.svelte</code>,
		<code>UploadTray.svelte</code>, <code>RollingNumber.svelte</code>, <code>announce.ts</code>,
		<code>Icon.svelte</code> and <code>tokens.css</code>; <code>FileDrop.svelte</code> too for dragging
		files in. No other dependencies.
	</p>
	<p>
		<code>createUploads(send)</code> keeps the queue. For <code>send</code>, use
		<code>xhrSend('/your/upload/url')</code>, or your own function that reports progress and stops
		when its signal aborts. Throw an <code>UploadError</code> to show your own message; anything else
		shows a general one.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="inline"
	title="Inline"
	description="Each file uploads as soon as it's added. A failed upload can be tried again; one in progress can be canceled."
	{...ex('inline')}
/>
<Example
	id="tray"
	title="Floating tray"
	description="Stays in the bottom corner while people carry on with the page. Hide it to its heading, and close it once nothing is still uploading."
	{...ex('tray')}
/>
<Example
	id="avatar"
	title="Profile photo"
	description="One image, shown straight away while it uploads behind. Change or remove it after."
	{...ex('avatar')}
/>
<Example
	id="gallery"
	title="Gallery"
	description="Drop images on the gallery or add them; each tile fills a ring as it uploads. Drag tiles to put them in order."
	{...ex('gallery')}
/>
<Example
	id="attach"
	title="Attachments on a message"
	description="A compact button and a chip per file, with progress along its edge. Send waits until everything is up. Name a file “damaged” to see it fail."
	{...ex('attach')}
/>

<h2 id="props">API</h2>
<table>
	<thead><tr><th>createUploads(send) returns</th><th>What it does</th></tr></thead>
	<tbody>
		<tr
			><td><code>items</code></td><td
				>Each upload: <code>file</code>, <code>progress</code> (0–1), <code>status</code>,
				<code>error</code></td
			></tr
		>
		<tr><td><code>add(files)</code></td><td>Queues files; each starts at once</td></tr>
		<tr
			><td><code>cancel(id)</code>, <code>retry(id)</code>, <code>remove(id)</code></td><td
				>Per upload</td
			></tr
		>
		<tr><td><code>clear()</code></td><td>Removes every upload that isn't running</td></tr>
		<tr
			><td><code>active</code>, <code>progress</code></td><td
				>How many are running, and overall progress by size</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Each file has a progress bar named after it, and cancel, retry and remove buttons named after it
		too.
	</li>
	<li>
		The tray is a labeled region; screen readers hear when all uploads are done or some failed, not
		every percent.
	</li>
	<li>Hiding the tray keeps its heading and overall progress in view.</li>
</ul>
