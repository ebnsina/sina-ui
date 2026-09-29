<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';

	let view = $state('both');
	const views = [
		{ value: 'arabic', label: 'Arabic' },
		{ value: 'latin', label: 'Latin' },
		{ value: 'both', label: 'Side by side' }
	];
</script>

<Segmented label="Text shown" options={views} bind:value={view} />
<p class="note">Showing: {views.find((v) => v.value === view)?.label}</p>

<style>
	.note {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
