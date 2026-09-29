<script lang="ts">
	import { barY, defineChart } from '@tanstack/charts';
	import { scaleBand } from '@tanstack/charts/scales/band';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Chart from '#lib/ui/Chart.svelte';

	const returns = [
		{ day: 'Sat', onTime: 48, late: 6 },
		{ day: 'Sun', onTime: 52, late: 9 },
		{ day: 'Mon', onTime: 61, late: 4 },
		{ day: 'Tue', onTime: 57, late: 7 },
		{ day: 'Wed', onTime: 63, late: 5 },
		{ day: 'Thu', onTime: 44, late: 11 }
	];
	const nf = new Intl.NumberFormat();

	const definition = defineChart({
		marks: [barY(returns, { x: 'day', y: 'onTime', radius: 4 })],
		scales: {
			x: { scale: () => scaleBand<string>().padding(0.3), axis: { label: 'Day' } },
			y: {
				scale: scaleLinear,
				nice: true,
				grid: true,
				axis: { label: 'Returned on time', ticks: { count: 4 } }
			}
		},
		tooltip
	});
</script>

{#snippet tooltipBody({ points }: { points: readonly { datum: unknown }[] })}
	{@const row = points[0]?.datum as (typeof returns)[number] | undefined}
	{#if row}
		<div class="tip">
			<strong>{row.day}</strong>
			<span><i class="swatch on"></i>On time <b>{nf.format(row.onTime)}</b></span>
			<span><i class="swatch late"></i>Late <b>{nf.format(row.late)}</b></span>
		</div>
	{/if}
{/snippet}

<Chart
	title="Returns this week"
	description="Thursday had the most late returns."
	{definition}
	{tooltipBody}
/>

<style>
	.tip {
		display: grid;
		gap: 0.25rem;
		min-inline-size: 9rem;
	}
	.tip span {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--ui-muted);
	}
	.tip b {
		margin-inline-start: auto;
		color: var(--ui-fg);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.swatch {
		inline-size: 0.625rem;
		block-size: 0.625rem;
		border-radius: 2px;
	}
	.on {
		background: var(--ts-chart-1);
	}
	.late {
		background: var(--ts-chart-2);
	}
</style>
