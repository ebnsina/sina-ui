<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>Account settings — Sina UI</title>
	<meta
		name="description"
		content="Account settings: profile, preferences, notifications, security and devices, each saved on its own."
	/>
	<meta property="og:title" content="Account settings — Sina UI" />
	<meta
		property="og:description"
		content="Account settings: profile, preferences, notifications, security and devices, each saved on its own."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Account settings</h1>
<p class="lede">
	The settings page every product needs: profile, preferences, notifications, security and the
	account itself. Each section saves on its own, and only offers to once something has changed.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="account"
	title="A scholar’s account"
	description="Change anything and a bar slides up to save or discard it. The username ibn-sina is taken; the first notifications save fails, to show what happens. In Security, the current password is aleppo-1000 and the two-step code is 123456."
	{...ex('account')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/settings">
	<p>
		Copy <code>src/lib/blocks/settings/</code>, with <code>ActionButton</code>,
		<code>AlertDialog</code>,
		<code>Avatar</code>, <code>Badge</code>, <code>Button</code>, <code>CopyButton</code>,
		<code>Dialog</code>, <code>HoldToConfirm</code>, <code>Input</code>, <code>OtpInput</code>,
		<code>PasswordInput</code>, <code>PhoneInput</code>, <code>Segmented</code>,
		<code>Select</code>,
		<code>Spinner</code>, <code>Switch</code>, <code>Textarea</code>, <code>tabs/</code>,
		<code>toast/</code> and <code>tokens.css</code>.
	</p>
	<p>Phone input needs one package:</p>
	<Code code="pnpm add libphonenumber-js" lang="shell" label="Install command" />
</Install>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>profile</code></td><td
				><code>{'{ name, username, email, phone, bio, photo? }'}</code> (bindable)</td
			><td>required</td></tr
		>
		<tr
			><td><code>preferences</code></td><td
				><code>{"{ theme: 'system' | 'light' | 'dark', language, timeZone }"}</code> (bindable)</td
			><td>required</td></tr
		>
		<tr
			><td><code>notifications</code></td><td
				><code>{'{ channels: { [id]: { email, push } }, digest, pausedUntil? }'}</code> (bindable)</td
			><td>required</td></tr
		>
		<tr
			><td><code>categories</code></td><td><code>{'{ id, label, description? }[]'}</code></td><td
				>required</td
			></tr
		>
		<tr
			><td><code>sessions</code></td><td
				><code>{'{ id, device, location, lastActive, kind?, current? }[]'}</code> (bindable)</td
			><td><code>[]</code></td></tr
		>
		<tr
			><td><code>twoFactor</code>, <code>recoveryCodes</code></td><td
				><code>boolean</code>, <code>string[]</code> (bindable)</td
			><td><code>false</code>, <code>[]</code></td></tr
		>
		<tr
			><td><code>section</code></td><td
				><code>'profile' | 'preferences' | 'notifications' | 'security' | 'account'</code> (bindable)</td
			><td><code>'profile'</code></td></tr
		>
		<tr><td><code>languages</code></td><td><code>{'{ value, label }[]'}</code></td><td>six</td></tr>
		<tr
			><td><code>checkUsername</code></td><td
				><code>(username) =&gt; Promise&lt;boolean&gt;</code>: true when free</td
			><td></td></tr
		>
		<tr
			><td><code>onphoto</code></td><td
				><code>(file) =&gt; Promise&lt;string&gt;</code>: its address</td
			><td></td></tr
		>
		<tr
			><td
				><code>onsaveprofile</code>, <code>onsavepreferences</code>,
				<code>onsavenotifications</code></td
			><td><code>(data) =&gt; Promise&lt;void&gt;</code></td><td></td></tr
		>
		<tr
			><td><code>onchangepassword</code></td><td
				><code>(current, next) =&gt; Promise&lt;void&gt;</code></td
			><td></td></tr
		>
		<tr
			><td><code>onstarttwofactor</code></td><td
				><code>() =&gt; Promise&lt;{'{ secret }'}&gt;</code>: the key for the app</td
			><td></td></tr
		>
		<tr
			><td><code>onenabletwofactor</code></td><td
				><code>(code) =&gt; Promise&lt;string[]&gt;</code>: recovery codes</td
			><td></td></tr
		>
		<tr
			><td
				><code>ondisabletwofactor</code>, <code>onsignout</code>, <code>onsignoutothers</code>,
				<code>onexport</code>, <code>ondelete</code></td
			><td><code>() =&gt; Promise&lt;void&gt;</code> (<code>onsignout</code> gets the id)</td><td
			></td></tr
		>
	</tbody>
</table>
<p>
	Throw an <code>Error</code> with a <code>code</code> and people read a plain sentence:
	<code>network</code>, <code>username_taken</code>, <code>wrong_password</code>,
	<code>invalid_code</code>, <code>too_large</code>, <code>not_image</code>. Anything else reads
	“Something went wrong. Try again.” Saves are confirmed with a toast (mount
	<code>&lt;Toaster /&gt;</code> once in your layout).
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>←</kbd> <kbd>→</kbd> / <kbd>↑</kbd> <kbd>↓</kbd></td><td>Move between sections</td
			></tr
		>
		<tr><td><kbd>Tab</kbd></td><td>Into the section, then the save bar when it shows</td></tr>
		<tr><td>Hold <kbd>Space</kbd> or <kbd>Enter</kbd></td><td>Delete the account</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Sections are tabs: down the side when there’s room, scrolling across the top on phones.</li>
	<li>The save bar is a labeled region, skipped by Tab until something has changed.</li>
	<li>Field errors are read with their field; save errors are read as they appear.</li>
	<li>Turning two-step sign-in on or off always asks first: a setup dialog or a confirmation.</li>
	<li>Each sign-out button names the device and place it signs out.</li>
	<li>With reduced motion, the save bar and lists change without sliding.</li>
</ul>
