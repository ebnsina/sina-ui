<script lang="ts" module>
	export interface DashboardStat {
		label: string;
		value: number;
		/** Change on the previous period, as a fraction: 0.12 is up 12%. */
		change: number;
		/** Which way is good news; overdue loans going up isn't. */
		goodWhen?: 'up' | 'down';
		format?: Intl.NumberFormatOptions;
	}
	export interface DashboardData {
		stats: DashboardStat[];
		/** This period against the one before, point by point. */
		trend: { label: string; current: number; previous: number }[];
		subjects: { subject: string; count: number }[];
		rooms: { name: string; used: number; seats: number }[];
		loans: {
			id: string;
			title: string;
			reader: string;
			due: string;
			status: 'On time' | 'Due soon' | 'Overdue';
		}[];
	}
</script>

<script lang="ts">
	import {
		Analytics01Icon,
		ArrowDown01Icon,
		ArrowUp01Icon,
		Book02Icon,
		Download04Icon,
		Home01Icon,
		LibraryIcon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import { colorLegend, defineChart, lineY } from '@tanstack/charts';
	import { pie, polar, radialArc } from '@tanstack/charts/polar';
	import { scaleLinear } from '@tanstack/charts/scales/linear';
	import { scalePoint } from '@tanstack/charts/scales/point';
	import { tooltip } from '@tanstack/charts/tooltip';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Chart from '#lib/ui/Chart.svelte';
	import DataTable, { type Column } from '#lib/ui/DataTable.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Meter from '#lib/ui/Meter.svelte';
	import RollingNumber from '#lib/ui/RollingNumber.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';

	interface Props {
		data: DashboardData;
		/** The period shown; changing it is your cue to load that period's data. */
		range?: string;
		ranges?: { value: string; label: string }[];
		/** What the numbers are about ("Reading rooms"). */
		title?: string;
		onexport?: () => void;
		locale?: string;
	}

	let {
		data,
		range = $bindable('30d'),
		ranges = [
			{ value: '7d', label: '7 days' },
			{ value: '30d', label: '30 days' },
			{ value: '12m', label: '12 months' }
		],
		title = 'Overview',
		onexport,
		locale = 'en'
	}: Props = $props();

	const uid = $props.id();
	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Overview', href: '#overview', icon: Home01Icon },
				{ label: 'Loans', href: '#loans', icon: Book02Icon },
				{ label: 'Members', href: '#members', icon: UserGroupIcon }
			]
		},
		{
			title: 'Library',
			items: [
				{ label: 'Catalogue', href: '#catalogue', icon: LibraryIcon },
				{ label: 'Reports', href: '#reports', icon: Analytics01Icon }
			]
		}
	];

	const pct = $derived(
		new Intl.NumberFormat(locale, {
			style: 'percent',
			maximumFractionDigits: 1,
			signDisplay: 'exceptZero'
		})
	);
	const count = $derived(new Intl.NumberFormat(locale));
	// Good news in the accent, bad in red, whichever direction each number calls good.
	const toneOf = (s: DashboardStat) =>
		s.change === 0
			? undefined
			: s.change > 0 === ((s.goodWhen ?? 'up') === 'up')
				? 'accent'
				: 'danger';
	const rangeLabel = $derived(ranges.find((r) => r.value === range)?.label.toLowerCase() ?? '');

	const trendPoints = $derived(
		data.trend.flatMap((p) => [
			{ label: p.label, period: 'This period', loans: p.current },
			{ label: p.label, period: 'The one before', loans: p.previous }
		])
	);
	const trendChart = $derived(
		defineChart({
			marks: [lineY(trendPoints, { x: 'label', y: 'loans', z: 'period', strokeWidth: 2.5 })],
			scales: {
				x: { scale: () => scalePoint<string>().padding(0.2) },
				y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { count: 4 } } }
			},
			color: { domain: ['This period', 'The one before'], legend: colorLegend({ label: 'Loans' }) },
			tooltip
		})
	);
	const total = $derived(data.subjects.reduce((sum, s) => sum + s.count, 0));
	const subjectChart = $derived(
		defineChart({
			marks: [
				polar({
					inset: 8,
					radiusRatio: 0.92,
					marks: [
						radialArc(pie(data.subjects, { value: 'count' }), {
							innerRadius: ({ radius }) => radius * 0.64,
							cornerRadius: 4,
							padAngle: () => 0.014,
							color: 'subject',
							key: 'subject'
						})
					],
					scales: { angle: null, radius: null }
				})
			],
			scales: { x: null, y: null },
			color: { domain: data.subjects.map((s) => s.subject) },
			tooltip
		})
	);
	const top = $derived([...data.subjects].sort((a, b) => b.count - a.count)[0]);

	type Loan = DashboardData['loans'][number];
	const columns: Column<Loan>[] = [
		{ accessorKey: 'title', header: 'Work' },
		{ accessorKey: 'reader', header: 'Reader' },
		{ accessorKey: 'due', header: 'Due' },
		{ accessorKey: 'status', header: 'Status' }
	];
</script>

