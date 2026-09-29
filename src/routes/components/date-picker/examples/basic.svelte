<script lang="ts">
	import {
		type CalendarDate,
		getDayOfWeek,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import DatePicker from '#lib/ui/DatePicker.svelte';

	let due = $state<CalendarDate>();
	const now = today(getLocalTimeZone());
</script>

<DatePicker
	label="Return date"
	bind:value={due}
	min={now}
	max={now.add({ days: 90 })}
	isUnavailable={(d) => getDayOfWeek(d, 'en-US') === 5}
	hint="Loans last up to 90 days. The library is closed on Fridays."
	name="due"
/>
