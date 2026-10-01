<script lang="ts">
	import Separator from '#lib/ui/Separator.svelte';
</script>

<div class="card">
	<div>
		<h3>Book of Optics</h3>
		<p>Ibn al-Haytham, Cairo, completed around 1021.</p>
	</div>
	<Separator />
	<p>Seven books on light, vision and the eye.</p>
</div>

<style>
	.card {
		display: grid;
		gap: 1rem;
		inline-size: min(100%, 24rem);
	}
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	p {
		margin: 0.25rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
