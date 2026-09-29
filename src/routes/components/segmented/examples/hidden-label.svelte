<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';

	let period = $state('month');
</script>

<!-- When context makes the question obvious, keep the label for screen readers only. -->
<Segmented
	label="Loans in the last"
	hideLabel
	options={[
		{ value: 'week', label: 'Week' },
		{ value: 'month', label: 'Month' },
		{ value: 'year', label: 'Year' }
	]}
	bind:value={period}
/>
