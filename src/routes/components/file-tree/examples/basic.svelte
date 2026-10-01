<script lang="ts">
	import FileTree, { type TreeNode } from '#lib/ui/FileTree.svelte';

	const archive: TreeNode[] = [
		{
			id: 'medicine',
			name: 'Medicine',
			children: [
				{
					id: 'canon',
					name: 'The Canon of Medicine',
					children: [
						{ id: 'canon-1', name: 'Book one — General principles.pdf' },
						{ id: 'canon-2', name: 'Book two — Simple medicines.pdf' },
						{ id: 'canon-scan', name: 'Frontispiece.png' }
					]
				},
				{ id: 'tasrif', name: 'Kitāb al-Taṣrīf.pdf' }
			]
		},
		{
			id: 'mathematics',
			name: 'Mathematics',
			children: [
				{ id: 'jabr', name: 'Al-Jabr.pdf' },
				{ id: 'tables', name: 'Astronomical tables.json' }
			]
		},
		{ id: 'optics', name: 'Optics', children: [{ id: 'manazir', name: 'Kitāb al-Manāẓir.pdf' }] },
		{ id: 'readme', name: 'Catalog notes.md' }
	];

	let expanded = $state(['medicine', 'canon']);
	let selected = $state('canon-1');
</script>

<div class="layout">
	<FileTree label="Archive" items={archive} bind:expanded bind:selected />
	<p>Selected: <strong>{selected}</strong></p>
</div>

<style>
	.layout {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 22rem);
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
