<script lang="ts">
	import Slider from '#lib/ui/Slider.svelte';

	let years = $state<[number, number]>([830, 1060]);
</script>

<div class="demo">
	<Slider
		label="Copied between"
		min={750}
		max={1258}
		step={1}
		bind:value={years}
		format={(v) => `${v} CE`}
		thumbLabels={['From year', 'To year']}
		hint="From the founding of Baghdad to its fall."
	/>
</div>

<style>
	.demo {
		inline-size: min(24rem, 100%);
	}
</style>
