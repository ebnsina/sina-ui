<script lang="ts">
	import NumberField from '#lib/ui/NumberField.svelte';

	let ink = $state(2.5);
</script>

<NumberField
	label="Ink per page"
	bind:value={ink}
	min={0.5}
	max={10}
	step={0.5}
	format={{ style: 'unit', unit: 'milliliter', maximumFractionDigits: 1 }}
/>
