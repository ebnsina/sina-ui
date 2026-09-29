<script lang="ts">
	import {
		getDayOfWeek,
		getLocalTimeZone,
		today,
		type CalendarDate
	} from '@internationalized/date';
	import type { DateRange } from '#lib/ui/Calendar.svelte';
	import DateRangePicker from '#lib/ui/DateRangePicker.svelte';

	// Closed on Fridays: a booking can't run across one.
	const closed = (d: CalendarDate) => getDayOfWeek(d, 'en-GB') === 4;
	let booking = $state<DateRange>();
</script>

<div class="stack">
	<DateRangePicker
		label="Reading room booking"
		bind:value={booking}
		isUnavailable={closed}
		min={today(getLocalTimeZone())}
		hint="The reading room is closed on Fridays."
		startName="from"
		endName="to"
	/>
</div>

<style>
	.stack {
		inline-size: min(100%, 22rem);
	}
</style>
