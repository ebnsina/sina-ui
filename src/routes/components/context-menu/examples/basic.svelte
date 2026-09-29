<script lang="ts">
	import { Book02Icon, Delete02Icon, Share08Icon, ViewIcon } from '@hugeicons/core-free-icons';
	import ContextMenu from '#lib/ui/ContextMenu.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';

	let last = $state<string>();
</script>

<div class="stack">
	<ContextMenu label="Options for Book of Optics">
		<div class="card">
			<strong>Kitāb al-Manāẓir</strong>
			<span>Ibn al-Haytham · Book of Optics · 1021</span>
		</div>
		{#snippet menu()}
			<Dropdown.Item onselect={() => (last = 'Open')}><Icon icon={ViewIcon} /> Open</Dropdown.Item>
			<Dropdown.Item onselect={() => (last = 'Copy link')}
				><Icon icon={Share08Icon} /> Copy link</Dropdown.Item
			>
			<Dropdown.Item onselect={() => (last = 'Move to reading room')}>
				<Icon icon={Book02Icon} /> Move to reading room
			</Dropdown.Item>
			<Dropdown.Separator />
			<Dropdown.Item variant="danger" onselect={() => (last = 'Remove from list')}>
				<Icon icon={Delete02Icon} /> Remove from list
			</Dropdown.Item>
		{/snippet}
	</ContextMenu>
	<p>
		{last
			? `Last action: ${last}`
			: 'Right-click the card, long-press it, or focus it and press Shift+F10.'}
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: min(100%, 24rem);
	}
	.card {
		display: grid;
		gap: 0.125rem;
		padding: 1rem 1.125rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.card span,
	p {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	p {
		margin: 0;
	}
</style>
