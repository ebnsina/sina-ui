<script lang="ts">
	import { endOfMonth, getLocalTimeZone, startOfMonth, today } from '@internationalized/date';
	import type { DateRange } from '#lib/ui/Calendar.svelte';
	import DateRangePicker from '#lib/ui/DateRangePicker.svelte';

	const now = today(getLocalTimeZone());
	const next = startOfMonth(now).add({ months: 1 });
	const presets = [
		{ label: 'Next 7 days', start: now, end: now.add({ days: 6 }) },
		{ label: 'Next 30 days', start: now, end: now.add({ days: 29 }) },
		{ label: 'Rest of this month', start: now, end: endOfMonth(now) },
		{ label: 'Next month', start: next, end: endOfMonth(next) }
	];
	let leave = $state<DateRange>();
	const nights = $derived(leave && leave.end.compare(leave.start));
</script>

<div class="stack">
	<DateRangePicker label="Study leave" bind:value={leave} {presets} min={now} />
	<p>
		{#if leave}{new Intl.PluralRules('en').select(nights!) === 'one'
				? '1 night'
				: `${nights} nights`} away from the House of Wisdom.{:else}No dates chosen yet.{/if}
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 22rem);
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
