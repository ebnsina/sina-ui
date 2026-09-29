<script lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import DatePicker from '#lib/ui/DatePicker.svelte';

	let visit = $state<CalendarDate>();
</script>

<!-- Hijri months and years (Umm al-Qura), Arabic names and digits, right to left. -->
<div dir="rtl" lang="ar">
	<DatePicker
		label="موعد الزيارة"
		placeholder="اختر تاريخًا"
		locale="ar-SA"
		calendar="islamic-umalqura"
		bind:value={visit}
	/>
</div>
<p>Stored as: {visit?.toString() ?? '—'}</p>
