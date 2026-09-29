<script lang="ts">
	import Folder from '#lib/ui/Folder.svelte';
</script>

<div class="row">
	<Folder name="Small" size="sm" />
	<Folder name="Medium" size="md" />
	<Folder name="Large" size="lg" count={7} />
</div>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: center;
		gap: 1rem;
	}
</style>
