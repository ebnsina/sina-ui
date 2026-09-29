<script lang="ts">
	import { defineChart } from '@tanstack/charts';
	import { pie, polar, radialArc } from '@tanstack/charts/polar';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const holdings = [
		{ subject: 'Medicine', count: 1240 },
		{ subject: 'Astronomy', count: 860 },
		{ subject: 'Mathematics', count: 720 },
		{ subject: 'Philosophy', count: 540 },
		{ subject: 'Geography', count: 310 }
	];
	const total = holdings.reduce((sum, h) => sum + h.count, 0);
	const subjects = holdings.map((h) => h.subject);

	const definition = defineChart({
		marks: [
			polar({
				inset: 8,
				radiusRatio: 0.9,
				marks: [
					radialArc(pie(holdings, { value: 'count' }), {
						innerRadius: ({ radius }) => radius * 0.62,
						cornerRadius: 4,
						padAngle: () => 0.012,
						color: 'subject',
						key: 'subject'
					})
				],
				scales: { angle: null, radius: null }
			})
		],
		scales: { x: null, y: null },
		color: { domain: subjects },
		tooltip
	});
</script>

{#snippet center()}
	<strong class="total">{new Intl.NumberFormat().format(total)}</strong>
	<span class="unit">manuscripts</span>
{/snippet}

<Chart
	{center}
	title="Holdings by subject"
	description="Medicine is a third of the collection."
	{definition}
/>

<style>
	.total {
		font-size: 1.5rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
</style>
