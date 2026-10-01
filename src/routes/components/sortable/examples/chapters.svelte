<script lang="ts">
	import Sortable from '#lib/ui/Sortable.svelte';

	let chapters = $state(['Light', 'Color', 'The eye', 'Reflection', 'Refraction']);
</script>

<Sortable
	bind:items={chapters}
	key={(c) => c}
	itemLabel={(c) => c}
	label="Chapter order"
	layout="row"
	class="chapters"
>
	{#snippet children(chapter, handle)}
		<button type="button" class="chip" data-sortable-item {...handle}>{chapter}</button>
	{/snippet}
</Sortable>

<style>
	:global(.chapters) {
		max-inline-size: 100%;
		padding-block: 0.25rem;
	}
	.chip {
		padding: 0.5rem 0.875rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: 500 0.875rem/1 var(--ui-font);
		white-space: nowrap;
		user-select: none;
		-webkit-user-select: none;
	}
	.chip:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
