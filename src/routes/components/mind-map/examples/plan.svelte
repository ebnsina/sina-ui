<script lang="ts">
	import MindMap from '#lib/ui/MindMap.svelte';
	import { toOutline, type MindNode } from '#lib/ui/mindmap.js';
	import CopyButton from '#lib/ui/CopyButton.svelte';

	let root: MindNode = $state({
		id: 'room',
		label: 'Plan the library’s new reading room',
		children: [
			{
				id: 'space',
				label: 'Space',
				children: [
					{ id: 'light', label: 'North light for copyists' },
					{ id: 'quiet', label: 'Quiet corner' }
				]
			},
			{
				id: 'collection',
				label: 'Collection',
				children: [
					{ id: 'optics', label: 'Book of Optics' },
					{ id: 'canon', label: 'Canon of Medicine' }
				]
			},
			{ id: 'people', label: 'People', children: [{ id: 'keeper', label: 'A keeper of books' }] },
			{ id: 'budget', label: 'Budget' }
		]
	});
</script>

<div class="stack">
	<div class="frame">
		<MindMap bind:root label="Plan for the reading room" editable />
	</div>
	<CopyButton value={() => toOutline(root)} size="sm">Copy as outline</CopyButton>
</div>

<style>
	.stack {
		inline-size: 100%;
		display: grid;
		justify-items: start;
		gap: 0.75rem;
	}
	.frame {
		justify-self: stretch;
		block-size: 30rem;
	}
</style>
