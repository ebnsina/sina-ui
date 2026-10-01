<script lang="ts">
	import VirtualList from '#lib/ui/VirtualList.svelte';

	// Ten thousand entries: only the few in view are ever in the page.
	const subjects = ['Optics', 'Algebra', 'Medicine', 'Astronomy', 'Geography', 'Poetry', 'Law'];
	const cities = ['Baghdad', 'Cairo', 'Córdoba', 'Damascus', 'Isfahan', 'Samarkand', 'Fez'];
	const entries = Array.from({ length: 10_000 }, (_, i) => ({
		id: i + 1,
		subject: subjects[i % subjects.length],
		city: cities[(i * 3) % cities.length],
		year: 800 + ((i * 37) % 600)
	}));
	const n = new Intl.NumberFormat('en');
</script>

<div class="stack">
	<VirtualList items={entries} key={(e) => e.id} label="Catalog" height="22rem" class="catalog">
		{#snippet children(e)}
			<div class="row">
				<span class="id">MS-{String(e.id).padStart(5, '0')}</span>
				<span class="what">{e.subject}, {e.city}</span>
				<span class="year">{e.year} CE</span>
			</div>
		{/snippet}
	</VirtualList>
	<p class="note">{n.format(entries.length)} manuscripts</p>
</div>

<style>
	.stack {
		display: grid;
		justify-items: center;
		inline-size: min(28rem, 100%);
	}
	:global(.catalog) {
		inline-size: min(28rem, 100%);
		border-radius: 1rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.row {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.625rem 1rem;
		box-shadow: inset 0 -1px var(--ui-line);
		font-size: 0.875rem;
	}
	.id {
		color: var(--ui-muted);
		font: 0.8125rem/1 var(--ui-font-mono);
	}
	.what {
		flex: 1;
	}
	.year {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.note {
		margin: 0.75rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
