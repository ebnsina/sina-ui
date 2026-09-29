<script lang="ts">
	import { Time } from '@internationalized/date';
	import TimeField from '#lib/ui/TimeField.svelte';

	let sighting = $state<Time | undefined>(new Time(21, 4, 36));
</script>

<div class="stack">
	<TimeField
		label="Star sighted at"
		bind:value={sighting}
		granularity="second"
		hourCycle={24}
		hint="As recorded at the Raqqa observatory."
	/>
</div>

<style>
	.stack {
		inline-size: min(100%, 14rem);
	}
</style>
