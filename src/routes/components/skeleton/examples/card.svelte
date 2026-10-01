<script lang="ts">
	import { fade } from 'svelte/transition';
	import Button from '#lib/ui/Button.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';
	import { ms } from '#lib/ui/motion.js';

	let loading = $state(true);
</script>

<!-- The region says it's busy; the skeleton itself is hidden from screen readers. Both layers share
     one grid cell, so the content fades in where the placeholder was, without the card jumping. -->
<div class="card" aria-busy={loading} aria-live="polite">
	{#if loading}
		<div class="layer" out:fade={{ duration: ms(150) }}>
			<Skeleton width="3rem" circle />
			<div class="text">
				<Skeleton lines={1} width="45%" />
				<div class="small"><Skeleton lines={2} height="0.75rem" /></div>
			</div>
		</div>
	{:else}
		<div class="layer" in:fade={{ duration: ms(250), delay: ms(100) }}>
			<span class="avatar">IS</span>
			<div class="text">
				<strong>Ibn Sina</strong>
				<span>Physician and philosopher, Bukhara and Hamadan, 980–1037.</span>
			</div>
		</div>
	{/if}
</div>
<Button size="sm" variant="secondary" onclick={() => (loading = !loading)}>
	{loading ? 'Finish loading' : 'Load again'}
</Button>

<style>
	.card {
		display: grid;
		inline-size: min(22rem, 100%);
	}
	.layer {
		display: flex;
		grid-area: 1 / 1;
		gap: 1rem;
		align-items: flex-start;
	}
	.text {
		display: grid;
		flex: 1;
		gap: 0.5rem;
	}
	/* Placeholder lines take the line height of the text they stand in for. */
	.text span,
	.small {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.avatar {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 3rem;
		block-size: 3rem;
		border-radius: 50%;
		background: var(--ui-subtle);
		font-weight: 600;
	}
</style>
