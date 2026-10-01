<script lang="ts">
	import SearchField from '#lib/ui/SearchField.svelte';

	const titles = [
		'The Canon of Medicine',
		'Book of Optics',
		'Al-Jabr',
		'Tabula Rogeriana',
		'Book of Ingenious Devices',
		'Kitāb al-Taṣrīf'
	];
	let query = $state('');
	const found = $derived(
		titles.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<div class="stack">
	<SearchField label="Search the catalog" bind:value={query} placeholder="Title or author" />
	<ul>
		{#each found as t (t)}<li>{t}</li>{:else}<li class="none">Nothing matches “{query}”.</li>{/each}
	</ul>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 24rem);
	}
	ul {
		margin: 0;
		padding-inline-start: 1.25rem;
	}
	.none {
		list-style: none;
		margin-inline-start: -1.25rem;
		color: var(--ui-muted);
	}
</style>
