<script lang="ts">
	import Sortable from '#lib/ui/Sortable.svelte';

	// Whole tiles drag: on a phone, press and hold a tile, then move it.
	let folios = $state(
		['1r', '1v', '2r', '2v', '3r', '3v'].map((name, i) => ({ name, hue: 150 + i * 28 }))
	);
</script>

<Sortable
	bind:items={folios}
	key={(f) => f.name}
	itemLabel={(f) => `Folio ${f.name}`}
	label="Folios"
	layout="grid"
	class="folios"
>
	{#snippet children(folio, handle, { dragging })}
		<button
			type="button"
			class={['tile', dragging && 'dragging']}
			style:--hue={folio.hue}
			data-sortable-item
			{...handle}
		>
			<span>Folio {folio.name}</span>
		</button>
	{/snippet}
</Sortable>

<style>
	:global(.folios) {
		--sortable-columns: 3;
		inline-size: min(26rem, 100%);
	}
	.tile {
		display: grid;
		align-items: end;
		inline-size: 100%;
		aspect-ratio: 3 / 4;
		padding: 0.625rem;
		border: 0;
		border-radius: calc(var(--ui-radius) * 1.5);
		/* Parchment tinted per folio, so the order is easy to follow. */
		background: linear-gradient(160deg, oklch(0.93 0.04 var(--hue)), oklch(0.82 0.07 var(--hue)));
		color: oklch(0.3 0.05 var(--hue));
		font: 600 0.8125rem/1 var(--ui-font);
		text-align: start;
		user-select: none;
		-webkit-user-select: none;
	}
	.tile:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
