<script lang="ts">
	import { Time } from '@internationalized/date';
	import TimeField from '#lib/ui/TimeField.svelte';

	let lecture = $state<Time | undefined>(new Time(9, 30));
</script>

<div class="stack">
	<TimeField label="Lecture starts" bind:value={lecture} />
	<p>{lecture ? `Stored as ${lecture.toString().slice(0, 5)}` : 'Not set'}</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 12rem);
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
