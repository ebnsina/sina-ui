<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import { Book02Icon, MoreHorizontalIcon, Share08Icon } from '@hugeicons/core-free-icons';
</script>

<div class="end">
	<Dropdown.Root>
		{#snippet trigger(props)}
			<Button variant="ghost" square aria-label="More actions" {...props}>
				<Icon icon={MoreHorizontalIcon} />
			</Button>
		{/snippet}
		<Dropdown.Item><Icon icon={Share08Icon} /> Copy link</Dropdown.Item>
		<Dropdown.Item><Icon icon={Book02Icon} /> Move to reading room</Dropdown.Item>
	</Dropdown.Root>
</div>

<style>
	.end {
		display: flex;
		justify-content: flex-end;
		inline-size: 100%;
	}
</style>
