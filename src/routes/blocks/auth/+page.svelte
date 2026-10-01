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
	<title>Auth — Sina UI</title>
	<meta
		name="description"
		content="Sign in, sign up, forgot and reset password, and a verification code: ready to wire to your own API."
	/>
	<meta property="og:title" content="Auth — Sina UI" />
	<meta
		property="og:description"
		content="Sign in, sign up, forgot and reset password, and a verification code: ready to wire to your own API."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Auth</h1>
<p class="lede">
	The screens every account needs: sign in, sign up, forgot and reset password, and a code check.
	Each takes your own async function, shows every state (checking, mistakes in the form, a refusal
	from your server, success) and works with password managers.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="sign-in"
	title="Sign in"
	description="The demo password is astrolabe; any other is refused, to show the message. The provider button and links are placeholders."
	{...ex('sign-in')}
/>
<Example
	id="sign-up"
	title="Sign up"
	description="The password shows its strength as you type. ibnsina@baytalhikma.org is taken, to show a refusal from the server under its field."
	{...ex('sign-up')}
/>
<Example
	id="forgot"
	title="Forgot password"
	description="Send the link, then it says where it went. Sending again waits out a short countdown."
	{...ex('forgot')}
/>
<Example
	id="reset"
	title="Reset password"
	description="Type the new password twice; they must match."
	{...ex('reset')}
/>
<Example
	id="verify"
	title="Verification code"
	description="The demo code is 314159. It checks itself once the last digit is in; a wrong code is cleared, ready to try again."
	{...ex('verify')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/auth">
	<p>
		Copy <code>src/lib/blocks/auth/</code>, with <code>Alert</code>, <code>Button</code>,
		<code>Checkbox</code>, <code>Icon</code>, <code>Input</code>, <code>OtpInput</code>,
		<code>PasswordInput</code>, <code>RollingNumber</code>, <code>Separator</code>,
		<code>form.svelte.ts</code>, <code>announce.ts</code> and <code>tokens.css</code>. No
		dependencies.
	</p>
</Install>

<h2 id="errors">Errors from your server</h2>
<p>
	Throw an <code>Error</code> with a <code>code</code> from any callback and the block shows it in
	plain words, under the field it's about when there is one. Unknown codes show “Something went
	wrong. Try again.”, never the raw error. The wording lives in <code>errors.ts</code>.
</p>
<table>
	<thead><tr><th>Code</th><th>Shown</th></tr></thead>
	<tbody>
		<tr><td><code>invalid_credentials</code></td><td>Above the form</td></tr>
		<tr><td><code>email_taken</code></td><td>Under the email</td></tr>
		<tr><td><code>weak_password</code></td><td>Under the password</td></tr>
		<tr><td><code>invalid_code</code>, <code>code_expired</code></td><td>Under the code</td></tr>
		<tr
			><td><code>link_expired</code>, <code>too_many_attempts</code></td><td>Above the form</td></tr
		>
	</tbody>
</table>

<h2 id="props">Props</h2>
<h3 id="props-sign-in">SignIn</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onsubmit</code></td><td
				><code>({'{ email, password, remember }'}) =&gt; Promise</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>providers</code></td><td><code>{'{ id, label, icon? }[]'}</code></td><td
				><code>[]</code></td
			></tr
		>
		<tr><td><code>onprovider</code></td><td><code>(id) =&gt; void</code></td><td></td></tr>
		<tr
			><td><code>forgotHref</code>, <code>signUpHref</code></td><td><code>string</code></td><td
			></td></tr
		>
		<tr
			><td><code>title</code>, <code>description</code></td><td><code>string</code></td><td
				><code>'Sign in'</code>, <code>'Welcome back.'</code></td
			></tr
		>
	</tbody>
</table>
<h3 id="props-sign-up">SignUp</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onsubmit</code></td><td
				><code>({'{ name, email, password }'}) =&gt; Promise</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>termsHref</code></td><td><code>string</code>: adds a terms box to tick</td><td
			></td></tr
		>
		<tr><td><code>minLength</code></td><td><code>number</code></td><td><code>10</code></td></tr>
		<tr
			><td><code>providers</code>, <code>onprovider</code>, <code>signInHref</code></td><td
				>as SignIn</td
			><td></td></tr
		>
	</tbody>
</table>
<h3 id="props-forgot">ForgotPassword</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onsubmit</code></td><td><code>(email) =&gt; Promise</code> (required)</td><td
			></td></tr
		>
		<tr
			><td><code>cooldown</code></td><td><code>number</code>: seconds before sending again</td><td
				><code>60</code></td
			></tr
		>
		<tr><td><code>signInHref</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<h3 id="props-reset">ResetPassword</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onsubmit</code></td><td><code>(password) =&gt; Promise</code> (required)</td><td
			></td></tr
		>
		<tr><td><code>minLength</code></td><td><code>number</code></td><td><code>10</code></td></tr>
		<tr><td><code>signInHref</code></td><td><code>string</code></td><td></td></tr>
	</tbody>
</table>
<h3 id="props-verify">VerifyCode</h3>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>onsubmit</code></td><td><code>(code) =&gt; Promise</code> (required)</td><td
			></td></tr
		>
		<tr><td><code>onresend</code></td><td><code>() =&gt; Promise</code></td><td></td></tr>
		<tr><td><code>sentTo</code></td><td><code>string</code>: where the code went</td><td></td></tr>
		<tr
			><td><code>length</code>, <code>cooldown</code></td><td><code>number</code></td><td
				><code>6</code>, <code>60</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Real forms with the right autocomplete on every field, so password managers fill them and SMS
		codes autofill.
	</li>
	<li>Mistakes are joined to their field and read out; the first one gets focus on submit.</li>
	<li>Refusals and success are announced; after a success, focus moves to the message.</li>
	<li>
		Forgot password never says whether an account exists, so the form can't be used to find out.
	</li>
	<li>The resend countdown is read as seconds, not a ticking clock.</li>
	<li>With reduced motion, the confirmations appear without rising in.</li>
</ul>
