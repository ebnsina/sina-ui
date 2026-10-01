<script lang="ts">
	import Select from '#lib/ui/Select.svelte';

	let room = $state('');
	const error = $derived(room ? undefined : 'Choose where to read the manuscript.');
</script>

<Select label="Reading room" placeholder="Choose a room" bind:value={room} {error}>
	<option value="baghdad">Bayt al-Hikma, Baghdad</option>
	<option value="fez">Al-Qarawiyyin, Fez</option>
</Select>
