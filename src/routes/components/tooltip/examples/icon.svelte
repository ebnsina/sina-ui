<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Tooltip from '#lib/ui/Tooltip.svelte';
	import { Copy01Icon, Edit02Icon, Share08Icon } from '@hugeicons/core-free-icons';
</script>

<!-- labels: the tooltip is the button's name, so no aria-label is needed or repeated. -->
<Tooltip text="Annotate" labels>
	{#snippet trigger(props)}
		<Button variant="ghost" square {...props}><Icon icon={Edit02Icon} /></Button>
	{/snippet}
</Tooltip>
<Tooltip text="Transcribe a copy" labels>
	{#snippet trigger(props)}
		<Button variant="ghost" square {...props}><Icon icon={Copy01Icon} /></Button>
	{/snippet}
</Tooltip>
<Tooltip text="Share manuscript" labels>
	{#snippet trigger(props)}
		<Button variant="ghost" square {...props}><Icon icon={Share08Icon} /></Button>
	{/snippet}
</Tooltip>
