<script lang="ts">
	import Alert from '#lib/ui/Alert.svelte';
	import Button from '#lib/ui/Button.svelte';

	let shown = $state(true);
</script>

{#if shown}
	<Alert tone="warning" title="Loan due in 3 days" ondismiss={() => (shown = false)}>
		Renew it now to keep reading, or return it to the Baghdad desk.
		{#snippet actions()}
			<Button size="sm" variant="ghost">Return it</Button>
			<Button size="sm">Renew for 40 days</Button>
		{/snippet}
	</Alert>
{:else}
	<Button variant="secondary" onclick={() => (shown = true)}>Show the alert again</Button>
{/if}
