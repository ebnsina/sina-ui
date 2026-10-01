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
	<title>Phone input — Sina UI</title>
	<meta
		name="description"
		content="A phone number field for any country: pick or search a country, the number formats as you type, and it tells you plainly when it doesn't look right."
	/>
	<meta property="og:title" content="Phone input — Sina UI" />
	<meta
		property="og:description"
		content="A phone number field for any country: pick or search a country, the number formats as you type, and it tells you plainly when it doesn't look right."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Phone input</h1>
<p class="lede">
	A phone number field for any country. Pick or search a country, and the number formats as you
	type. Paste a full international number and the country follows. It says plainly when a number
	doesn't look right.
</p>

<h2 id="installation">Installation</h2>
<Install names="phone-input">
	<p>
		Copy <code>src/lib/ui/PhoneInput.svelte</code>, <code>phone.ts</code>,
		<code>floating.ts</code>, <code>glide.ts</code>, <code>scroll-edges.ts</code>,
		<code>announce.ts</code>, <code>Icon.svelte</code> and <code>tokens.css</code>, then install its
		phone number library:
	</p>
	<Code code="pnpm add libphonenumber-js" lang="shell" label="Install command" />
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Countries you choose first"
	description="preferred puts a few countries at the top of the list. Search by name, code (BD) or dialling code (+880)."
	stack
	{...ex('basic')}
/>
<Example
	id="form"
	title="In a form"
	description="With name, the form sends the full international number. Submitting an empty or wrong number stops the form and shows why."
	stack
	{...ex('form')}
/>
<Example
	id="error"
	title="Your own error"
	description="error replaces the built-in messages, for problems only your server knows about."
	stack
	{...ex('invalid')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td
				><code>string</code> (bindable): the number as <code>+8801712345678</code>, empty until
				valid</td
			><td><code>''</code></td></tr
		>
		<tr
			><td><code>valid</code></td><td><code>boolean</code> (bindable)</td><td><code>false</code></td
			></tr
		>
		<tr
			><td><code>country</code></td><td
				><code>string</code> (bindable): a country code like <code>'BD'</code></td
			><td>from the browser's language</td></tr
		>
		<tr
			><td><code>preferred</code></td><td><code>string[]</code>: listed first</td><td
				><code>[]</code></td
			></tr
		>
		<tr><td><code>name</code></td><td><code>string</code>: sent with forms</td><td></td></tr>
		<tr><td><code>required</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>placeholder</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>error</code></td><td><code>string</code>: replaces the built-in messages</td><td
			></td></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>↓</kbd> <kbd>↑</kbd> on the country</td><td>Open the country list</td></tr>
		<tr><td>Typing in the list</td><td>Search by name, code or dialling code</td></tr>
		<tr
			><td><kbd>↓</kbd> <kbd>↑</kbd> <kbd>Page Up</kbd> <kbd>Page Down</kbd></td><td
				>Move through countries</td
			></tr
		>
		<tr><td><kbd>Enter</kbd></td><td>Choose the country and go back to the number</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Close the list</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The country button is named with the country and its dialling code.</li>
	<li>The number field has its label; hints and errors are read out with it.</li>
	<li>Messages appear when you leave the field or submit, not while you're still typing.</li>
	<li>When a pasted number changes the country, the new country is announced.</li>
	<li>The number always reads left to right, including in right-to-left pages.</li>
</ul>
