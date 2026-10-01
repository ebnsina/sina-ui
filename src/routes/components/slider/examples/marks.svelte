<script lang="ts">
	import Slider from '#lib/ui/Slider.svelte';

	let lamp = $state(60);
</script>

<div class="demo">
	<Slider
		label="Reading lamp"
		bind:value={lamp}
		step={5}
		format={(v) => `${v}%`}
		marks={[
			{ value: 0, label: 'Off' },
			{ value: 25, label: '25%' },
			{ value: 50, label: '50%' },
			{ value: 75, label: '75%' },
			{ value: 100, label: 'Full' }
		]}
	/>
</div>

<style>
	.demo {
		inline-size: min(24rem, 100%);
	}
</style>
