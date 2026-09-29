<script lang="ts">
	import { defineChart } from '@tanstack/charts';
	import { angleGrid, polar, radialArea, radialGrid, radialLine } from '@tanstack/charts/polar';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	// Share of each subject's shelf that is catalogued, 0 to 1.
	const catalogued = [
		{ subject: 'Medicine', share: 0.92 },
		{ subject: 'Astronomy', share: 0.78 },
		{ subject: 'Mathematics', share: 0.85 },
		{ subject: 'Philosophy', share: 0.6 },
		{ subject: 'Geography', share: 0.48 },
		{ subject: 'Poetry', share: 0.7 }
	];
	// Repeating the first point closes the shape.
	const closed = [...catalogued, catalogued[0]];

	const definition = defineChart({
		marks: [
			polar({
				radiusRatio: 0.72,
				scales: {
					angle: {
						scale: scalePoint<string>().domain(catalogued.map((c) => c.subject)),
						wrap: true
					},
					radius: { scale: scaleLinear().domain([0, 1]) }
				},
				guides: [
					radialGrid({ values: [0.25, 0.5, 0.75, 1], shape: 'polygon', strokeOpacity: 0.15 }),
					angleGrid({ labels: true, strokeOpacity: 0.15 })
				],
				marks: [
					radialArea(closed, {
						angle: 'subject',
						radius: 'share',
						fill: 'var(--ts-chart-1)',
						fillOpacity: 0.2
					}),
					radialLine(closed, {
						angle: 'subject',
						radius: 'share',
						stroke: 'var(--ts-chart-1)',
						strokeWidth: 2,
						points: true
					})
				]
			})
		],
		scales: { x: null, y: null },
		tooltip
	});
</script>

<Chart
	title="How much of each shelf is catalogued"
	description="Medicine and mathematics are nearly done; geography is under half."
	{definition}
/>
