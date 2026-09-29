<script lang="ts">
	import { Camera01Icon } from '@hugeicons/core-free-icons';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Progress from '#lib/ui/Progress.svelte';
	import { pretendSend } from './pretend-send';

	const MAX = 5_000_000;
	let src = $state<string>();
	let progress = $state<number>();
	let error = $state('');
	let input: HTMLInputElement;

	async function choose(file: File | undefined) {
		if (!file) return;
		error = '';
		if (!file.type.startsWith('image/')) return (error = 'Choose a photo (JPEG, PNG or WebP).');
		if (file.size > MAX) return (error = 'That photo is over 5 MB; choose a smaller one.');
		// Shown at once from the file itself, while it uploads behind.
		if (src) URL.revokeObjectURL(src);
		src = URL.createObjectURL(file);
		progress = 0;
		try {
			await pretendSend(file, {
				onprogress: (p) => (progress = p),
				signal: new AbortController().signal
			});
			announce('Photo saved');
		} catch {
			error = "The photo didn't upload. Try again.";
		} finally {
			progress = undefined;
		}
	}
</script>

<div class="avatar-upload">
	<button
		type="button"
		class="photo"
		aria-label={src ? 'Change photo' : 'Add a photo'}
		onclick={() => input.click()}
	>
		{#if src}<img {src} alt="" />{:else}<span class="initials">IS</span>{/if}
		<span class="overlay" aria-hidden="true"><Icon icon={Camera01Icon} size={22} /></span>
	</button>
	<div class="side">
		<p class="name">Ibn Sina</p>
		{#if progress !== undefined}
			<Progress label="Uploading photo" value={progress} />
		{:else}
			<div class="actions">
				<Button variant="secondary" size="sm" onclick={() => input.click()}>
					{src ? 'Change photo' : 'Add a photo'}
				</Button>
				{#if src}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => {
							URL.revokeObjectURL(src!);
							src = undefined;
							announce('Photo removed');
						}}>Remove</Button
					>
				{/if}
			</div>
		{/if}
		{#if error}<p class="error" role="alert">{error}</p>{:else}<p class="hint">
				JPEG, PNG or WebP, up to 5 MB.
			</p>{/if}
	</div>
	<input
		bind:this={input}
		type="file"
		accept="image/*"
		hidden
		onchange={(e) => {
			choose(e.currentTarget.files?.[0]);
			e.currentTarget.value = '';
		}}
	/>
</div>

<style>
	.avatar-upload {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.photo {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 5.5rem;
		block-size: 5.5rem;
		padding: 0;
		overflow: hidden;
		border: 0;
		border-radius: 50%;
		background: color-mix(in srgb, var(--ui-accent) 16%, var(--ui-surface));
		color: var(--ui-accent);
		cursor: pointer;
	}
	.photo img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		animation: in 300ms var(--ui-ease-out);
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: scale(1.06);
		}
	}
	.initials {
		font: 600 1.5rem/1 var(--ui-font);
	}
	/* Pointing at the photo shows it can be changed. */
	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgb(0 0 0 / 0.45);
		color: #fff;
		opacity: 0;
		transition: opacity var(--ui-dur) ease;
	}
	.photo:hover .overlay,
	.photo:focus-visible .overlay {
		opacity: 1;
	}
	.photo:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.side {
		display: grid;
		gap: 0.5rem;
		min-inline-size: 12rem;
	}
	.name {
		margin: 0;
		font-weight: 600;
	}
	.actions {
		display: flex;
		gap: 0.25rem;
	}
	.hint,
	.error {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.error {
		color: var(--ui-danger);
	}
</style>
