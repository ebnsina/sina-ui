<script lang="ts">
	import {
		type CalendarDate,
		getDayOfWeek,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import NaturalDate from '#lib/ui/NaturalDate.svelte';

	let due = $state<CalendarDate>();
	const now = today(getLocalTimeZone());
</script>

<NaturalDate
	label="Return date"
	bind:value={due}
	min={now}
	max={now.add({ days: 90 })}
	isUnavailable={(d) => getDayOfWeek(d, 'en-US') === 5}
	name="natural-due"
/>
