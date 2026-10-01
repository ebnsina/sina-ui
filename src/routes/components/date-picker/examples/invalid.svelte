<script lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import DatePicker from '#lib/ui/DatePicker.svelte';

	let start = $state<CalendarDate>();
</script>

<DatePicker
	label="Start of the copying"
	bind:value={start}
	error={start ? undefined : 'Choose when the copyist should start.'}
/>
