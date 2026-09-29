<script lang="ts">
	import Checkbox from '#lib/ui/Checkbox.svelte';

	const works = $state([
		{ title: 'The Canon of Medicine', chosen: true },
		{ title: 'The Book of Optics', chosen: false },
		{ title: 'Al-Jabr', chosen: false }
	]);
	const count = $derived(works.filter((w) => w.chosen).length);
</script>

<div class="list">
	<Checkbox
		checked={count === works.length}
		indeterminate={count > 0 && count < works.length}
		onchange={(e) => works.forEach((w) => (w.chosen = e.currentTarget.checked))}
	>
		Borrow all works ({count} of {works.length})
	</Checkbox>
	<div class="children">
		{#each works as work (work.title)}
			<Checkbox bind:checked={work.chosen}>{work.title}</Checkbox>
		{/each}
	</div>
</div>

<style>
	.list,
	.children {
		display: grid;
		gap: 0.5rem;
	}
	.children {
		padding-inline-start: 1.75rem;
	}
</style>
