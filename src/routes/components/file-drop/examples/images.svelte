<script lang="ts">
	import FileDrop from '#lib/ui/FileDrop.svelte';

	let scans = $state<File[]>([]);
</script>

<FileDrop
	label="Manuscript scans"
	bind:value={scans}
	accept="image/*"
	multiple
	maxFiles={4}
	maxSize={5_000_000}
	hint="Images up to 5 MB, four at most."
	name="scans"
/>
