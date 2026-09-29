<script lang="ts">
	import { areaY, colorLegend, colorLegendItems, defineChart, stack } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
	const scripts = {
		Naskh: [64, 72, 80, 78, 91, 98],
		Thuluth: [22, 25, 24, 30, 33, 36],
		Kufic: [12, 10, 14, 13, 15, 18]
	};
	const copies = Object.entries(scripts).flatMap(([script, counts]) =>
		counts.map((count, i) => ({ month: months[i], script, count }))
	);

	const definition = defineChart({
		marks: [
			areaY(copies, {
				x: 'month',
				y: 'count',
				color: 'script',
				layout: stack({ order: Object.keys(scripts) }),
				fillOpacity: 0.75
			})
		],
		scales: {
			x: { scale: () => scalePoint<string>().padding(0.1), axis: { label: 'Month' } },
			y: {
				scale: scaleLinear,
				nice: true,
				grid: true,
				axis: { label: 'Copies', ticks: { count: 5 } }
			}
		},
		color: {
			domain: Object.keys(scripts),
			legend: colorLegend({
				label: 'Script',
				items: colorLegendItems({ justify: 'start', gap: 16 })
			})
		},
		tooltip
	});
</script>

<Chart
	title="Copies made, by script"
	description="Naskh makes up most copies, and all three scripts are up since January."
	{definition}
/>
