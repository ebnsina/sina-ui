<script lang="ts">
	import Select from '#lib/ui/Select.svelte';

	let city = $state('');
</script>

<Select label="Centre of learning" placeholder="Choose a city" bind:value={city}>
	<option value="baghdad">Baghdad</option>
	<option value="cordoba">Córdoba</option>
	<option value="cairo">Cairo</option>
	<option value="samarkand">Samarkand</option>
</Select>
