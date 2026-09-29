<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';
</script>

<!-- Default: the tooltip adds a description to a control that already has a name. -->
<Tooltip text="Loans last forty days. Renew from your reading list.">
	{#snippet trigger(props)}
		<Button {...props}>Borrow manuscript</Button>
	{/snippet}
</Tooltip>
