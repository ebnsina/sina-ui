<script lang="ts">
	import TagInput from '#lib/ui/TagInput.svelte';

	let scholars = $state<string[]>([]);
</script>

<TagInput
	label="Cite up to three scholars"
	bind:value={scholars}
	max={3}
	placeholder="Al-Khwārizmī, Ibn Sīnā…"
	error={scholars.length ? undefined : 'Cite at least one scholar.'}
/>
