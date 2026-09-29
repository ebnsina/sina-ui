<script lang="ts">
	import ScrollArea from '#lib/ui/ScrollArea.svelte';

	const rules = [
		['Wash your hands', 'Before touching any manuscript, and again after lunch.'],
		[
			'No ink at the desks',
			'Take notes in pencil or on your own tablet; ink stays in the copyists’ room.'
		],
		[
			'Turn pages from the corner',
			'Never from the spine: bindings from Baghdad are older than they look.'
		],
		[
			'Ask before copying',
			'Copies of rare works are made by the house copyists, and credited to them.'
		],
		[
			'Borrow for forty days',
			'Renew once from your reading list; bring the pledge you left when you return it.'
		],
		['Keep maps flat', 'Al-Idrisi’s sheets are stored flat and read on the long tables only.'],
		['Speak softly', 'Debate belongs in the courtyard; the reading room is for reading.'],
		[
			'Return by sunset',
			'The room closes at the evening call; lamps are not allowed near the shelves.'
		],
		['Report damage', 'Tell a librarian at once. Nobody is fined for honest reporting.']
	];
</script>

<div class="card">
	<h3>Reading room rules</h3>
	<ScrollArea label="Reading room rules" maxHeight="15rem">
		<ol>
			{#each rules as [title, body] (title)}
				<li><strong>{title}.</strong> {body}</li>
			{/each}
		</ol>
	</ScrollArea>
</div>

<style>
	.card {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 26rem);
	}
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	ol {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding-block: 0;
		padding-inline: 1.5rem 0.25rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		line-height: 1.55;
	}
	strong {
		color: var(--ui-fg);
		font-weight: 600;
	}
</style>
