<script lang="ts">
	import FileTree, { type TreeNode } from '#lib/ui/FileTree.svelte';

	// Folders start empty and fetch their contents the first time they open, as from a server.
	const folder = (id: string, name: string): TreeNode => ({ id, name, children: [] });
	const items: TreeNode[] = [
		folder('baghdad', 'Baghdad'),
		folder('cairo', 'Cairo'),
		folder('cordoba', 'Córdoba')
	];

	async function load(node: TreeNode): Promise<TreeNode[]> {
		await new Promise((r) => setTimeout(r, 700));
		return [
			folder(`${node.id}/letters`, 'Letters'),
			...Array.from({ length: 5 }, (_, i) => ({
				id: `${node.id}/${i}`,
				name: `${node.name} register ${i + 1}.pdf`
			}))
		];
	}
</script>

<FileTree label="Cities" {items} {load} height="16rem" />
