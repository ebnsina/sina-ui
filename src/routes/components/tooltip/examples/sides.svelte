<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';

	const sides = ['top', 'right', 'bottom', 'left'] as const;
</script>

{#each sides as side (side)}
	<Tooltip text="Shown on the {side}" {side}>
		{#snippet trigger(props)}
			<Button variant="secondary" {...props}>{side}</Button>
		{/snippet}
	</Tooltip>
{/each}
