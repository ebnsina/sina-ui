<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';
</script>

<Tooltip text="Shown on the right" side="right">
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>Right</Button>
	{/snippet}
</Tooltip>
