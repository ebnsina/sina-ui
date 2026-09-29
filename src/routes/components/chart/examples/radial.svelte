<script lang="ts">
	import { defineChart } from '@tanstack/charts';
	import { polar, radialBarAngle } from '@tanstack/charts/polar';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const seats = [
		{ room: 'Baghdad', taken: 86 },
		{ room: 'Fez', taken: 71 },
		{ room: 'Córdoba', taken: 64 },
		{ room: 'Cairo', taken: 52 },
		{ room: 'Samarkand', taken: 39 }
	];
	const rooms = seats.map((s) => s.room);
	const bar = { radius: 'room', key: 'room', cornerRadius: 'full' } as const;

	const definition = defineChart({
		marks: [
			polar({
				radiusRatio: 0.9,
				scales: {
					angle: { scale: scaleLinear().domain([0, 100]) },
					radius: {
						scale: () => scaleBand<string>().domain(rooms).padding(0.28),
						range: [({ radius }) => radius * 0.28, ({ radius }) => radius]
					}
				},
				marks: [
					// A faint full ring behind each bar: the whole of the room.
					radialBarAngle(
						seats.map((s) => ({ ...s, taken: 100 })),
						{ ...bar, angle: 'taken', fill: 'var(--ui-subtle)' }
					),
					radialBarAngle(seats, { ...bar, angle: 'taken', color: 'room' })
				]
			})
		],
		scales: { x: null, y: null },
		color: { domain: rooms },
		tooltip
	});
</script>

<Chart
	title="Seats taken today (%)"
	description="Baghdad is fullest; Samarkand has the most room."
	{definition}
/>
