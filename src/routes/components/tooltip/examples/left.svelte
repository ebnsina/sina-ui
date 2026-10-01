<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';
</script>

<Tooltip text="Shown on the left" side="left">
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>Left</Button>
	{/snippet}
</Tooltip>
