<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { createAttachmentKey } from 'svelte/attachments';
	import { anchored, type Side } from './floating';

	interface Props {
		/** Render your link and spread these props onto it. */
		trigger: Snippet<[HTMLAnchorAttributes]>;
		/** The preview. Extra detail only: everything in it must also be reachable another way. */
		children: Snippet;
		side?: Side;
		/** ms before it opens on hover, so passing the pointer across doesn't flash it. */
		openDelay?: number;
		/** ms before it closes, so the pointer can travel onto the card. */
		closeDelay?: number;
	}

	let { trigger, children, side = 'bottom', openDelay = 500, closeDelay = 250 }: Props = $props();

	let anchor: HTMLElement;
	let card: HTMLDivElement;
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const float = anchored(
		() => anchor,
		() => card,
		() => (open = false),
		// svelte-ignore state_referenced_locally
		{ side, align: 'start', gap: 8, morph: false }
	);
	$effect(() => {
		if (open) float.open();
		else float.close();
	});
	$effect(() => () => {
		clearTimeout(timer);
		float.destroy();
	});

	const later = (next: boolean, ms: number) => {
		clearTimeout(timer);
		timer = setTimeout(() => (open = next), ms);
	};
	const stay = () => clearTimeout(timer);

	const triggerProps: HTMLAnchorAttributes = {
		// Touch has no hover: a tap just follows the link.
		onpointerenter: (e) => e.pointerType !== 'touch' && later(true, openDelay),
		onpointerleave: () => later(false, closeDelay),
		onfocus: (e) =>
			(e.currentTarget as HTMLElement).matches(':focus-visible') && later(true, openDelay),
		onblur: (e) => {
			// Tabbing into the card keeps it open.
			if (!card.contains(e.relatedTarget as Node | null)) later(false, closeDelay);
		},
		onkeydown: (e) => {
			if (e.key === 'Escape' && open) {
				e.preventDefault();
				open = false;
			}
		},
		[createAttachmentKey()]: (el: HTMLElement) => {
			anchor = el;
		}
	};
</script>

{@render trigger(triggerProps)}

<!-- Right after its link, so Tab moves from the link into the card. -->
<div
	bind:this={card}
	popover="manual"
	class="card"
	role="presentation"
	onpointerenter={stay}
	onpointerleave={() => later(false, closeDelay)}
	onfocusout={(e) => {
		const to = e.relatedTarget as Node | null;
		if (!card.contains(to) && to !== anchor) later(false, closeDelay);
	}}
	onkeydown={(e) => {
		if (e.key !== 'Escape') return;
		e.preventDefault();
		open = false;
		anchor.focus();
	}}
>
	{@render children()}
</div>

<style>
	.card {
		position: fixed;
		inset: auto;
		box-sizing: border-box;
		inline-size: min(20rem, 100vw - 16px);
		margin: 0;
		padding: 1rem;
		overflow: hidden;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		color: var(--ui-fg);
		font: 0.875rem/1.5 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
	}
</style>
