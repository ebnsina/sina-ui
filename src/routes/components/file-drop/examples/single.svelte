<script lang="ts">
	import FileDrop from '#lib/ui/FileDrop.svelte';

	let catalogue = $state<File[]>([]);
</script>

<FileDrop
	label="Catalogue"
	bind:value={catalogue}
	accept=".pdf"
	hint="One PDF. Choosing another replaces it."
/>
