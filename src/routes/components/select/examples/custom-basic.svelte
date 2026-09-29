<script lang="ts">
	import CustomSelect from '#lib/ui/CustomSelect.svelte';

	let city = $state('');
	const cities = [
		{ value: 'baghdad', label: 'Baghdad' },
		{ value: 'bukhara', label: 'Bukhara' },
		{ value: 'cairo', label: 'Cairo' },
		{ value: 'cordoba', label: 'Córdoba' },
		{ value: 'damascus', label: 'Damascus' },
		{ value: 'samarkand', label: 'Samarkand' }
	];
</script>

<CustomSelect
	label="City to visit"
	placeholder="Choose a city"
	options={cities}
	bind:value={city}
	name="city"
/>
