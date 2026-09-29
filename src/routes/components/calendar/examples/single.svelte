<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import Calendar from '#lib/ui/Calendar.svelte';

	let lecture = $state(new CalendarDate(2026, 10, 14));
	// Fridays are for prayer and rest: no lectures.
	const closed = (d: CalendarDate) => d.toDate('UTC').getUTCDay() === 5;
</script>

<Calendar label="Lecture day" bind:value={lecture} isUnavailable={closed} />
