<script lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import DatePicker from '#lib/ui/DatePicker.svelte';
	import { bangla } from '#lib/ui/calendars/bangla.js';

	let visit = $state<CalendarDate>();
</script>

<!-- Bangabda: বৈশাখ, আষাঢ়, শ্রাবণ... with Bangla digits; the value stays a Gregorian date. -->
<div lang="bn">
	<DatePicker
		label="পরিদর্শনের তারিখ"
		placeholder="তারিখ বেছে নিন"
		locale="bn-BD"
		calendar={bangla}
		bind:value={visit}
	/>
</div>
<p>Stored as: {visit?.toString() ?? '—'}</p>
