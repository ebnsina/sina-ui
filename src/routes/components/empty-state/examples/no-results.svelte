<script lang="ts">
	import { Search01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import SearchField from '#lib/ui/SearchField.svelte';

	const titles = ['The Canon of Medicine', 'Book of Optics', 'Al-Jabr', 'Tabula Rogeriana'];
	let query = $state('astrolabe');
	let field = $state<HTMLInputElement>();
	const found = $derived(
		titles.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<div class="stack">
	<SearchField label="Search the catalog" bind:value={query} bind:element={field} />
	{#if found.length}
		<ul>
			{#each found as t (t)}<li>{t}</li>{/each}
		</ul>
	{:else}
		<EmptyState icon={Search01Icon} title="No matches for “{query}”" level={3}>
			<p>Try a shorter word, or search by author instead.</p>
			{#snippet actions()}
				<Button
					variant="secondary"
					onclick={() => {
						query = '';
						field?.focus();
					}}>Clear search</Button
				>
			{/snippet}
		</EmptyState>
	{/if}
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 28rem);
		margin-inline: auto;
	}
	ul {
		margin: 0;
		padding-inline-start: 1.25rem;
	}
</style>
