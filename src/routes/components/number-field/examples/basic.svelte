<script lang="ts">
	import NumberField from '#lib/ui/NumberField.svelte';

	let copies = $state(3);
</script>

<NumberField label="Copies to make" bind:value={copies} min={1} max={20} name="copies" />
