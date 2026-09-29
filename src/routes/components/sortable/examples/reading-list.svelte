<script lang="ts">
	import { DragDropVerticalIcon } from '@hugeicons/core-free-icons';
	import Icon from '#lib/ui/Icon.svelte';
	import Sortable from '#lib/ui/Sortable.svelte';

	let books = $state([
		{ id: 'optics', title: 'Book of Optics', author: 'Ibn al-Haytham' },
		{ id: 'algebra', title: 'The Compendious Book on Calculation', author: 'al-Khwarizmi' },
		{ id: 'canon', title: 'The Canon of Medicine', author: 'Ibn Sina' },
		{ id: 'stars', title: 'Book of Fixed Stars', author: 'al-Sufi' },
		{ id: 'ingenious', title: 'Book of Ingenious Devices', author: 'Banu Musa' }
	]);
</script>

<Sortable
	bind:items={books}
	key={(b) => b.id}
	itemLabel={(b) => b.title}
	label="Reading list"
	class="reading"
>
	{#snippet children(book, handle, { index })}
		<div class="card">
			<button type="button" class="grip" {...handle}>
				<Icon icon={DragDropVerticalIcon} size={18} />
			</button>
			<span class="n">{index + 1}</span>
			<span class="text">
				<strong>{book.title}</strong>
				<span>{book.author}</span>
			</span>
		</div>
	{/snippet}
</Sortable>

<style>
	:global(.reading) {
		inline-size: min(26rem, 100%);
	}
	.card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-block: 0.5rem;
		padding-inline: 0.375rem 0.875rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.grip {
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-muted);
		transition: background var(--ui-dur) ease;
	}
	.grip:hover,
	.grip[aria-pressed='true'] {
		background: var(--ui-subtle);
		color: var(--ui-fg);
	}
	.grip:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.n {
		inline-size: 1.25rem;
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	.text {
		display: grid;
		min-inline-size: 0;
		font-size: 0.875rem;
		line-height: 1.35;
	}
	.text strong {
		font-weight: 600;
	}
	.text span {
		color: var(--ui-muted);
	}
</style>
