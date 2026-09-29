<script lang="ts">
	import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import Calendar from '#lib/ui/Calendar.svelte';

	let visit = $state<CalendarDate>(today(getLocalTimeZone()).add({ days: 3 }));
	// Fully booked: every seventh day from today.
	const booked = (d: CalendarDate) => d.day % 7 === 0;
</script>

<div class="booking">
	<Calendar label="Reading room visit" bind:value={visit} isUnavailable={booked} />
	<p>Booked for {visit.toString()}.</p>
</div>

<style>
	.booking {
		display: grid;
		gap: 0.75rem;
	}
	.booking p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
