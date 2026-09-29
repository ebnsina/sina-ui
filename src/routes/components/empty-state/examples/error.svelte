<script lang="ts">
	import { CloudOffIcon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';

	let retrying = $state(false);
	function retry() {
		retrying = true;
		setTimeout(() => (retrying = false), 1200);
	}
</script>

<EmptyState icon={CloudOffIcon} title="The catalogue didn't load" level={3}>
	<p>Check your connection and try again. Nothing you saved has been lost.</p>
	{#snippet actions()}
		<Button variant="secondary" loading={retrying} onclick={retry}>Try again</Button>
	{/snippet}
</EmptyState>
