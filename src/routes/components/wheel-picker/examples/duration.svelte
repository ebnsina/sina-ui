<script lang="ts">
	import WheelPicker from '#lib/ui/WheelPicker.svelte';

	const range = (n: number) =>
		Array.from({ length: n }, (_, i) => ({ value: i, label: String(i) }));
	let hours = $state(0);
	let minutes = $state(25);
</script>

<div class="wheels">
	<WheelPicker label="Hours" items={range(24)} bind:value={hours} unit="hours" />
	<WheelPicker label="Minutes" items={range(60)} bind:value={minutes} unit="min" />
</div>

<style>
	.wheels {
		display: flex;
		gap: 0.5rem;
	}
</style>
