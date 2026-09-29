<script lang="ts">
	import ToggleGroup from '#lib/ui/ToggleGroup.svelte';

	let columns = $state(['arabic', 'latin']);
</script>

<div class="stack">
	<ToggleGroup
		label="Columns to show"
		size="sm"
		bind:value={columns}
		items={[
			{ value: 'arabic', label: 'Arabic' },
			{ value: 'latin', label: 'Latin' },
			{ value: 'commentary', label: 'Commentary' },
			{ value: 'facsimile', label: 'Facsimile', disabled: true }
		]}
	/>
	<p>Showing: {columns.length ? columns.join(', ') : 'nothing'}</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
		justify-items: start;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
