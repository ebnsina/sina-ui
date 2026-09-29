<script lang="ts">
	import TagInput from '#lib/ui/TagInput.svelte';

	let subjects = $state(['Algebra', 'Optics']);
</script>

<TagInput
	label="Subjects"
	bind:value={subjects}
	name="subjects"
	hint="Press Enter or a comma after each. Paste a list to add them all."
/>
