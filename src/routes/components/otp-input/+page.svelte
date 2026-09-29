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
	<title>OTP input — Sina UI</title>
	<meta
		name="description"
		content="One-time code boxes with paste, phone autofill and a single accessible field."
	/>
	<meta property="og:title" content="OTP input — Sina UI" />
	<meta
		property="og:description"
		content="One-time code boxes with paste, phone autofill and a single accessible field."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>OTP input</h1>
<p class="lede">Enters a one-time code, like the one sent to a phone to confirm a sign-in.</p>

<h2 id="installation">Installation</h2>
<Install names="otp-input">
	<p>Copy <code>src/lib/ui/OtpInput.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="verify"
	title="Verification code"
	stack
	description="Paste the whole code, or let the phone fill it in from the message. A wrong code shakes the boxes and clears them."
	{...ex('verify')}
/>
<Example
	id="text"
	title="Letters and digits"
	stack
	description="Typed in any case, shown in capitals."
	{...ex('text')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>string</code>, bindable</td><td><code>''</code></td></tr
		>
		<tr><td><code>length</code></td><td><code>number</code></td><td><code>6</code></td></tr>
		<tr
			><td><code>groups</code></td><td><code>number[]</code>, e.g. <code>[3, 3]</code></td><td
			></td></tr
		>
		<tr
			><td><code>mode</code></td><td><code>'numeric' | 'text'</code></td><td
				><code>'numeric'</code></td
			></tr
		>
		<tr><td><code>oncomplete</code></td><td><code>(code) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>name</code>, <code>hint</code>, <code>error</code></td><td><code>string</code></td
			><td></td></tr
		>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		One real text field under the boxes: screen readers hear a single field with its label, not six.
	</li>
	<li>
		It asks for <code>one-time-code</code> autofill, so phones offer the code from the message.
	</li>
	<li>Numeric codes show the number keypad on phones.</li>
</ul>
