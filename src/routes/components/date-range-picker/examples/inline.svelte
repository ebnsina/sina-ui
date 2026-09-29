<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import Calendar, { type DateRange } from '#lib/ui/Calendar.svelte';

	const start = today(getLocalTimeZone()).add({ days: 3 });
	let voyage = $state<DateRange>({ start, end: start.add({ days: 12 }) });
	const fmt = new Intl.DateTimeFormat('en', { dateStyle: 'long' });
	const tz = getLocalTimeZone();
</script>

<div class="stack">
	<Calendar label="Voyage from Basra" mode="range" months={2} bind:range={voyage} />
	<p>{fmt.formatRange(voyage.start.toDate(tz), voyage.end.toDate(tz))}</p>
</div>

<style>
	.stack {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
