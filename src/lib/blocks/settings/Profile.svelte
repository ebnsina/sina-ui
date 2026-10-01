<script lang="ts">
	import { Camera01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { announce } from '#lib/ui/announce.js';
	import Avatar from '#lib/ui/Avatar.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Input from '#lib/ui/Input.svelte';
	import PhoneInput from '#lib/ui/PhoneInput.svelte';
	import Spinner from '#lib/ui/Spinner.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { messageOf } from './errors';
	import SaveBar from './SaveBar.svelte';
	import type { ProfileData } from './Settings.svelte';

	interface Props {
		profile: ProfileData;
		onsave?: (profile: ProfileData) => Promise<void> | void;
		/** Resolves true when the username is free. */
		checkUsername?: (username: string) => Promise<boolean>;
		/** Upload a new photo; resolves to its address. */
		onphoto?: (file: File) => Promise<string> | string;
	}
	let { profile = $bindable(), onsave, checkUsername, onphoto }: Props = $props();

	const BIO_MAX = 160;
	const copy = (p: ProfileData) => ({ ...p });
	let draft = $state(copy(profile));
	let saving = $state(false);
	let error = $state<string>();
	let photoError = $state<string>();
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let phoneValid = $state(true);

	const dirty = $derived(
		(Object.keys(draft) as (keyof ProfileData)[]).some((k) => draft[k] !== profile[k])
	);

	// Username: checked as you pause typing, the newest answer wins.
	let usernameStatus = $state<'idle' | 'checking' | 'free' | 'taken'>('idle');
	let checkSeq = 0;
	const usernameShape = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
	const usernameError = $derived(
		!draft.username
			? 'Choose a username.'
			: !usernameShape.test(draft.username)
				? 'Use 3–30 lowercase letters, numbers or hyphens.'
				: usernameStatus === 'taken'
					? 'That username is taken. Try another.'
					: undefined
	);
	$effect(() => {
		const u = draft.username;
		if (!checkUsername || u === profile.username || !usernameShape.test(u)) {
			usernameStatus = 'idle';
			return;
		}
		usernameStatus = 'checking';
		const seq = ++checkSeq;
		const t = setTimeout(async () => {
			try {
				const free = await checkUsername(u);
				if (seq === checkSeq) usernameStatus = free ? 'free' : 'taken';
			} catch {
				if (seq === checkSeq) usernameStatus = 'idle';
			}
		}, 400);
		return () => clearTimeout(t);
	});

	const nameError = $derived(draft.name.trim() ? undefined : 'Enter your name.');
	const emailError = $derived(
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
			? undefined
			: 'Enter an email like name@example.com.'
	);
	const emailChanged = $derived(draft.email !== profile.email && !emailError);
	const bioLeft = $derived(BIO_MAX - draft.bio.length);

	async function save() {
		error = undefined;
		if (nameError || emailError || usernameError || usernameStatus === 'checking' || !phoneValid) {
			error = 'Fix the highlighted fields first.';
			announce(error, 'assertive');
			return;
		}
		saving = true;
		try {
			const next = { ...draft, name: draft.name.trim() };
			await onsave?.(next);
			const newEmail = next.email !== profile.email ? next.email : undefined;
			profile = { ...next };
			draft = copy(profile);
			toast(newEmail ? `Saved. Check ${newEmail} to confirm the new address.` : 'Profile saved.');
		} catch (e) {
			error = messageOf(e);
		}
		saving = false;
	}

	async function pickPhoto(file: File | undefined) {
		photoError = undefined;
		if (!file) return;
		if (!file.type.startsWith('image/')) return (photoError = messageOf({ code: 'not_image' }));
		if (file.size > 2 * 1024 * 1024) return (photoError = messageOf({ code: 'too_large' }));
		uploading = true;
		try {
			const url = await (onphoto ? onphoto(file) : URL.createObjectURL(file));
			profile.photo = url;
			draft.photo = url;
			toast('Photo updated.');
		} catch (e) {
			photoError = messageOf(e);
		}
		uploading = false;
	}
</script>

<div class="photo">
	<Avatar name={draft.name || '?'} src={draft.photo} size="lg" />
	<div class="photo-actions">
		<Button variant="secondary" size="sm" loading={uploading} onclick={() => fileInput?.click()}>
			<Icon icon={Camera01Icon} size={16} /> Change photo
		</Button>
		{#if draft.photo}
			<Button
				variant="ghost"
				size="sm"
				onclick={() => {
					profile.photo = undefined;
					draft.photo = undefined;
					toast('Photo removed.');
				}}>Remove</Button
			>
		{/if}
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			hidden
			onchange={(e) => {
				pickPhoto(e.currentTarget.files?.[0]);
				e.currentTarget.value = '';
			}}
		/>
	</div>
	{#if photoError}<p class="error" role="alert">{photoError}</p>{/if}
</div>

<div class="fields">
	<Input label="Name" bind:value={draft.name} autocomplete="name" error={nameError} />
	<Input
		label="Username"
		bind:value={draft.username}
		autocomplete="username"
		autocapitalize="none"
		spellcheck="false"
		error={usernameError}
		hint={usernameStatus === 'free' ? 'Available.' : undefined}
	>
		{#snippet start()}@{/snippet}
		{#snippet end()}
			{#if usernameStatus === 'checking'}<Spinner size={16} label="Checking" />
			{:else if usernameStatus === 'free'}<span class="ok"
					><Icon icon={Tick02Icon} size={16} /></span
				>{/if}
		{/snippet}
	</Input>
	<Input
		label="Email"
		type="email"
		bind:value={draft.email}
		autocomplete="email"
		error={emailError}
		hint={emailChanged
			? 'We’ll send a link to the new address; it takes over once you confirm it.'
			: undefined}
	/>
	<PhoneInput
		label="Phone"
		bind:value={draft.phone}
		bind:valid={phoneValid}
		hint="Only used to sign in."
	/>
	<Textarea
		label="Bio"
		bind:value={draft.bio}
		maxlength={BIO_MAX}
		rows={3}
		hint="{bioLeft} {bioLeft === 1 ? 'character' : 'characters'} left"
	/>
</div>

<SaveBar
	{dirty}
	{saving}
	{error}
	onsave={save}
	ondiscard={() => {
		draft = copy(profile);
		error = undefined;
	}}
/>

<style>
	.photo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-block-end: 1.5rem;
	}
	.photo-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.photo .error {
		flex-basis: 100%;
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	.fields {
		display: grid;
		gap: 1.25rem;
		max-inline-size: 32rem;
	}
	.ok {
		display: grid;
		color: var(--ui-accent);
	}
</style>
