<script lang="ts">
	import Input from '#lib/ui/Input.svelte';
</script>

<Input label="Library website" placeholder="bayt-al-hikma">
	{#snippet start()}https://{/snippet}
	{#snippet end()}.org{/snippet}
</Input>
