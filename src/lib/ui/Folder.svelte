<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		name: string;
		/** How many items it holds, shown under the name. */
		count?: number;
		/** Any CSS color: the accent by default. */
		color?: string;
		size?: 'sm' | 'md' | 'lg';
		/** Held open: while something is dragged over it, say. It also opens on hover and focus. */
		open?: boolean;
		/** Selected, in a list where folders can be chosen. */
		selected?: boolean;
		locale?: string;
	}

	let {
		name,
		count,
		color = 'var(--ui-accent)',
		size = 'md',
		open = false,
		selected = false,
		locale = 'en',
		class: className,
		...rest
	}: Props = $props();

	const items = $derived(
		count === undefined
			? ''
			: `${new Intl.NumberFormat(locale).format(count)} ${count === 1 ? 'item' : 'items'}`
	);
</script>

<button
	type="button"
	class={['folder', size, open && 'open', selected && 'selected', className]}
	style:--c={color}
	{...rest}
>
	<span class="art" aria-hidden="true">
		<span class="back"></span>
		<span class="paper p1"></span>
		<span class="paper p2"></span>
		<span class="paper p3"></span>
		<span class="front"></span>
	</span>
	<span class="name">{name}</span>
	{#if items}<span class="count">{items}</span>{/if}
</button>

<style>
	.folder {
		--w: 7.5rem;
		display: inline-grid;
		justify-items: center;
		gap: 0.25rem;
		inline-size: calc(var(--w) + 1.5rem);
		padding: 0.75rem 0.5rem 0.625rem;
		border: 0;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: none;
		color: var(--ui-fg);
		font: 0.875rem/1.3 var(--ui-font);
		cursor: pointer;
		transition: background-color var(--ui-dur) ease;
		-webkit-tap-highlight-color: transparent;
	}
	.sm {
		--w: 4.5rem;
		font-size: 0.8125rem;
	}
	.lg {
		--w: 10rem;
	}
	.folder:hover {
		background: var(--ui-subtle);
	}
	.selected {
		background: color-mix(in srgb, var(--c) 12%, transparent);
	}
	.folder:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* The folder: back with its tab, papers, then a frosted front that tips forward to open. */
	.art {
		position: relative;
		inline-size: var(--w);
		aspect-ratio: 1.3;
		margin-block-end: 0.25rem;
		perspective: calc(var(--w) * 4);
	}
	.back {
		position: absolute;
		inset: 8% 0 0;
		border-radius: calc(var(--w) * 0.08);
		background: color-mix(in oklab, var(--c) 78%, #000);
	}
	/* The tab, joined to the back with a soft slope. */
	.back::before {
		content: '';
		position: absolute;
		inset-block-start: -10%;
		inset-inline-start: 0;
		inline-size: 42%;
		block-size: 16%;
		border-radius: calc(var(--w) * 0.06) calc(var(--w) * 0.06) 0 0;
		background: inherit;
		clip-path: polygon(0 0, 78% 0, 100% 100%, 0 100%);
	}
	.paper {
		position: absolute;
		inset-inline: 10%;
		inset-block: 10% 12%;
		border-radius: calc(var(--w) * 0.04);
		background:
			repeating-linear-gradient(
					to bottom,
					transparent 0 calc(var(--w) * 0.075),
					rgb(15 23 42 / 0.08) calc(var(--w) * 0.075) calc(var(--w) * 0.085)
				)
				0 calc(var(--w) * 0.12) / 70% 100% no-repeat,
			#fff;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
		transition: transform 320ms var(--ui-ease-out);
	}
	.p1 {
		transform: rotate(-4deg) translateY(4%);
	}
	.p2 {
		transform: rotate(3deg) translateY(2%);
	}
	.p3 {
		transform: translateY(6%);
	}
	/* Frosted glass in the folder's color: the papers show through, blurred. */
	.front {
		position: absolute;
		inset: 30% 0 0;
		border-radius: calc(var(--w) * 0.08);
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--c) 72%, #fff 8%),
			color-mix(in srgb, var(--c) 88%, transparent)
		);
		box-shadow:
			inset 0 1px rgb(255 255 255 / 0.35),
			0 calc(var(--w) * 0.02) calc(var(--w) * 0.06) rgb(0 0 0 / 0.14);
		backdrop-filter: blur(6px);
		transform-origin: 50% 100%;
		transition: transform 320ms var(--ui-ease-out);
	}
	/* Open: the front tips forward and the papers rise out of it. */
	:is(.folder:hover, .folder:focus-visible, .open) .front {
		transform: rotateX(-26deg);
	}
	:is(.folder:hover, .folder:focus-visible, .open) .p1 {
		transform: rotate(-8deg) translate(-6%, -12%);
	}
	:is(.folder:hover, .folder:focus-visible, .open) .p2 {
		transform: rotate(7deg) translate(6%, -16%);
	}
	:is(.folder:hover, .folder:focus-visible, .open) .p3 {
		transform: translateY(-8%);
	}
	.folder:active .art {
		transform: scale(0.97);
	}
	.art {
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.name {
		max-inline-size: 100%;
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.count {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.front,
		.paper,
		.art {
			transition: none;
		}
	}
</style>
