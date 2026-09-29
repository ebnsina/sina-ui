<script lang="ts">
	import { Time } from '@internationalized/date';
	import TimeRangeField, { type TimeRange } from '#lib/ui/TimeRangeField.svelte';

	let hours = $state<TimeRange | undefined>({ start: new Time(8), end: new Time(17, 30) });
</script>

<div class="stack">
	<TimeRangeField label="Library hours" bind:value={hours} minuteStep={15} />
	<p>
		{#if hours}Stored as {hours.start.toString().slice(0, 5)}–{hours.end.toString().slice(0, 5)}
		{:else}Not set{/if}
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
