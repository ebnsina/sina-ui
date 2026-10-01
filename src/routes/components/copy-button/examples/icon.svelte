<script lang="ts">
	import CopyButton from '#lib/ui/CopyButton.svelte';

	const reference = 'BH-MS-0873';
</script>

<div class="ref">
	Catalog reference <code>{reference}</code>
	<CopyButton value={reference} square variant="ghost" size="sm" />
</div>

<style>
	.ref {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
