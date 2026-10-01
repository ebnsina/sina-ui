<script lang="ts">
	import MultiSelect, { type MultiOption } from '#lib/ui/MultiSelect.svelte';

	const fields: MultiOption[] = [
		{ value: 'astronomy', label: 'Astronomy' },
		{ value: 'medicine', label: 'Medicine' },
		{ value: 'mathematics', label: 'Mathematics' },
		{ value: 'optics', label: 'Optics' },
		{ value: 'philosophy', label: 'Philosophy' },
		{ value: 'geography', label: 'Geography' },
		{ value: 'alchemy', label: 'Alchemy' },
		{ value: 'music', label: 'Music theory' }
	];
	let chosen = $state(['astronomy', 'optics']);
</script>

<div class="demo">
	<MultiSelect
		label="Fields of study"
		options={fields}
		bind:value={chosen}
		hint="Choose the collections to include in the catalog."
	/>
</div>

<style>
	.demo {
		inline-size: min(24rem, 100%);
	}
</style>