<div class="dashboard">
	<SidebarLayout label="Library" {groups} current="#overview">
		{#snippet header(collapsed)}
			<span class="brand">{collapsed ? 'B' : 'Bayt al-Ḥikma'}</span>
		{/snippet}

		<div class="page">
			<header class="top">
				<div>
					<h2>{title}</h2>
					<p class="sub">Loans, members and rooms over the last {rangeLabel}.</p>
				</div>
				<div class="actions">
					<Segmented label="Period" hideLabel options={ranges} bind:value={range} />
					{#if onexport}
						<Button variant="secondary" onclick={onexport}>
							<Icon icon={Download04Icon} size={16} /><span class="export">Export</span>
						</Button>
					{/if}
				</div>
			</header>

			<!-- Headline numbers: they roll to the new period's values. -->
			<ul class="stats" aria-label="Key numbers">
				{#each data.stats as s (s.label)}
					<li class="stat">
						<span class="label">{s.label}</span>
						<span class="value"
							><RollingNumber value={s.value} format={s.format} locales={locale} /></span
						>
						<span class="change">
							<!-- The arrow says which way it moved; the colour says whether that's good. -->
							<Badge
								tone={toneOf(s)}
								icon={s.change > 0 ? ArrowUp01Icon : s.change < 0 ? ArrowDown01Icon : false}
								>{pct.format(s.change)}</Badge
							>
							<span class="vs">on the {rangeLabel} before</span>
						</span>
					</li>
				{/each}
			</ul>

			<div class="charts">
				<section class="panel wide">
					<Chart
						title="Loans"
						description="Each point this period, against the same point in the one before."
						definition={trendChart}
						aspectRatio={2.2}
					/>
				</section>
				<section class="panel">
					<Chart
						title="By subject"
						description="{top?.subject} is borrowed most."
						definition={subjectChart}
						aspectRatio={1.3}
					>
						{#snippet center()}
							<strong class="total"><RollingNumber value={total} locales={locale} /></strong>
							<span class="unit">loans</span>
						{/snippet}
					</Chart>
				</section>
			</div>

			<div class="lower">
				<section class="panel" aria-labelledby="{uid}-rooms">
					<h3 id="{uid}-rooms">Reading rooms now</h3>
					<div class="rooms">
						{#each data.rooms as r (r.name)}
							<Meter
								label={r.name}
								value={r.used}
								max={r.seats}
								low={r.seats * 0.6}
								high={r.seats * 0.85}
								optimum={r.seats * 0.4}
								format={(v, _, max) => `${count.format(v)} of ${count.format(max)} seats`}
							/>
						{/each}
					</div>
				</section>
				<section class="panel wide">
					<DataTable
						caption="Recent loans"
						data={data.loans}
						{columns}
						searchLabel="Search loans"
						pageSize={5}
					/>
				</section>
			</div>
		</div>
	</SidebarLayout>
</div>

<style>
	/* A whole app screen in a box: a card on the docs page, the full window in yours. */
	.dashboard {
		/* Full width of wherever it's placed: the sidebar layout measures itself, so has no width of its own. */
		inline-size: 100%;
		block-size: 46rem;
		max-block-size: 90dvh;
		overflow: hidden;
		border-radius: 1.25rem;
		background: var(--ui-bg);
		box-shadow: var(--ui-shadow-card);
	}
	.brand {
		font-weight: 600;
	}
	.page {
		display: grid;
		gap: 1rem;
		/* Tighter on a phone: 3% of the layout's width, between 0.75 and 1.25rem. */
		padding: clamp(0.75rem, 3cqi, 1.25rem);
		container: page / inline-size;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: 0.75rem 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.25rem;
		letter-spacing: -0.01em;
	}
	.sub {
		margin: 0.125rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	/* Tiles and panels are cards on the page's background. */
	.stat,
	.panel {
		border-radius: 1rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.stat {
		display: grid;
		gap: 0.25rem;
		padding: 1rem;
	}
	.label {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
	}
	.value {
		font-size: 1.625rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}
	.change {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
	}
	.vs {
		color: var(--ui-muted);
	}
	.charts,
	.lower {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: 0.75rem;
	}
	.lower {
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
	}
	@container page (width < 44rem) {
		.charts,
		.lower {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	/* Phone: numbers two by two, the period switch across the width, Export as an icon (still named). */
	@container page (width < 36rem) {
		/* Export moves up beside the title; the period switch takes the whole next line. */
		.top {
			align-items: start;
			flex-wrap: wrap;
		}
		.top > div:first-child {
			flex: 1;
		}
		.actions {
			display: contents;
		}
		.actions :global(.segmented) {
			order: 1;
			flex: 1 0 100%;
		}
		.actions :global(.segmented .segment) {
			padding-inline: 0.5rem;
		}
		.actions :global(.segmented .track) {
			display: flex;
		}
		.actions :global(.segmented .segment) {
			flex: 1;
		}
		.export,
		.vs {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.5rem;
		}
		.stat {
			padding: 0.75rem;
		}
		.value {
			font-size: 1.25rem;
		}
	}
	.panel {
		min-inline-size: 0;
		padding: 1rem;
	}
	h3 {
		margin: 0 0 0.75rem;
		font-size: 0.9375rem;
	}
	.rooms {
		display: grid;
		gap: 1rem;
	}
	.total {
		font-size: 1.375rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
</style>
