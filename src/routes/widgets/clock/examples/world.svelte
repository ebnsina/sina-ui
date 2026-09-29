<script lang="ts">
	import Clock from '#lib/ui/Clock.svelte';
	import Widget from '#lib/ui/Widget.svelte';

	const cities = [
		{ label: 'Baghdad', timeZone: 'Asia/Baghdad' },
		{ label: 'Cairo', timeZone: 'Africa/Cairo' },
		{ label: 'Córdoba', timeZone: 'Europe/Madrid' },
		{ label: 'Samarkand', timeZone: 'Asia/Samarkand' }
	];
</script>

<Widget label="World clock">
	<div class="row">
		{#each cities as c (c.label)}
			<Clock {...c} size={96} />
		{/each}
	</div>
</Widget>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;
	}
</style>
