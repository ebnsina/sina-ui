<script lang="ts">
	import FileTree, { type TreeNode } from '#lib/ui/FileTree.svelte';

	// 20 wings × 30 shelves × 200 manuscripts: over 120,000 items. Only the rows in view are drawn.
	const subjects = [
		'Optics',
		'Algebra',
		'Medicine',
		'Astronomy',
		'Geography',
		'Poetry',
		'Law',
		'Music'
	];
	const items: TreeNode[] = Array.from({ length: 20 }, (_, w) => ({
		id: `w${w}`,
		name: `Wing ${w + 1}`,
		children: Array.from({ length: 30 }, (_, s) => ({
			id: `w${w}s${s}`,
			name: `Shelf ${s + 1} · ${subjects[(w + s) % subjects.length]}`,
			children: Array.from({ length: 200 }, (_, m) => ({
				id: `w${w}s${s}m${m}`,
				name: `MS-${String(w * 6000 + s * 200 + m + 1).padStart(6, '0')}.pdf`
			}))
		}))
	}));
	let expanded = $state(['w0', 'w0s0']);
</script>

<FileTree
	label="Catalogue"
	{items}
	bind:expanded
	searchLabel="Search the catalogue"
	height="22rem"
/>
