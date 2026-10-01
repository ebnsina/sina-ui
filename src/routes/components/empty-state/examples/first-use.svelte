<script lang="ts">
	import { Books01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';
</script>

<EmptyState icon={Books01Icon} title="Your reading list is empty" level={3}>
	<p>Save manuscripts from the catalog to read them later, even offline.</p>
	{#snippet actions()}
		<Button variant="secondary">Import a list</Button>
		<Button href="#first-use">Browse the catalog</Button>
	{/snippet}
</EmptyState>
