<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import { get } from 'svelte/store';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		items: T[];
		/** A stable id for each item, so rows keep their measured height when the list changes. */
		key: (item: T) => string | number;
		/** Names the list ("Catalogue"). */
		label: string;
		/** A guess at a row's height in px; real heights are measured as rows appear. */
		estimate?: number;
		/** Space between rows, in px. */
		gap?: number;
		/** Height of the scrolling box: any CSS length. */
		height?: string;
		/** Called when the last rows come into view: load the next page here. */
		onend?: () => void;
		children: Snippet<[T, number]>;
		/** After the rows: a loading line, or "that's everything". */
		footer?: Snippet;
		class?: string;
	}

	let {
		items,
		key,
		label,
		estimate = 48,
		gap = 0,
		height = '24rem',
		onend,
		children,
		footer,
		class: className
	}: Props = $props();

	let scroller = $state<HTMLDivElement>();
	// Only the rows in view (and a few either side) exist in the page, however long the list.
	// svelte-ignore state_referenced_locally
	const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: items.length,
		getScrollElement: () => scroller ?? null,
		estimateSize: () => estimate,
		overscan: 8,
		gap,
		getItemKey: (i) => key(items[i]),
		// Row measurements land on the next frame, so resizing never loops within one.
		useAnimationFrameWithResizeObserver: true
	});
	// Keeps the count in step with items. Writes without subscribing: setOptions updates the store,
	// and an effect reading it would run again forever.
	$effect(() => {
		const count = items.length;
		untrack(() => {
			const v = get(virtualizer);
			v.setOptions({ ...v.options, count, getItemKey: (i) => key(items[i]) });
		});
	});

	const rows = $derived($virtualizer.getVirtualItems());
	// Near the end, ask for more: once per length, so a slow load isn't asked twice.
	let askedAt = -1;
	$effect(() => {
		const last = rows.at(-1)?.index ?? -1;
		if (onend && last >= items.length - 5 && askedAt !== items.length) {
			askedAt = items.length;
			onend();
		}
	});

	// Measured once per row as it appears (untracked for the same reason as above).
	const measure = (node: HTMLDivElement) => {
		untrack(() => get(virtualizer).measureElement(node));
	};
</script>

<!-- Focusable so the keyboard can scroll it: a scroll area has to be (axe's scrollable-region-focusable). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={scroller}
	class={['virtual', className]}
	style:block-size={height}
	role="group"
	aria-label={label}
	tabindex="0"
	{@attach scrollEdges}
	data-fade
>
	<div class="track" style:block-size="{$virtualizer.getTotalSize()}px">
		<!-- The list is the rows alone, so a footer (loading, the end) can sit outside it. -->
		<div
			class="window"
			role="list"
			aria-label={label}
			style:transform="translateY({rows[0]?.start ?? 0}px)"
		>
			{#each rows as row (row.key)}
				<div
					role="listitem"
					aria-setsize={items.length}
					aria-posinset={row.index + 1}
					data-index={row.index}
					style:margin-block-end="{gap}px"
					{@attach measure}
				>
					{@render children(items[row.index], row.index)}
				</div>
			{/each}
		</div>
	</div>
	{@render footer?.()}
</div>

<style>
	.virtual {
		overflow-y: auto;
		overscroll-behavior: contain;
		/* Rows paint without the whole list being laid out. */
		contain: strict;
		outline: none;
	}
	.virtual:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.track {
		position: relative;
		inline-size: 100%;
	}
	.window {
		position: absolute;
		inset: 0 0 auto;
	}
</style>
