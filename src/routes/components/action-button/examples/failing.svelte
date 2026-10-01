<script lang="ts">
	import ActionButton from '#lib/ui/ActionButton.svelte';

	// Fails the first time, works after: press it twice.
	let tries = 0;
	const save = () =>
		new Promise((resolve, reject) =>
			setTimeout(() => (++tries === 1 ? reject(new Error('Offline')) : resolve(null)), 1000)
		);
</script>

<ActionButton
	action={save}
	pending="Saving…"
	done="Saved"
	failed="Couldn’t save"
	variant="secondary">Save the translation</ActionButton
>
