<script lang="ts">
	import { Notification01Icon } from '@hugeicons/core-free-icons';
	import type { ComponentProps } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { ease, reduced } from '#lib/ui/motion.js';
	import Popover from '#lib/ui/Popover.svelte';
	import RollingNumber from '#lib/ui/RollingNumber.svelte';
	import Inbox from './Inbox.svelte';

	type Props = Omit<ComponentProps<typeof Inbox>, 'class'> & { open?: boolean; class?: string };

	let { items = $bindable(), open = $bindable(false), class: className, ...rest }: Props = $props();

	const unread = $derived(items.filter((n) => !n.read).length);
	let count = $state<HTMLElement>();
	// A new one arriving gives the count a small pop as its digits roll.
	let last = 0;
	$effect(() => {
		if (unread > last && last !== 0 && count && !reduced())
			count.animate([{ scale: 1 }, { scale: 1.3 }, { scale: 1 }], {
				duration: 420,
				easing: ease.spring
			});
		last = unread;
	});
</script>

<Popover bind:open title="Notifications" hideTitle side="bottom" align="start" class="bell-panel">
	{#snippet trigger(props)}
		<span class={['bell', className]}>
			<Button
				variant="ghost"
				square
				aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
				{...props}
			>
				<Icon icon={Notification01Icon} />
			</Button>
			{#if unread}
				<span class="count" bind:this={count} aria-hidden="true">
					{#if unread > 99}99+{:else}<RollingNumber value={unread} />{/if}
				</span>
			{/if}
		</span>
	{/snippet}
	<Inbox bind:items {...rest} />
</Popover>

<style>
	.bell {
		position: relative;
		display: inline-flex;
	}
	/* Solid, on the bell's corner, ringed in the page color so it reads over the icon. */
	.count {
		position: absolute;
		inset-block-start: 0.125rem;
		inset-inline-end: 0.125rem;
		display: grid;
		place-items: center;
		min-inline-size: 1.125rem;
		block-size: 1.125rem;
		padding-inline: 0.25rem;
		box-sizing: border-box;
		border-radius: 999px;
		background: var(--ui-accent);
		box-shadow: 0 0 0 2px var(--ui-bg);
		color: var(--ui-on-accent);
		font: 600 0.6875rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
		animation: in var(--ui-dur-spring) var(--ui-ease-spring);
	}
	@keyframes in {
		from {
			scale: 0.4;
			opacity: 0;
		}
	}
	:global(div.popover.bell-panel) {
		--inbox-height: min(26rem, 70dvh);
		inline-size: 24rem;
		max-inline-size: min(24rem, 100vw - 16px);
		padding: 0.75rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.count {
			animation: none;
		}
	}
</style>
