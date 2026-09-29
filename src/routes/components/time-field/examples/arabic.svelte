<script lang="ts">
	import { Time } from '@internationalized/date';
	import TimeField from '#lib/ui/TimeField.svelte';

	let lesson = $state<Time | undefined>(new Time(18, 12));
</script>

<div class="stack" dir="rtl" lang="ar">
	<TimeField label="موعد الدرس" bind:value={lesson} locale="ar-EG" />
</div>

<style>
	.stack {
		inline-size: min(100%, 12rem);
	}
</style>
