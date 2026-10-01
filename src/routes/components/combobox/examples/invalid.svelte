<script lang="ts">
	import Combobox from '#lib/ui/Combobox.svelte';

	let room = $state('');
	const rooms = [
		{ value: 'bayt', label: 'Bayt al-Ḥikma, Baghdad' },
		{ value: 'qarawiyyin', label: 'Al-Qarawiyyīn, Fez' },
		{ value: 'azhar', label: 'Al-Azhar, Cairo' }
	];
</script>

<Combobox
	label="Reading room"
	options={rooms}
	bind:value={room}
	error={room ? undefined : 'Choose where to collect the manuscript.'}
/>
