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
	<title>Password input — Sina UI</title>
	<meta
		name="description"
		content="A password field with show and hide, a Caps Lock warning and a strength meter for new passwords."
	/>
	<meta property="og:title" content="Password input — Sina UI" />
	<meta
		property="og:description"
		content="A password field with show and hide, a Caps Lock warning and a strength meter for new passwords."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Password input</h1>
<p class="lede">Enters a password, with a way to check what was typed.</p>

<h2 id="installation">Installation</h2>
<Install names="password-input">
	<p>
		Copy <code>src/lib/ui/PasswordInput.svelte</code>, <code>Input.svelte</code>,
		<code>InputButton.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>. No other
		dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="sign-in"
	title="Signing in"
	stack
	description="The eye shows and hides the password without moving the cursor. Turn on Caps Lock while typing to see the warning."
	{...ex('sign-in')}
/>
<Example
	id="new"
	title="Choosing a new password"
	stack
	description="Password managers offer to suggest one, and a meter shows how strong it is."
	{...ex('new')}
/>

<Example
	id="rules"
	title="With requirements"
	stack
	description="Each requirement ticks off as it's met, including ones a simple pattern can't express, like not using your own name. The confirm field says when the two don't match."
	{...ex('rules')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr><td><code>isNew</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
		<tr><td><code>rules</code></td><td><code>{'{'} label, test(value) }[]</code></td><td></td></tr>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<p>
	Other input attributes (<code>name</code>, <code>required</code>, <code>minlength</code>) pass
	through.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The show button is a toggle: screen readers hear “Show password, toggle button, pressed” or not
		pressed.
	</li>
	<li>The Caps Lock warning and the strength are announced when they change.</li>
	<li>
		Requirements are part of the field's description, each read as met or not yet met; “All
		requirements met” is announced once they are.
	</li>
	<li>
		Autofill hints (<code>current-password</code> or <code>new-password</code>) let password
		managers fill or suggest.
	</li>
</ul>
