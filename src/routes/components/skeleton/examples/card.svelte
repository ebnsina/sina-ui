<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';

	let loading = $state(true);
</script>

<!-- The region says it's busy; the skeleton itself is hidden from screen readers. -->
<div class="card" aria-busy={loading} aria-live="polite">
	{#if loading}
		<Skeleton width="3rem" circle />
		<div class="lines">
			<Skeleton width="60%" />
			<Skeleton width="90%" height="0.75rem" />
			<Skeleton width="75%" height="0.75rem" />
		</div>
	{:else}
		<span class="avatar">IS</span>
		<div class="lines">
			<strong>Ibn Sina</strong>
			<span>Physician and philosopher, Bukhara and Hamadan, 980–1037.</span>
		</div>
	{/if}
</div>
<Button size="sm" variant="secondary" onclick={() => (loading = !loading)}>
	{loading ? 'Finish loading' : 'Load again'}
</Button>

<style>
	.card {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		inline-size: min(22rem, 100%);
	}
	.lines {
		display: grid;
		flex: 1;
		gap: 0.5rem;
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
