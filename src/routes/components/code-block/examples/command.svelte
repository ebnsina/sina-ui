<script lang="ts">
	import CodeBlock from '#lib/ui/CodeBlock.svelte';
</script>

<CodeBlock code="npx sinaui add code-block" lang="shell" lineNumbers={false} class="demo" />

<style>
	:global(.demo) {
		inline-size: min(40rem, 100%);
	}
</style>
