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
	// The overlay scrollbar: thumb size and offset as fractions of the track, shown while scrolling.
	let size = $state(1);
	let offset = $state(0);
	let active = $state(false);
	let hide: ReturnType<typeof setTimeout> | undefined;
	const check = () => {
		const { scrollHeight: sh, clientHeight: ch, scrollTop: st } = area;
		more = sh - ch - st > 8;
		// Never shorter than a tenth of the track, so a very long page still has a thumb to grab.
		size = sh > ch ? Math.max(0.1, ch / sh) : 1;
		offset = sh > ch ? (st / (sh - ch)) * (1 - size) : 0;
	};
	function scrolled() {
		check();
		active = true;
		clearTimeout(hide);
		hide = setTimeout(() => (active = false), 900);
	}
	$effect(() => () => clearTimeout(hide));

	// Dragging the thumb scrolls in proportion; pressing the track pages toward the pointer.
	let drag: { y: number; top: number } | undefined;
	function grab(e: PointerEvent) {
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		drag = { y: e.clientY, top: area.scrollTop };
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const track = (e.currentTarget as HTMLElement).parentElement!.clientHeight;
		const ratio = (area.scrollHeight - area.clientHeight) / (track * (1 - size) || 1);
		area.scrollTop = drag.top + (e.clientY - drag.y) * ratio;
	}
	function page(e: PointerEvent) {
		if (e.target !== e.currentTarget) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const thumbMid = rect.top + rect.height * (offset + size / 2);
		const dir = e.clientY < thumbMid ? -1 : 1;
		area.scrollBy({
			top: dir * area.clientHeight * 0.9,
			behavior: reduced() ? 'instant' : 'smooth'
		});
	}

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
		onscroll={scrolled}
	>
		{@render children()}
	</div>
	<!-- A thin scrollbar over the edge for pointers; the region itself still scrolls natively. -->
	{#if size < 1}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class={['bar', active && 'active']} aria-hidden="true" onpointerdown={page}>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="thumb"
				style:--size={size}
				style:--offset={offset}
				onpointerdown={grab}
				onpointermove={move}
				onpointerup={() => (drag = undefined)}
				onpointercancel={() => (drag = undefined)}
			></span>
		</span>
	{/if}
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
		/* The native bar is replaced by the thin overlay one below; scrolling itself is unchanged. */
		scrollbar-width: none;
	}
	.area::-webkit-scrollbar {
		display: none;
	}
	/* Appears on hover or while scrolling, fades out after; thickens under the pointer. */
	.bar {
		position: absolute;
		inset-block: 0.375rem;
		inset-inline-end: 0.125rem;
		inline-size: 0.625rem;
		opacity: 0;
		transition: opacity 300ms ease;
	}
	.wrap:hover .bar,
	.bar.active {
		opacity: 1;
		transition-duration: var(--ui-dur-press);
	}
	.thumb {
		position: absolute;
		inset-block-start: 0;
		inset-inline-end: 0.125rem;
		inline-size: 0.3125rem;
		block-size: calc(var(--size) * 100%);
		border-radius: 999px;
		background: color-mix(in srgb, var(--ui-fg) 30%, transparent);
		translate: 0 calc(var(--offset) / var(--size) * 100%);
		transform-origin: right;
		cursor: default;
		transition:
			scale var(--ui-dur) var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	.thumb:dir(rtl) {
		transform-origin: left;
	}
	.bar:hover .thumb,
	.thumb:active {
		scale: 1.6 1;
		background: color-mix(in srgb, var(--ui-fg) 45%, transparent);
	}
	@media (hover: none) {
		.bar {
			display: none;
		}
	}
	.area:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.more {
		position: absolute;
		inset-block-end: 0.75rem;
		/* Centered by margins, so right-to-left needs nothing extra; translate is only for the rise. */
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
		.bar,
		.thumb {
			transition: none;
		}
		.more,
		.more.shown {
			translate: 0;
			scale: 1;
		}
	}
</style>
