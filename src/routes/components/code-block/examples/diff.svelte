<script lang="ts">
	import CodeBlock from '#lib/ui/CodeBlock.svelte';

	const code = `  export const catalogue = {
-   shelves: 12,
+   shelves: 14,
+   reading_rooms: ['Main hall', 'Manuscripts'],
    open: '08:00'
  };`;
</script>

<CodeBlock {code} lang="diff" filename="catalogue.ts" class="demo" />

<style>
	:global(.demo) {
		inline-size: min(40rem, 100%);
	}
</style>
