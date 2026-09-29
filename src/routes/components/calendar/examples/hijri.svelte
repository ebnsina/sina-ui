<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import Calendar from '#lib/ui/Calendar.svelte';

	// Shown in the Hijri calendar; the value is still an ordinary Gregorian date.
	let day = $state(new CalendarDate(2026, 10, 14));
</script>

<Calendar label="Day of the observation" calendar="islamic-umalqura" bind:value={day} />
<p>Stored as {day.toString()}</p>

<style>
	p {
		margin: 0.75rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
