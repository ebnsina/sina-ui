<script lang="ts">
	import AlertDialog from '#lib/ui/AlertDialog.svelte';
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	let open = $state(false);
	let attempts = 0;
	// Stands in for a request: the first try fails, so the error state can be seen; the second succeeds.
	const remove = () =>
		new Promise<void>((done, fail) =>
			setTimeout(() => {
				if (attempts++ % 2 === 0) fail(new Error("The library couldn't be reached. Try again."));
				else {
					done();
					toast.success('Manuscript deleted');
				}
			}, 900)
		);
</script>

<Button variant="danger" onclick={() => (open = true)}>Delete manuscript</Button>
<AlertDialog
	bind:open
	title="Delete this manuscript?"
	description="The Book of Optics and its 214 scanned pages will be removed for everyone. This can't be undone."
	confirmLabel="Delete"
	onconfirm={remove}
/>
