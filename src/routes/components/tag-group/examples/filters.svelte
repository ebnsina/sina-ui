<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import TagGroup from '#lib/ui/TagGroup.svelte';

	const all = [
		{ id: 'optics', label: 'Optics' },
		{ id: 'baghdad', label: 'Baghdad' },
		{ id: 'c9', label: '9th century' },
		{ id: 'arabic', label: 'In Arabic' },
		{ id: 'scans', label: 'Has scans' }
	];
	let filters = $state([...all]);
</script>

<div class="filters">
	<TagGroup
		label="Filters"
		tags={filters}
		onremove={(t) => (filters = filters.filter((f) => f.id !== t.id))}
		empty="No filters: showing everything."
	/>
	<div class="row">
		<Button variant="ghost" size="sm" disabled={!filters.length} onclick={() => (filters = [])}
			>Clear all</Button
		>
		<Button
			variant="ghost"
			size="sm"
			disabled={filters.length === all.length}
			onclick={() => (filters = [...all])}
		>
			Reset
		</Button>
	</div>
</div>

<style>
	.filters {
		display: grid;
		gap: 0.75rem;
		max-inline-size: min(26rem, 100%);
	}
	/* Centred in the example, lines of tags included. */
	.filters :global(.tags),
	.row {
		justify-content: center;
	}
	.row {
		display: flex;
		gap: 0.25rem;
	}
</style>
