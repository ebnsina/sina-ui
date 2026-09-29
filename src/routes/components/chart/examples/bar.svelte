<script lang="ts">
	import { barY, defineChart } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const loans = [
		{ month: 'Jan', loans: 412 },
		{ month: 'Feb', loans: 486 },
		{ month: 'Mar', loans: 531 },
		{ month: 'Apr', loans: 468 },
		{ month: 'May', loans: 597 },
		{ month: 'Jun', loans: 642 }
	];

	const definition = defineChart({
		marks: [barY(loans, { x: 'month', y: 'loans', radius: 4 })],
		scales: {
			x: { scale: () => scaleBand<string>().padding(0.3), axis: { label: 'Month' } },
			y: {
				scale: scaleLinear,
				nice: true,
				grid: true,
				axis: { label: 'Loans', ticks: { count: 5 } }
			}
		},
		tooltip
	});
</script>

<Chart
	title="Loans per month"
	description="Loans dipped in April, then rose to their highest in June."
	{definition}
/>
