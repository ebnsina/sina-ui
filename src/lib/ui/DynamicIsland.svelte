<script lang="ts" generics="V extends string">
	import { reduced } from './motion';
	import type { Snippet } from 'svelte';
	import { spring, springAt } from './spring';

	interface Props {
		/** Names the island for screen readers ("Live activity"). */
		label: string;
		/** Which activity is showing; '' rests as an empty pill. */
		view: V | '';
		/** Opened to show the activity's details; tapping the island toggles it. */
		expanded?: boolean;
		/** Draws an activity, compact or opened. Keep changing values in fixed-width slots. */
		children: Snippet<[V, boolean]>;
		/** Name for the tap target that opens the details. */
		openLabel?: string;
		/** Whether an activity has details to open; all do by default. */
		expandable?: (view: V) => boolean;
		class?: string;
	}

	let {
		label,
		view,
		expanded = $bindable(false),
		children,
		openLabel = 'Show details',
		expandable = () => true,
		class: className
	}: Props = $props();

	let island: HTMLDivElement;
	// The shell's size follows its content. Width, height and radius are CSS transitions on a
	// spring: a change part way through a morph carries on from where it is, never restarting.
	let size = $state<{ w: number; h: number }>();
	let ready = $state(false);
	const EASE = spring(0.18);
	// Closing is quicker and nearly bounceless: a card settling back into a pill shouldn't wobble.
	const CLOSE = spring(0.04);
	let closing = $state(false);
	let wasOpen = false;
	$effect.pre(() => {
		closing = wasOpen && !expanded;
		wasOpen = expanded;
	});
	// A soft rectangle while it's one line. Grown into a card, its corners are concentric with what's inside:
	// the system radius (0.75rem) plus the card's 1.25rem padding, so 32px; small, it stays a soft rectangle.
	const radius = (h: number) => Math.min(h * 0.4, 32);

	// The width its container allows: content wraps within it instead of growing past it.
	let room = $state<number>();
	function measure(node: HTMLElement) {
		// From the node: bind:this has not set `island` yet when this runs.
		const parent = node.closest('.island')!.parentElement!;
		const fit = () => {
			const cs = getComputedStyle(parent);
			room = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
			size = { w: node.offsetWidth, h: node.offsetHeight };
		};
		fit();
		// Transitions only after the first size, so the page doesn't open with a morph.
		requestAnimationFrame(() => (ready = true));
		const seen = new ResizeObserver(fit);
		seen.observe(node);
		seen.observe(parent);
		return () => seen.disconnect();
	}

	$effect(() => {
		if (!view) expanded = false;
	});

	// Content: in on a livelier spring, sharpening from a blur a beat after the shell starts to grow;
	// out with a quick fade, unreachable while it goes.
	const bouncy = springAt(0.3);
	function appear(_node: Element) {
		if (reduced()) return { duration: 150, css: (t: number) => `opacity: ${t}` };
		return {
			// Closing, the compact content waits until the shell is nearly a pill again.
			delay: closing ? 260 : 70,
			duration: 600,
			easing: bouncy,
			css: (t: number, u: number) =>
				`opacity: ${Math.min(1, t * 1.6)}; transform: scale(${0.9 + 0.1 * t}); filter: blur(${u * 6}px)`
		};
	}
	function vanish(node: Element) {
		(node as HTMLElement).inert = true;
		return {
			duration: reduced() ? 100 : 150,
			css: (t: number) => `opacity: ${t}; transform: scale(${0.96 + 0.04 * t})`
		};
	}
</script>

<!-- Opened, Escape anywhere or a press outside closes it (Safari doesn't focus clicked buttons). -->
<svelte:document
	onpointerdown={(e) => expanded && !island.contains(e.target as Node) && (expanded = false)}
	onkeydown={(e) => {
		if (e.key === 'Escape' && expanded) {
			e.preventDefault();
			expanded = false;
		}
	}}
/>

<!-- A live region: screen readers hear when an activity starts, changes or ends. -->
<div
	bind:this={island}
	class={['island', ready && 'ready', className]}
	role="region"
	aria-label={label}
	aria-live="polite"
	style:width={size ? `${size.w}px` : undefined}
	style:height={size ? `${size.h}px` : undefined}
	style:border-radius={size ? `${radius(size.h)}px` : undefined}
	style:--ease={closing ? CLOSE : EASE}
	style:--dur={closing ? '420ms' : '700ms'}
	style:--room={room ? `${room}px` : undefined}
>
	{#key `${view}:${expanded}`}
		<div class="content" {@attach measure} in:appear out:vanish>
			{#if view}
				{@render children(view, expanded)}
				{#if !expanded && expandable(view)}
					<!-- Compact: the whole island is the tap target that opens it. -->
					<button
						type="button"
						class="open"
						aria-label={openLabel}
						aria-expanded="false"
						onclick={() => (expanded = true)}
					></button>
				{/if}
			{:else}
				<span class="rest" aria-hidden="true"></span>
			{/if}
		</div>
	{/key}
</div>

<style>
	/* An overlay surface like any other in the system: the motion is iOS, the look is ours. */
	.island {
		position: relative;
		margin-inline: auto;
		overflow: hidden;
		border-radius: 0.875rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-xs);
		color: var(--ui-fg);
		font: 0.875rem/1.3 var(--ui-font);
		/* Stays on its own layer while it morphs, so growing never repaints the page around it. */
		will-change: width, height;
	}
	.ready {
		transition:
			width var(--dur) var(--ease),
			height var(--dur) var(--ease),
			border-radius var(--dur) var(--ease);
	}
	.content {
		position: absolute;
		top: 0;
		left: 50%;
		translate: -50% 0;
		inline-size: max-content;
		max-inline-size: var(--room, none);
		transform-origin: 50% 0;
	}
	.rest {
		display: block;
		inline-size: 7.875rem;
		block-size: 2.3rem;
	}
	.open {
		position: absolute;
		inset: 0;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: inherit;
		background: none;
		cursor: pointer;
	}
	.open:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -3px;
	}
	@media (prefers-reduced-motion: reduce) {
		.ready {
			transition: none;
		}
	}
</style>
