<script lang="ts">
	import Meter from '#lib/ui/Meter.svelte';

	const litres = new Intl.NumberFormat('en', {
		style: 'unit',
		unit: 'liter',
		maximumFractionDigits: 1
	});
</script>

<Meter
	label="Ink in the copyists’ room"
	value={3.5}
	max={20}
	low={5}
	high={12}
	optimum={20}
	format={(v, _, max) => `${litres.format(v)} of ${litres.format(max)}`}
/>
