<script lang="ts">
	import Textarea from '#lib/ui/Textarea.svelte';

	let summary = $state('');
	const error = $derived(
		summary.trim().length < 20
			? 'Write at least 20 characters so the librarian can file it.'
			: undefined
	);
</script>

<Textarea label="Summary of the work" rows={4} bind:value={summary} {error} />
