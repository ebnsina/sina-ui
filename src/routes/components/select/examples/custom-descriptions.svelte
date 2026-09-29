<script lang="ts">
	import CustomSelect from '#lib/ui/CustomSelect.svelte';

	let script = $state('naskh');
	const scripts = [
		{ value: 'kufic', label: 'Kufic', description: 'Angular; early Qur’an manuscripts.' },
		{
			value: 'naskh',
			label: 'Naskh',
			description: 'Rounded and legible; the scribe’s everyday hand.'
		},
		{
			value: 'thuluth',
			label: 'Thuluth',
			description: 'Tall and sweeping; titles and inscriptions.'
		},
		{
			value: 'nastaliq',
			label: 'Nasta‘liq',
			description: 'Flowing; Persian poetry.',
			disabled: true
		}
	];
</script>

<CustomSelect
	label="Script"
	options={scripts}
	bind:value={script}
	hint="Nasta‘liq is being recut."
/>
