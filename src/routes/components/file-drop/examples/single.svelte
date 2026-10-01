<script lang="ts">
	import FileDrop from '#lib/ui/FileDrop.svelte';

	let catalog = $state<File[]>([]);
</script>

<FileDrop
	label="Catalog"
	bind:value={catalog}
	accept=".pdf"
	hint="One PDF. Choosing another replaces it."
/>
