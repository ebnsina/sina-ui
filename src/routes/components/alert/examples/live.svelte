<script lang="ts">
	import Alert from '#lib/ui/Alert.svelte';
	import Button from '#lib/ui/Button.svelte';

	let result = $state<'saved' | 'failed' | undefined>();
</script>

<div class="row">
	<Button variant="secondary" onclick={() => (result = 'saved')}>Save the note</Button>
	<Button variant="secondary" onclick={() => (result = 'failed')}>Save offline</Button>
</div>
<!-- live: announced as it appears, because the person is waiting for this result. -->
{#if result === 'saved'}
	<Alert live tone="success" title="Note saved to the margin." />
{:else if result === 'failed'}
	<Alert live tone="danger" title="Couldn't save: the catalogue is unreachable." />
{/if}

<style>
	.row {
		display: flex;
		gap: 0.5rem;
	}
</style>
