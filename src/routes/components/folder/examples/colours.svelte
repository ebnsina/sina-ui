<script lang="ts">
	import Folder from '#lib/ui/Folder.svelte';

	const folders = [
		{ name: 'Manuscripts', count: 214, color: 'var(--ui-accent)' },
		{ name: 'Star tables', count: 38, color: '#3b82f6' },
		{ name: 'Translations', count: 91, color: '#f59e0b' },
		{ name: 'Letters', count: 12, color: '#f43f5e' },
		{ name: 'Archive', count: 0, color: '#64748b' }
	];
</script>

<div class="row">
	{#each folders as f (f.name)}
		<Folder {...f} />
	{/each}
</div>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}
</style>
