<script lang="ts">
	import Combobox from '#lib/ui/Combobox.svelte';

	let city = $state('');
	const cities = [
		'Aleppo',
		'Baghdad',
		'Balkh',
		'Basra',
		'Bukhara',
		'Cairo',
		'Córdoba',
		'Damascus',
		'Fez',
		'Isfahan',
		'Kairouan',
		'Merv',
		'Nīshāpūr',
		'Palermo',
		'Rayy',
		'Samarkand',
		'Toledo'
	].map((label) => ({ value: label.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(), label }));
</script>

<Combobox
	label="City of study"
	placeholder="Search cities"
	options={cities}
	bind:value={city}
	name="city"
/>
