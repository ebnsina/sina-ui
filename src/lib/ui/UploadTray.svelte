<script lang="ts">
	import { reduced } from './motion';
	import { scrollEdges } from './scroll-edges';
	import { ArrowDown01Icon, ArrowUp01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { tick } from 'svelte';
	import { announce } from './announce';
	import Icon from './Icon.svelte';
	import { spring, springAt } from './spring';
	import UploadList from './UploadList.svelte';
	import type { Uploads } from './uploads.svelte';

	interface Props {
		uploads: Uploads;
		label?: string;
		locale?: string;
	}

	let { uploads, label = 'Uploads', locale = 'en' }: Props = $props();

	const id = $props.id();
	let open = $state(true);
	const percent = $derived(new Intl.NumberFormat(locale, { style: 'percent' }));

	const total = $derived(uploads.items.length);
	const failed = $derived(uploads.items.filter((u) => u.status === 'failed').length);
	const done = $derived(uploads.items.filter((u) => u.status === 'done').length);
	const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
	const heading = $derived(
		uploads.active
			? `Uploading ${plural(uploads.active, 'file')}`
			: failed
				? `${plural(failed, 'upload')} failed`
				: `${plural(done, 'upload')} done`
	);

	// Said once when the last upload settles, not on every percent.
	let wasActive = false;
	$effect(() => {
		const active = uploads.active > 0;
		if (wasActive && !active) announce(failed ? heading : `All ${plural(done, 'upload')} done.`);
		wasActive = active;
	});

	// A container transform, as the Dynamic Island does: the shell's size follows whichever view is
	// showing (a pill or the card) on a spring, and the views cross-fade inside it.
	let size = $state<{ w: number; h: number }>();
	let ready = $state(false);
	let closing = $state(false);
	let wasOpen = true;
	$effect.pre(() => {
		closing = wasOpen && !open;
		wasOpen = open;
	});
	const EASE = spring(0.16);
	const CLOSE = spring(0.04);
	// A pill when folded; open, the card's corners are concentric with the list's rows inside.
	const radius = (h: number) => (open ? 16 : h / 2);

	function measure(node: HTMLElement) {
		const fit = () => (size = { w: node.offsetWidth, h: node.offsetHeight });
		fit();
		requestAnimationFrame(() => (ready = true));
		const seen = new ResizeObserver(fit);
		seen.observe(node);
		return () => seen.disconnect();
	}

	// The view swaps under the button that was pressed; focus goes to its twin in the new view.
	let shell = $state<HTMLElement>();
	async function toggle() {
		open = !open;
		await tick();
		shell?.querySelector<HTMLElement>('.content:not([inert]) [aria-expanded]')?.focus();
	}

	const bouncy = springAt(0.25);
	function appear(_node: Element) {
		if (reduced()) return { duration: 150, css: (t: number) => `opacity: ${t}` };
		return {
			delay: closing ? 200 : 60,
			duration: 500,
			easing: bouncy,
			css: (t: number, u: number) =>
				`opacity: ${Math.min(1, t * 1.6)}; transform: scale(${0.94 + 0.06 * t}); filter: blur(${u * 5}px)`
		};
	}
	function vanish(node: Element) {
		(node as HTMLElement).inert = true;
		return { duration: reduced() ? 100 : 140, css: (t: number) => `opacity: ${t}` };
	}
	// Arrives from its corner as a small pill-shaped bloom rather than sliding in.
	function arrive(_node: Element) {
		if (reduced()) return { duration: 150, css: (t: number) => `opacity: ${t}` };
		return {
			duration: 450,
			easing: bouncy,
			css: (t: number) => `opacity: ${Math.min(1, t * 2)}; transform: scale(${0.6 + 0.4 * t})`
		};
	}
</script>

{#if total}
	<section
		bind:this={shell}
		class={['tray', ready && 'ready']}
		aria-labelledby="{id}-heading"
		style:width={size ? `${size.w}px` : undefined}
		style:height={size ? `${size.h}px` : undefined}
		style:border-radius={size ? `${radius(size.h)}px` : undefined}
		style:--ease={closing ? CLOSE : EASE}
		style:--dur={closing ? '380ms' : '600ms'}
		transition:arrive
	>
		{#key open}
			<div class={['content', open ? 'card' : 'pill']} {@attach measure} in:appear out:vanish>
				<header>
					{#if !open}
						<!-- A ring for overall progress stands in for the bar while folded. -->
						<svg class="ring" viewBox="0 0 20 20" aria-hidden="true">
							<circle class="track" cx="10" cy="10" r="8" />
							<circle
								class="done"
								cx="10"
								cy="10"
								r="8"
								pathLength="1"
								style:stroke-dashoffset={1 - uploads.progress}
							/>
						</svg>
					{/if}
					<div class="summary">
						<h2 id="{id}-heading">{heading}</h2>
						{#if uploads.active}
							<span class="overall">{percent.format(uploads.progress)}</span>
						{/if}
					</div>
					<button
						type="button"
						aria-expanded={open}
						aria-controls={open ? `${id}-body` : undefined}
						aria-label={open ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
						onclick={toggle}
					>
						<Icon icon={open ? ArrowDown01Icon : ArrowUp01Icon} size={18} />
					</button>
					<!-- Closing is only offered once nothing is still uploading. -->
					{#if !uploads.active}
						<button
							type="button"
							aria-label="Close {label.toLowerCase()}"
							onclick={() => uploads.clear()}
						>
							<Icon icon={Cancel01Icon} size={18} />
						</button>
					{/if}
				</header>
				{#if open}
					<span class="overall-bar" aria-hidden="true">
						<span class="fill" style:--p={uploads.progress}></span>
					</span>
					<div id="{id}-body" class="inner" {@attach scrollEdges} data-fade>
						<div class="pad"><UploadList {uploads} compact {locale} /></div>
					</div>
				{/if}
			</div>
		{/key}
	</section>
{/if}

<style>
	.tray {
		position: fixed;
		inset-block-end: max(1rem, env(safe-area-inset-bottom));
		inset-inline-end: 1rem;
		z-index: 40;
		overflow: hidden;
		border: 1px solid transparent;
		border-radius: 1rem;
		background: var(--ui-surface);
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
		transform-origin: 100% 100%;
		will-change: width, height;
	}
	.tray:dir(rtl) {
		transform-origin: 0 100%;
	}
	.ready {
		transition:
			width var(--dur) var(--ease),
			height var(--dur) var(--ease),
			border-radius var(--dur) var(--ease);
	}
	/* Views are pinned to the corner the tray grows from, so the morph unfolds from there. */
	.content {
		position: absolute;
		inset-block-end: 0;
		inset-inline-end: 0;
		transform-origin: 100% 100%;
	}
	.card {
		inline-size: min(22rem, 100vw - 2rem - 2px);
	}
	.pill {
		inline-size: max-content;
		max-inline-size: calc(100vw - 2rem - 2px);
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-block: 0.625rem;
		padding-inline: 1rem 0.5rem;
	}
	.pill header {
		gap: 0.5rem;
		padding-block: 0.375rem;
		padding-inline: 0.75rem 0.375rem;
	}
	.ring {
		flex: none;
		inline-size: 1.25rem;
		block-size: 1.25rem;
		rotate: -90deg;
	}
	.ring circle {
		fill: none;
		stroke-width: 2.5;
	}
	.ring .track {
		stroke: var(--ui-subtle);
	}
	.ring .done {
		stroke: var(--ui-accent);
		stroke-dasharray: 1;
		stroke-linecap: round;
		transition: stroke-dashoffset 300ms var(--ui-ease-out);
	}
	.summary {
		display: flex;
		flex: 1;
		align-items: baseline;
		gap: 0.5rem;
		min-inline-size: 0;
	}
	h2 {
		margin: 0;
		overflow: hidden;
		font-size: 0.9375rem;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.overall {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	header button {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 999px;
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur) ease;
	}
	.card header button {
		border-radius: calc(var(--ui-radius) - 0.125rem);
	}
	@media (pointer: coarse) {
		header button {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		header button:hover {
			background: var(--ui-subtle);
			color: var(--ui-fg);
		}
	}
	header button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	.overall-bar {
		display: block;
		block-size: 2px;
		background: var(--ui-subtle);
	}
	.fill {
		display: block;
		block-size: 100%;
		background: var(--ui-accent);
		transform: scaleX(var(--p));
		transform-origin: left;
		transition: transform 300ms var(--ui-ease-out);
	}
	.fill:dir(rtl) {
		transform-origin: right;
	}
	.inner {
		max-block-size: min(20rem, 50dvh);
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.pad {
		padding: 0.25rem 0.25rem 0.5rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.ready,
		.fill,
		.ring .done {
			transition: none;
		}
	}
</style>
