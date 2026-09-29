<script lang="ts">
	import Slider from '#lib/ui/Slider.svelte';

	let days = $state(40);
</script>

<Slider
	label="Loan length"
	min={7}
	max={90}
	step={1}
	bind:value={days}
	format={(v) => `${v} days`}
	hint="Arrow keys move one day; Page Up and Page Down move faster."
/>
