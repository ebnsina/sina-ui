<script lang="ts">
	import NumberField from '#lib/ui/NumberField.svelte';

	let discount = $state(0.1);
</script>

<!-- Typing "15" means 15%; the value is 0.15. -->
<NumberField
	label="Scholar's discount"
	bind:value={discount}
	min={0}
	max={0.5}
	step={0.05}
	format={{ style: 'percent' }}
	hint="Up to 50% for students of the House of Wisdom."
/>
