<script lang="ts">
	import Kbd from '#lib/ui/Kbd.svelte';

	const shortcuts = [
		{ does: 'Search', keys: ['mod', 'K'] },
		{ does: 'Save to reading list', keys: ['mod', 'S'] },
		{ does: 'Next page', keys: ['right'] },
		{ does: 'Previous page', keys: ['left'] },
		{ does: 'Open in a new tab', keys: ['mod', 'enter'] },
		{ does: 'Undo', keys: ['mod', 'Z'] },
		{ does: 'Redo', keys: ['mod', 'shift', 'Z'] }
	];
</script>

<dl>
	{#each shortcuts as s (s.does)}
		<div class="row">
			<dt>{s.does}</dt>
			<dd><Kbd keys={s.keys} /></dd>
		</div>
	{/each}
</dl>

<style>
	dl {
		display: grid;
		gap: 0.25rem;
		inline-size: min(100%, 22rem);
		margin: 0;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-block-size: 2rem;
	}
	dd {
		margin: 0;
	}
</style>
