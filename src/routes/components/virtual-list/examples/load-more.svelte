<script lang="ts">
	import Spinner from '#lib/ui/Spinner.svelte';
	import VirtualList from '#lib/ui/VirtualList.svelte';

	// Pages of 50 arrive as you near the end, up to 500: the shape of an API with cursors.
	const TOTAL = 500;
	let letters = $state<{ id: number; from: string }[]>([]);
	let loading = $state(false);
	const senders = ['al-Kindi', 'Ibn Sina', 'al-Biruni', 'Ibn Rushd', 'al-Farabi', 'Ibn Khaldun'];

	async function more() {
		if (loading || letters.length >= TOTAL) return;
		loading = true;
		await new Promise((r) => setTimeout(r, 700));
		const start = letters.length;
		letters.push(
			...Array.from({ length: 50 }, (_, i) => ({
				id: start + i + 1,
				from: senders[(start + i) % senders.length]
			}))
		);
		loading = false;
	}
	more();
</script>

<VirtualList
	items={letters}
	key={(l) => l.id}
	label="Letters"
	height="20rem"
	onend={more}
	class="letters"
>
	{#snippet children(l)}
		<div class="row"><strong>Letter {l.id}</strong> <span>from {l.from}</span></div>
	{/snippet}
	{#snippet footer()}
		<p class="end" aria-live="polite">
			{#if loading}<Spinner size={16} /> Loading more…{:else if letters.length >= TOTAL}That's every
				letter.{/if}
		</p>
	{/snippet}
</VirtualList>

<style>
	:global(.letters) {
		inline-size: min(24rem, 100%);
		border-radius: 1rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.row {
		display: flex;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		box-shadow: inset 0 -1px var(--ui-line);
		font-size: 0.875rem;
	}
	.row span {
		color: var(--ui-muted);
	}
	.end {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		min-block-size: 2.5rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
</style>
