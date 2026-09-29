<script lang="ts">
	import Orb from '#lib/ui/Orb.svelte';
</script>

<div class="sizes">
	{#each ['sm', 'md', 'lg', 'xl'] as const as size (size)}
		<figure>
			<Orb {size} mode="speaking" level={0.4} label="Assistant, {size}" />
			<figcaption>{size}</figcaption>
		</figure>
	{/each}
</div>

<style>
	.sizes {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: center;
		gap: 2rem;
	}
	figure {
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		margin: 0;
	}
	figcaption {
		color: var(--ui-muted);
		font: 0.8125rem/1 var(--ui-font-mono);
	}
</style>
