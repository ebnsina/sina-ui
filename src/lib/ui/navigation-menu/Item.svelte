<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import Icon from '../Icon.svelte';
	import { getNavMenu } from './context';

	interface Props {
		/** The item's name in the bar ("Collections"). */
		label: string;
		/** The panel: links, usually in a grid. */
		children: Snippet;
	}

	let { label, children }: Props = $props();
	const nav = getNavMenu();
	const id = $props.id();
	const open = $derived(nav.open === id);
</script>

<li>
	<!-- A disclosure button, not a menu: the panel holds ordinary links, reached with Tab. -->
	<button
		type="button"
		class="trigger"
		data-nav-item={id}
		aria-expanded={open}
		aria-controls="{id}-panel"
		onclick={() => nav.toggle(id)}
		onpointerenter={(e) => e.pointerType !== 'touch' && nav.openSoon(id)}
	>
		{label}
		<span class="chev" aria-hidden="true"><Icon icon={ArrowDown01Icon} size={14} /></span>
	</button>
	<div
		id="{id}-panel"
		class={['panel', open && 'open']}
		style:--from={open ? nav.from : 0}
		inert={!open}
	>
		{@render children()}
	</div>
</li>

<style>
	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: 2.25rem;
		margin: 0;
		padding: 0 0.75rem;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: inherit;
		font: 500 0.9375rem/1 var(--ui-font);
		cursor: pointer;
		transition: background-color var(--ui-dur-press) ease;
	}
	@media (pointer: coarse) {
		.trigger {
			min-block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.trigger:hover {
			background: var(--ui-subtle);
		}
	}
	.trigger[aria-expanded='true'] {
		background: var(--ui-subtle);
	}
	.trigger:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.chev {
		display: grid;
		color: var(--ui-muted);
		transition: rotate var(--ui-dur) var(--ui-ease-out);
	}
	[aria-expanded='true'] .chev {
		rotate: 180deg;
	}
	/* Under the bar, over the page; the shared backdrop draws the card behind it. */
	.panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		box-sizing: border-box;
		inline-size: max-content;
		max-inline-size: calc(100vw - 16px);
		padding: 0.75rem;
		opacity: 0;
		/* Content slides in from the side of the item left behind (0: straight in). */
		translate: calc(var(--from) * 1.5rem) 0.25rem;
		visibility: hidden;
		transition:
			opacity 150ms ease,
			translate 220ms var(--ui-ease-out),
			visibility 0s 220ms;
	}
	/* Bridges the gap to the bar, so moving the pointer down into the panel never leaves the menu. */
	.panel::before {
		content: '';
		position: absolute;
		inset: -0.5rem 0 auto;
		block-size: 0.5rem;
	}
	.panel.open {
		opacity: 1;
		translate: 0;
		visibility: visible;
		transition:
			opacity 200ms ease 40ms,
			translate 220ms var(--ui-ease-out),
			visibility 0s;
	}
	/* Phone: the panel spans the bar, never past the screen edge. */
	@media (max-width: 30rem) {
		.panel {
			inset-inline: 0;
			inline-size: auto;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.panel,
		.panel.open {
			translate: none;
		}
	}
</style>
