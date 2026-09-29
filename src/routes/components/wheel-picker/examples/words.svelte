<script lang="ts">
	import WheelPicker from '#lib/ui/WheelPicker.svelte';

	const cities = ['Baghdad', 'Cairo', 'Córdoba', 'Damascus', 'Isfahan', 'Samarkand', 'Fez'].map(
		(c) => ({ value: c, label: c })
	);
	let city = $state('Córdoba');
</script>

<WheelPicker label="City" items={cities} bind:value={city} />
