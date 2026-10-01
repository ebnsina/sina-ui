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
	<title>Form — Sina UI</title>
	<meta
		name="description"
		content="Forms with clear, well-timed error messages: a dependency-free version, and one on TanStack Form."
	/>
	<meta property="og:title" content="Form — Sina UI" />
	<meta
		property="og:description"
		content="Forms with clear, well-timed error messages: a dependency-free version, and one on TanStack Form."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Form</h1>
<p class="lede">
	Collects input and says clearly what needs fixing, at the right moment. Two versions: one with no
	dependencies, and one built on TanStack Form.
</p>

<h2 id="installation">Installation</h2>
<Install names="form" />

<h2 id="which">Which one?</h2>
<ul>
	<li>
		<strong>Simple</strong> for most forms. It uses the browser's own checks (<code>required</code>,
		<code>type="email"</code>, <code>min</code>, <code>pattern</code>) with your wording, and still
		validates if JavaScript hasn't loaded.
	</li>
	<li>
		<strong>TanStack Form</strong> when the form holds typed state: a schema shared with the server, fields
		that depend on each other, arrays of fields, or async checks.
	</li>
</ul>

<h2 id="behavior">How errors behave</h2>
<p>
	Both versions follow the same timing, so switching between them changes nothing for the person
	filling the form in:
</p>
<ul>
	<li>
		A field is checked when it's left after a change, never while typing and never when merely
		tabbed past.
	</li>
	<li>Once a field shows an error, the error disappears the moment it's fixed.</li>
	<li>
		Sending checks everything and moves focus to the first problem, where screen readers read the
		error with the field.
	</li>
	<li>
		Errors from your server appear on the right field. A failed request shows a plain message, never
		the raw error text.
	</li>
</ul>

<h2 id="simple">Simple</h2>
<p>
	Copy <code>src/lib/ui/form.svelte.ts</code>, plus the fields you use (<code>Input.svelte</code>,
	<code>Select.svelte</code>, <code>Checkbox.svelte</code>...). No dependencies.
</p>
<Example
	id="simple-example"
	title="Borrow a manuscript"
	description="Send it empty to see every error at once, and focus land on the first."
	{...ex('simple')}
/>
<p>
	<code>createForm</code> takes <code>messages</code> (your wording for each browser check, by field
	name), an optional <code>validate(data)</code> for checks the browser can't do, and
	<code>onsubmit(data)</code>, which may return errors by field name. Put <code>form</code> in that object
	for a message about the whole form.
</p>

<h2 id="tanstack">TanStack Form</h2>
<p>Install TanStack Form, and a schema library if you want one (here, Valibot):</p>
<Code code="pnpm add @tanstack/svelte-form valibot" lang="shell" label="Install command" />
<p>The same field components render every field.</p>
<Example
	id="tanstack-example"
	title="Borrow a manuscript, with TanStack Form"
	description="The same form, with a Valibot schema as the single source of rules."
	{...ex('tanstack')}
/>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Each error is tied to its field with <code>aria-describedby</code> and marks it
		<code>aria-invalid</code>, so it's read out when the field is focused.
	</li>
	<li>
		Invalid fields get a red outline and a red focus ring: the error is never shown by color alone,
		the message is always there too.
	</li>
	<li>
		The request's outcome is announced; the send button shows a spinner and ignores repeat presses
		while it waits.
	</li>
</ul>
