<script lang="ts">
	import Carousel from '#lib/ui/Carousel.svelte';

	const rooms = ['Baghdad', 'Cairo', 'Córdoba', 'Fez', 'Samarkand', 'Bukhara', 'Damascus'];
</script>

<div class="wrap">
	<Carousel label="Reading rooms" slides={rooms} perView={3} autoplay={4000}>
		{#snippet slide(room, i)}
			<div class="room">
				<span class="n">{String(i + 1).padStart(2, '0')}</span>
				{room}
			</div>
		{/snippet}
	</Carousel>
</div>

<style>
	.wrap {
		inline-size: 100%;
	}
	.room {
		display: grid;
		gap: 0.25rem;
		padding: 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		font-weight: 500;
	}
	.n {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}
</style>
