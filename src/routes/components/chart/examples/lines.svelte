<script lang="ts">
	import { colorLegend, defineChart, lineY } from '@tanstack/charts';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
	const visits = [
		...[180, 210, 245, 230, 290, 320].map((v, i) => ({
			month: months[i],
			room: 'Baghdad',
			visits: v
		})),
		...[140, 150, 190, 220, 215, 260].map((v, i) => ({
			month: months[i],
			room: 'Córdoba',
			visits: v
		}))
	];

	const definition = defineChart({
		marks: [lineY(visits, { x: 'month', y: 'visits', z: 'room', strokeWidth: 2.5, points: true })],
		scales: {
			x: { scale: () => scalePoint<string>().padding(0.3), axis: { label: 'Month' } },
			y: {
				scale: scaleLinear,
				nice: true,
				grid: true,
				axis: { label: 'Visits', ticks: { count: 5 } }
			}
		},
		color: { legend: colorLegend({ label: 'Reading room' }) },
		tooltip
	});
</script>

<Chart title="Reading-room visits" description="Two rooms, six months." {definition} />
