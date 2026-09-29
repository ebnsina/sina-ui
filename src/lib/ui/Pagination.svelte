<script lang="ts" module>
	/**
	 * The page numbers to show, always the same count (2 × siblings + 5) once there are enough pages,
	 * so the buttons never shift under the pointer while clicking through.
	 */
	export function pageRange(page: number, count: number, siblings = 1): (number | 'gap')[] {
		const slots = 2 * siblings + 5;
		const span = (from: number, to: number) =>
			Array.from({ length: to - from + 1 }, (_, i) => from + i);
		if (count <= slots) return span(1, count);
		if (page <= siblings + 3) return [...span(1, slots - 2), 'gap', count];
		if (page >= count - siblings - 2) return [1, 'gap', ...span(count - slots + 3, count)];
		return [1, 'gap', ...span(page - siblings, page + siblings), 'gap', count];
	}
</script>

<script lang="ts">
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import { glide } from './glide';

	interface Props {
		/** Current page, from 1. */
		page?: number;
		count: number;
		/** Pages shown either side of the current one. */
		siblings?: number;
		/** Links: each page is an <a> to this URL (works without JavaScript). Without it, buttons. */
		href?: (page: number) => string;
		/** Names the navigation; say which list it pages through when there's more than one. */
		label?: string;
	}

	let { page = $bindable(1), count, siblings = 1, href, label = 'Pagination' }: Props = $props();

	const items = $derived(pageRange(page, count, siblings));
	let list: HTMLElement;
	let highlight: HTMLSpanElement;
	let animate = false;

	// The current-page marker glides to the new page; the first placement snaps.
	$effect(() => {
		// Re-run after the page (and so the marked item) changes.
		void [page, items];
		glide(highlight, list.querySelector<HTMLElement>('[aria-current="page"]'), animate, 240);
		animate = true;
	});

	function go(to: number) {
		page = Math.min(Math.max(1, to), count);
	}
</script>

{#snippet step(to: number, text: string, icon: typeof ArrowLeft01Icon, disabled: boolean)}
	{#if href}
		<!-- A disabled link has no href: still announced as a link, but inert. -->
		<a
			class="item step"
			href={disabled ? undefined : href(to)}
			role={disabled ? 'link' : undefined}
			aria-disabled={disabled || undefined}
			aria-label={text}
			onclick={() => !disabled && go(to)}><Icon {icon} size={16} class="flip" /></a
		>
	{:else}
		<!-- aria-disabled, not disabled: a focused button that becomes disabled drops focus to the page. -->
		<button
			type="button"
			class="item step"
			aria-label={text}
			aria-disabled={disabled || undefined}
			onclick={() => !disabled && go(to)}><Icon {icon} size={16} class="flip" /></button
		>
	{/if}
{/snippet}

<nav aria-label={label} bind:this={list}>
	<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
	<ol>
		<li>{@render step(page - 1, 'Previous page', ArrowLeft01Icon, page <= 1)}</li>
		{#each items as item, i (item === 'gap' ? `gap-${i}` : item)}
			<li>
				{#if item === 'gap'}
					<span class="gap" aria-hidden="true">…</span>
				{:else if href}
					<a
						class="item"
						href={href(item)}
						aria-label="Page {item}"
						aria-current={item === page ? 'page' : undefined}
						onclick={() => go(item)}>{item}</a
					>
				{:else}
					<button
						type="button"
						class="item"
						aria-label="Page {item}"
						aria-current={item === page ? 'page' : undefined}
						onclick={() => go(item)}>{item}</button
					>
				{/if}
			</li>
		{/each}
		<li>{@render step(page + 1, 'Next page', ArrowRight01Icon, page >= count)}</li>
	</ol>
</nav>

<style>
	nav {
		position: relative;
	}
	ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font: 0.9375rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	.item,
	.gap {
		box-sizing: border-box;
		display: inline-grid;
		place-items: center;
		min-inline-size: 2.25rem;
		block-size: 2.25rem;
		padding: 0 0.5rem;
	}
	@media (pointer: coarse) {
		.item,
		.gap {
			min-inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	/* Phones: all nine slots fit one row (9 × 2rem) instead of wrapping the next arrow. */
	@media (max-width: 30rem) {
		ol {
			gap: 0.125rem;
		}
		.item,
		.gap {
			min-inline-size: 2rem;
			padding: 0 0.25rem;
		}
	}
	.item {
		position: relative;
		margin: 0;
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-fg);
		font: inherit;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.item:not([aria-current], :disabled, [aria-disabled='true']):hover {
			background: var(--ui-subtle);
		}
	}
	.item:active:not(:disabled, [aria-disabled='true']) {
		transform: scale(0.96);
	}
	.item:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* The current page reads through the marker gliding beneath it. */
	.item[aria-current='page'] {
		color: var(--ui-on-accent);
		font-weight: 600;
		cursor: default;
	}
	.item:disabled,
	.item[aria-disabled='true'] {
		color: var(--ui-muted);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.step {
		color: var(--ui-muted);
	}
	.gap {
		color: var(--ui-muted);
	}
	.highlight {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius);
		background: var(--ui-accent);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}
	nav :global(.flip:dir(rtl)) {
		transform: scaleX(-1);
	}
	@media (forced-colors: active) {
		.item[aria-current='page'] {
			outline: 2px solid Highlight;
		}
	}
</style>
