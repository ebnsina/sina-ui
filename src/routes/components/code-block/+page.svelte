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
	<title>Code block — Sina UI</title>
	<meta name="description" content="Highlighted code with line numbers, marked lines and copy." />
	<meta property="og:title" content="Code block — Sina UI" />
	<meta
		property="og:description"
		content="Highlighted code with line numbers, marked lines and copy."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Code block</h1>
<p class="lede">
	Shows code with its syntax colored, line numbers, lines you want noticed, and a copy button. It
	unrolls the first time it scrolls into view.
</p>

<h2 id="installation">Installation</h2>
<Install names="code-block">
	<p>
		Copy <code>src/lib/ui/CodeBlock.svelte</code>, <code>Icon.svelte</code>,
		<code>announce.ts</code>, <code>scroll-edges.ts</code> and <code>tokens.css</code>, then install
		TanStack Highlight:
	</p>
	<Code code="pnpm add -E @tanstack/highlight@0.1.0" lang="shell" label="Install command" />
	<p>It's before version 1, so the version is exact: a newer one may change its API.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="file"
	title="A file, with lines marked"
	description="highlight takes lines and ranges: “4-6”, or “3, 8-9”."
	{...ex('file')}
/>
<Example
	id="diff"
	title="A diff"
	description="Added lines in green, removed in red."
	{...ex('diff')}
/>
<Example
	id="command"
	title="A command"
	description="Without line numbers, for one-liners."
	{...ex('command')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>code</code></td><td><code>string</code></td><td>required</td></tr>
		<tr
			><td><code>lang</code></td><td
				>css, diff, go, html, js, json, python, shell, sql, svelte, ts, yaml</td
			><td><code>'ts'</code></td></tr
		>
		<tr><td><code>filename</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>highlight</code></td><td><code>string</code>: “3”, “3-5”, “3-5, 9”</td><td
			></td></tr
		>
		<tr><td><code>lineNumbers</code></td><td><code>boolean</code></td><td><code>true</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A region named after its file; it takes focus, so long lines can be scrolled from the keyboard.
	</li>
	<li>Line numbers aren't read or copied, only the code.</li>
	<li>Copying is announced; if the browser won't allow it, it says how to copy by hand.</li>
	<li>With reduced motion it appears without unrolling.</li>
</ul>
