<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Meter from '#lib/ui/Meter.svelte';

	let parts = $state([
		{ label: 'Manuscripts', value: 4.2 },
		{ label: 'Scans', value: 5.1 },
		{ label: 'Backups', value: 3.1 }
	]);
	const used = $derived(parts.reduce((sum, p) => sum + p.value, 0));
	const gb = new Intl.NumberFormat('en', {
		style: 'unit',
		unit: 'gigabyte',
		maximumFractionDigits: 1
	});
</script>

<Meter
	label="Library storage"
	value={used}
	max={15}
	high={13}
	optimum={0}
	segments={parts}
	formatSegment={(v) => gb.format(v)}
	format={(v, _, max) => `${gb.format(v)} of ${gb.format(max)}`}
/>
<Button
	size="sm"
	variant="secondary"
	onclick={() => (parts[1].value = parts[1].value >= 7 ? 5.1 : parts[1].value + 1.2)}
	>{parts[1].value >= 7 ? 'Clear old scans' : 'Add scans'}</Button
>
