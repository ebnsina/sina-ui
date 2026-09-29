<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import Calendar, { type DateRange } from '#lib/ui/Calendar.svelte';

	let visit = $state<DateRange>({
		start: new CalendarDate(2026, 10, 12),
		end: new CalendarDate(2026, 10, 18)
	});
</script>

<Calendar label="Library visit" mode="range" months={2} bind:range={visit} />
