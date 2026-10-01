<script lang="ts">
	import { Download04Icon, LaptopIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons';
	import { announce } from '#lib/ui/announce.js';
	import AlertDialog from '#lib/ui/AlertDialog.svelte';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import CopyButton from '#lib/ui/CopyButton.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { pop, reflow } from '#lib/ui/motion.js';
	import OtpInput from '#lib/ui/OtpInput.svelte';
	import PasswordInput from '#lib/ui/PasswordInput.svelte';
	import Spinner from '#lib/ui/Spinner.svelte';
	import Switch from '#lib/ui/Switch.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { tick } from 'svelte';
	import { messageOf } from './errors';
	import type { Session } from './Settings.svelte';

	interface Props {
		twoFactor: boolean;
		recoveryCodes: string[];
		sessions: Session[];
		onchangepassword?: (current: string, next: string) => Promise<void> | void;
		/** Starts two-step setup; resolves to the key the person types into their app. */
		onstarttwofactor?: () => Promise<{ secret: string }> | { secret: string };
		/** Checks the first code; resolves to fresh recovery codes. */
		onenabletwofactor?: (code: string) => Promise<string[]> | string[];
		ondisabletwofactor?: () => Promise<void> | void;
		onsignout?: (id: string) => Promise<void> | void;
		onsignoutothers?: () => Promise<void> | void;
	}
	let {
		twoFactor = $bindable(),
		recoveryCodes = $bindable(),
		sessions = $bindable(),
		onchangepassword,
		onstarttwofactor,
		onenabletwofactor,
		ondisabletwofactor,
		onsignout,
		onsignoutothers
	}: Props = $props();

	// Password
	let current = $state('');
	let next = $state('');
	let confirm = $state('');
	let pwSaving = $state(false);
	let pwError = $state<{ field: 'current' | 'next' | 'confirm' | 'form'; text: string }>();
	const rules = [
		{ label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
		{ label: 'Not your current password', test: (v: string) => !!v && v !== current }
	];
	async function changePassword(e: SubmitEvent) {
		e.preventDefault();
		pwError = !current
			? { field: 'current', text: 'Enter your current password.' }
			: !rules.every((r) => r.test(next))
				? { field: 'next', text: 'Choose a password that meets the points below.' }
				: next !== confirm
					? { field: 'confirm', text: 'The two new passwords don’t match.' }
					: undefined;
		if (pwError) return;
		pwSaving = true;
		try {
			await onchangepassword?.(current, next);
			current = next = confirm = '';
			toast('Password changed. Other devices stay signed in until you sign them out below.');
		} catch (err) {
			const text = messageOf(err);
			pwError = {
				field: (err as { code?: string }).code === 'wrong_password' ? 'current' : 'form',
				text
			};
		}
		pwSaving = false;
	}
	const pwErr = (f: 'current' | 'next' | 'confirm') =>
		pwError?.field === f ? pwError.text : undefined;

	// Two-step sign-in
	let setupOpen = $state(false);
	let setupStep = $state<'loading' | 'code' | 'codes'>('loading');
	let secret = $state('');
	let code = $state('');
	let codeError = $state<string>();
	let verifying = $state(false);
	let turnOffOpen = $state(false);
	let codesOpen = $state(false);
	let setupBox = $state<HTMLDivElement>();

	async function startSetup() {
		setupOpen = true;
		setupStep = 'loading';
		code = '';
		codeError = undefined;
		try {
			secret = (await onstarttwofactor?.())?.secret ?? '';
			setupStep = 'code';
			// Ready to type the code straight away.
			await tick();
			setupBox?.querySelector('input')?.focus();
		} catch (e) {
			setupOpen = false;
			toast.error(messageOf(e));
		}
	}
	async function verify(value = code) {
		if (verifying || value.length < 6) return;
		verifying = true;
		codeError = undefined;
		try {
			recoveryCodes = (await onenabletwofactor?.(value)) ?? [];
			twoFactor = true;
			setupStep = 'codes';
			announce('Two-step sign-in is on.');
		} catch (e) {
			codeError = messageOf(e);
			code = '';
		}
		verifying = false;
		// Checking disables the field, which drops focus: put it back for the next try.
		if (setupStep === 'code') {
			await tick();
			setupBox?.querySelector('input')?.focus();
		}
	}
	async function turnOff() {
		try {
			await ondisabletwofactor?.();
			twoFactor = false;
			recoveryCodes = [];
			toast('Two-step sign-in is off.');
		} catch (e) {
			toast.error(messageOf(e));
		}
	}
	function download() {
		const blob = new Blob([`Recovery codes\n\n${recoveryCodes.join('\n')}\n`], {
			type: 'text/plain'
		});
		const a = Object.assign(document.createElement('a'), {
			href: URL.createObjectURL(blob),
			download: 'recovery-codes.txt'
		});
		a.click();
		URL.revokeObjectURL(a.href);
	}

	// Sessions
	let signingOut = $state<string>();
	const rel = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	function ago(when: Date | string) {
		const mins = Math.round((new Date(when).getTime() - Date.now()) / 60000);
		if (Math.abs(mins) < 1) return 'now';
		if (Math.abs(mins) < 60) return rel.format(mins, 'minute');
		if (Math.abs(mins) < 1440) return rel.format(Math.round(mins / 60), 'hour');
		return rel.format(Math.round(mins / 1440), 'day');
	}
	async function signOut(id: string | 'others') {
		signingOut = id;
		try {
			if (id === 'others') await onsignoutothers?.();
			else await onsignout?.(id);
			sessions = sessions.filter((s) => s.current || (id !== 'others' && s.id !== id));
			toast(id === 'others' ? 'Signed out everywhere else.' : 'Signed out of that device.');
		} catch (e) {
			toast.error(messageOf(e));
		}
		signingOut = undefined;
	}
	const others = $derived(sessions.filter((s) => !s.current));
</script>

<section class="part" aria-labelledby="pw-title">
	<h3 id="pw-title">Password</h3>
	<form class="fields" onsubmit={changePassword} novalidate>
		<PasswordInput label="Current password" bind:value={current} error={pwErr('current')} />
		<PasswordInput label="New password" bind:value={next} isNew {rules} error={pwErr('next')} />
		<PasswordInput
			label="Confirm new password"
			bind:value={confirm}
			isNew
			error={pwErr('confirm')}
		/>
		{#if pwError?.field === 'form'}<p class="error" role="alert">{pwError.text}</p>{/if}
		<div><Button type="submit" variant="secondary" loading={pwSaving}>Change password</Button></div>
	</form>
</section>

<section class="part" aria-labelledby="tf-title">
	<h3 id="tf-title">Two-step sign-in</h3>
	<div class="row">
		<div class="grow">
			<Switch
				checked={twoFactor}
				onclick={(e: MouseEvent) => {
					// The switch only asks; it follows twoFactor once setup finishes or turning off is confirmed.
					e.preventDefault();
					if (twoFactor) turnOffOpen = true;
					else startSetup();
				}}>Ask for a code from an authenticator app when I sign in</Switch
			>
		</div>
		{#if twoFactor}<Badge tone="accent">On</Badge>{/if}
	</div>
	{#if twoFactor}
		<div class="row">
			<p class="muted grow">Recovery codes get you in if you lose your phone. Each works once.</p>
			<Button variant="secondary" size="sm" onclick={() => (codesOpen = true)}
				>View recovery codes</Button
			>
		</div>
	{/if}
</section>

<section class="part" aria-labelledby="se-title">
	<h3 id="se-title">Where you’re signed in</h3>
	<ul class="sessions">
		{#each sessions as s (s.id)}
			<li animate:reflow out:pop>
				<span class="device" aria-hidden="true">
					<Icon icon={s.kind === 'phone' ? SmartPhone01Icon : LaptopIcon} size={20} />
				</span>
				<span class="grow">
					<strong>{s.device}</strong>
					<span class="muted">{s.location} · {s.current ? 'Active now' : ago(s.lastActive)}</span>
				</span>
				{#if s.current}
					<Badge icon={false}>This device</Badge>
				{:else}
					<Button
						variant="ghost"
						size="sm"
						loading={signingOut === s.id}
						aria-label="Sign out of {s.device}, {s.location}"
						onclick={() => signOut(s.id)}>Sign out</Button
					>
				{/if}
			</li>
		{/each}
	</ul>
	{#if others.length > 1}
		<Button
			variant="secondary"
			size="sm"
			loading={signingOut === 'others'}
			onclick={() => signOut('others')}
		>
			Sign out of all other devices
		</Button>
	{:else if !others.length}
		<p class="muted">You’re only signed in here.</p>
	{/if}
</section>

<Dialog
	bind:open={setupOpen}
	title={setupStep === 'codes' ? 'Save your recovery codes' : 'Turn on two-step sign-in'}
	description={setupStep === 'codes'
		? 'Keep these somewhere safe. Each gets you in once if you lose your phone.'
		: 'In your authenticator app, add an account with this key, then type the 6-digit code it shows.'}
>
	{#if setupStep === 'loading'}
		<div class="center"><Spinner label="Preparing" /></div>
	{:else if setupStep === 'code'}
		<div class="setup" bind:this={setupBox}>
			<div class="key">
				<code>{secret}</code>
				<CopyButton value={secret.replaceAll(' ', '')} variant="ghost" size="sm" square />
			</div>
			<OtpInput
				label="Code from the app"
				bind:value={code}
				error={codeError}
				disabled={verifying}
				oncomplete={(c) => verify(c)}
			/>
		</div>
	{:else}
		{@render codesList()}
	{/if}
	{#snippet footer()}
		{#if setupStep === 'code'}
			<Button variant="ghost" onclick={() => (setupOpen = false)}>Cancel</Button>
			<Button loading={verifying} onclick={() => verify()}>Turn on</Button>
		{:else if setupStep === 'codes'}
			<Button onclick={() => (setupOpen = false)}>I’ve saved them</Button>
		{/if}
	{/snippet}
</Dialog>

<Dialog
	bind:open={codesOpen}
	title="Recovery codes"
	description="Each gets you in once if you lose your phone."
>
	{@render codesList()}
	{#snippet footer()}<Button onclick={() => (codesOpen = false)}>Done</Button>{/snippet}
</Dialog>

{#snippet codesList()}
	<ol class="codes">
		{#each recoveryCodes as c (c)}<li><code>{c}</code></li>{/each}
	</ol>
	<div class="code-actions">
		<CopyButton value={recoveryCodes.join('\n')} variant="secondary" size="sm">Copy all</CopyButton>
		<Button variant="secondary" size="sm" onclick={download}>
			<Icon icon={Download04Icon} size={16} /> Download
		</Button>
	</div>
{/snippet}

<AlertDialog
	bind:open={turnOffOpen}
	title="Turn off two-step sign-in?"
	description="Signing in will need only your password, and your recovery codes will stop working."
	confirmLabel="Turn off"
	onconfirm={turnOff}
/>

<style>
	.part + .part {
		margin-block-start: 2rem;
	}
	h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
	}
	.fields {
		display: grid;
		gap: 1.25rem;
		max-inline-size: 32rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-block-end: 0.75rem;
	}
	.grow {
		display: grid;
		flex: 1;
		min-inline-size: 0;
	}
	.muted {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.error {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	.sessions {
		display: grid;
		gap: 0.25rem;
		max-inline-size: 36rem;
		margin: 0 0 0.75rem;
		padding: 0;
		list-style: none;
	}
	.sessions li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.sessions strong {
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.device {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: var(--ui-muted);
	}
	.center {
		display: grid;
		place-items: center;
		min-block-size: 8rem;
	}
	.setup {
		display: grid;
		gap: 1.25rem;
	}
	.key {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem 0.5rem 0.875rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.key code {
		flex: 1;
		font-size: 1rem;
		letter-spacing: 0.06em;
		word-break: break-all;
	}
	.codes {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin: 0;
		padding: 0.875rem 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		list-style: none;
	}
	.codes code,
	.key code {
		padding: 0;
		background: none;
	}
	.codes code {
		font-size: 0.9375rem;
		letter-spacing: 0.04em;
	}
	.code-actions {
		display: flex;
		gap: 0.5rem;
		margin-block-start: 0.75rem;
	}
</style>
