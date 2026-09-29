<script lang="ts">
	import { reduced } from './motion';
	import type { Snippet } from 'svelte';
	import { ArrowDown02Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		/** Names the scrolling region: keyboard users focus it to scroll. */
		label: string;
		/** Tallest it grows before scrolling ("20rem"). */
		maxHeight: string;
		children: Snippet;
		class?: string;
	}

	let { label, maxHeight, children, class: className }: Props = $props();

	let area: HTMLDivElement;
	let more = $state(false);
	const check = () => (more = area.scrollHeight - area.clientHeight - area.scrollTop > 8);

	$effect(() => {
		check();
		const resized = new ResizeObserver(check);
		resized.observe(area);
		for (const child of area.children) resized.observe(child);
		return () => resized.disconnect();
	});

	function down() {
		const reduce = reduced();
		// Most of a screenful, keeping a couple of lines in view so the reader doesn't lose their place.
		area.scrollBy({ top: area.clientHeight * 0.8, behavior: reduce ? 'instant' : 'smooth' });
	}
</script>

<div class={['wrap', className]}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={area}
		class="area"
		role="region"
		aria-label={label}
		tabindex="0"
		style:max-block-size={maxHeight}
		{@attach scrollEdges}
		data-fade
		onscroll={check}
	>
		{@render children()}
	</div>
	<!-- For pointers: the region itself scrolls with the keyboard, so the button stays out of the tab order. -->
	<button
		type="button"
		class={['more', more && 'shown']}
		tabindex="-1"
		aria-hidden="true"
		onclick={down}
	>
		<Icon icon={ArrowDown02Icon} size={20} />
	</button>
</div>

<style>
	.wrap {
		position: relative;
	}
	.area {
		overflow: auto;
		overscroll-behavior: contain;
		border-radius: var(--ui-radius);
	}
	.area:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.more {
		position: absolute;
		inset-block-end: 0.75rem;
		/* Centred by margins, so right-to-left needs nothing extra; translate is only for the rise. */
		inset-inline: 0;
		margin-inline: auto;
		display: grid;
		place-items: center;
		inline-size: 2.75rem;
		block-size: 2.75rem;
		margin-block: 0;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.18);
		cursor: pointer;
		/* Hidden: sunk a little and faded out; it rises in when there's more below. */
		opacity: 0;
		translate: 0 0.5rem;
		scale: 0.9;
		pointer-events: none;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur-overlay) var(--ui-ease-out),
			scale var(--ui-dur-overlay) var(--ui-ease-out);
	}
	.more.shown {
		opacity: 1;
		translate: 0;
		scale: 1;
		pointer-events: auto;
	}
	.more.shown:active {
		scale: 0.94;
	}
	@media (hover: hover) and (pointer: fine) {
		.more.shown:hover {
			background: color-mix(in srgb, var(--ui-accent) 88%, var(--ui-fg));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.more,
		.more.shown {
			translate: 0;
			scale: 1;
		}
	}
</style>
