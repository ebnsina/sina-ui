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
	<title>Input — Sina UI</title>
	<meta
		name="description"
		content="Text field with a built-in label, hint and error message, wired for screen readers."
	/>
	<meta property="og:title" content="Input — Sina UI" />
	<meta
		property="og:description"
		content="Text field with a built-in label, hint and error message, wired for screen readers."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Input</h1>
<p class="lede">A text field that always has a label, with optional hint and error text.</p>

<h2 id="installation">Installation</h2>
<Install names="input">
	<p>Copy <code>src/lib/ui/Input.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>

<Example id="basic" title="Basic" stack {...ex('basic')} />

<Example
	id="hint"
	title="With a hint"
	stack
	description="The hint is read out after the label, so instructions reach screen reader users too."
	{...ex('hint')}
/>

<Example
	id="error"
	title="With an error"
	stack
	description="An error marks the field invalid and is read out with it. Type a full address to clear it."
	{...ex('invalid')}
/>

<Example id="disabled" title="Disabled" stack {...ex('disabled')} />

<Example
	id="addons"
	title="With a prefix and suffix"
	stack
	description="Text or an icon inside the box, before or after what's typed."
	{...ex('addons')}
/>
<Example
	id="copy"
	title="With a button"
	stack
	description="A button inside the box: here, copying the link, with a tick to say it worked."
	{...ex('copy')}
/>

<h2 id="inline-edit">Inline edit</h2>
<p>
	Text that turns into a field where it stands: for titles, names and settings shown as a page
	rather than a form. Press it (or Enter) to edit; Enter or moving away saves, Escape puts it back.
</p>
<Install names="inline-edit">
	<p>
		Copy <code>src/lib/ui/InlineEdit.svelte</code>, with <code>Button.svelte</code>,
		<code>Icon.svelte</code>, <code>Spinner.svelte</code>, <code>announce.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>
<Example
	id="inline"
	title="A title"
	stack
	description="Hover to see the pencil. Clearing it and saving says a title is needed."
	{...ex('inline')}
/>
<Example
	id="inline-form"
	title="A profile, edited in place"
	stack
	description="Each field saves on its own. The email is checked before saving; the city fails once, to show the message and a second try."
	{...ex('inline-form')}
/>
<table>
	<thead><tr><th>Inline edit prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code> (bindable)</td><td><code>''</code></td
			></tr
		>
		<tr
			><td><code>placeholder</code></td><td><code>string</code>: shown when empty</td><td
				><code>'Empty'</code></td
			></tr
		>
		<tr><td><code>hideLabel</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr
			><td><code>type</code></td><td><code>'text' | 'email' | 'url'</code></td><td
				><code>'text'</code></td
			></tr
		>
		<tr><td><code>required</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>maxlength</code></td><td><code>number</code></td><td></td></tr>
		<tr
			><td><code>validate</code></td><td
				><code>(value) =&gt; string | undefined</code>: a message keeps it open</td
			><td></td></tr
		>
		<tr
			><td><code>onsave</code></td><td
				><code>(value) =&gt; Promise | void</code>: throw to keep it open with "Couldn’t save"</td
			><td></td></tr
		>
	</tbody>
</table>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string | number | null</code>, bindable</td><td
			></td></tr
		>
		<tr
			><td><code>start</code>, <code>end</code></td><td><code>Snippet</code>: inside the box</td><td
			></td></tr
		>
		<tr><td><code>hint</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td>…rest</td><td colspan="2">Any <code>&lt;input&gt;</code> attribute.</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		<code>label</code> is required and linked to the field: clicking it focuses the field, and screen
		readers announce it.
	</li>
	<li>
		<code>hint</code> and <code>error</code> are joined with <code>aria-describedby</code>; an error
		also sets <code>aria-invalid</code>.
	</li>
	<li>Text is at least 16px so iOS Safari doesn't zoom the page on focus.</li>
	<li>
		Inline edit is a button named with its label, its value and "edit"; after saving or canceling,
		focus returns to it and "Saved" is announced.
	</li>
	<li>Its error is joined to the field and read out; the field stays open until it's fixed.</li>
	<li>Save and Cancel are real buttons, reachable with Tab.</li>
</ul>
