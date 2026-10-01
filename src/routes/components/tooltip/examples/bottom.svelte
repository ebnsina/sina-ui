<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';
</script>

<Tooltip text="Shown on the bottom" side="bottom">
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>Bottom</Button>
	{/snippet}
</Tooltip>
