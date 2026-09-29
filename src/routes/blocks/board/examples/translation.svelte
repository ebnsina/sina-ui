<script lang="ts">
	import { onMount } from 'svelte';
	import Board, { type BoardColumn, type BoardLabel } from '#lib/blocks/board/Board.svelte';

	const labels: BoardLabel[] = [
		{ id: 'greek', name: 'Greek', color: 'var(--ui-accent)' },
		{ id: 'persian', name: 'Persian', color: 'var(--ui-warning)' },
		{ id: 'urgent', name: 'Urgent', color: 'var(--ui-danger)' },
		{ id: 'review', name: 'Review', color: 'light-dark(#0369a1, #38bdf8)' }
	];
	const sample = (): BoardColumn[] => [
		{
			id: 'todo',
			title: 'To translate',
			cards: [
				{ id: 'euclid', title: "Euclid's Elements, books 7–9", labels: ['greek'] },
				{ id: 'ptolemy', title: 'Ptolemy’s Almagest', labels: ['greek', 'urgent'] },
				{ id: 'kalila', title: 'Kalila and Dimna', labels: ['persian'] }
			]
		},
		{
			id: 'doing',
			title: 'In progress',
			cards: [
				{ id: 'galen', title: 'Galen on the pulse', labels: ['greek'] },
				{ id: 'sindhind', title: 'Star tables (Zij al-Sindhind)', labels: ['review'] }
			]
		},
		{
			id: 'check',
			title: 'Checking',
			cards: [{ id: 'aristotle', title: 'Aristotle, On the Soul', labels: ['greek', 'review'] }]
		},
		{ id: 'done', title: 'Copied', cards: [{ id: 'hippocrates', title: 'Hippocratic aphorisms' }] }
	];

	// Kept in this browser, so the board is as you left it after a reload.
	const KEY = 'sinaui-board';
	let columns = $state(sample());
	let loaded = false;
	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
			if (Array.isArray(saved)) columns = saved;
		} catch {}
		loaded = true;
	});
	$effect(() => {
		const json = JSON.stringify(columns);
		if (!loaded) return;
		try {
			localStorage.setItem(KEY, json);
		} catch {}
	});
</script>

<Board bind:columns {labels} label="Translation board" />
