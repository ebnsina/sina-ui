<script lang="ts">
	import Select from '#lib/ui/Select.svelte';

	let work = $state('canon');
</script>

<Select label="Work" bind:value={work} hint="Grouped by discipline.">
	<optgroup label="Medicine">
		<option value="canon">The Canon of Medicine</option>
		<option value="tasrif">Kitab al-Tasrif</option>
	</optgroup>
	<optgroup label="Mathematics">
		<option value="jabr">Al-Jabr</option>
	</optgroup>
	<optgroup label="Optics">
		<option value="manazir">Kitab al-Manazir</option>
	</optgroup>
</Select>
