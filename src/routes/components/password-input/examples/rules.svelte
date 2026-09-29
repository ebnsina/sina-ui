<script lang="ts">
	import PasswordInput from '#lib/ui/PasswordInput.svelte';

	const name = 'Maryam al-Ijliya';
	let password = $state('');
	let confirm = $state('');
	let confirmTouched = $state(false);

	const rules = [
		{ label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
		{
			label: 'An uppercase and a lowercase letter',
			test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v)
		},
		{ label: 'A number', test: (v: string) => /\d/.test(v) },
		{ label: 'A symbol, like ! or #', test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
		{
			label: 'Not your name',
			test: (v: string) =>
				!!v &&
				!name
					.toLowerCase()
					.split(/[\s-]+/)
					.some((part) => part.length > 2 && v.toLowerCase().includes(part))
		},
		{ label: 'No character 3 times in a row', test: (v: string) => !!v && !/(.)\1\1/.test(v) }
	];

	// Mismatch is shown once they've left the confirm field, then updates live.
	const mismatch = $derived(
		confirmTouched && confirm !== password ? "The passwords don't match." : undefined
	);
</script>

<div class="stack">
	<PasswordInput label="New password" bind:value={password} isNew {rules} />
	<PasswordInput
		label="Confirm password"
		bind:value={confirm}
		autocomplete="new-password"
		error={mismatch}
		onblur={() => (confirmTouched = true)}
	/>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
		inline-size: min(100%, 24rem);
	}
</style>
