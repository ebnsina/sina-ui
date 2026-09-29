<script lang="ts" generics="T">
	import { reduced } from './motion';
	interface Props {
		/** Names the wheel for screen readers ("Hours"). */
		label: string;
		items: { value: T; label: string }[];
		value: T;
		/** A word beside the chosen row, as iOS shows "hours", "min". */
		unit?: string;
		/** How each value is read aloud ("5 minutes"); the item's label by default. */
		spoken?: (value: T) => string;
		class?: string;
	}

	let { label, items, value = $bindable(), unit, spoken, class: className }: Props = $props();

	let wheel: HTMLDivElement;
	const ROW = 36;
	const index = $derived(
		Math.max(
			0,
			items.findIndex((i) => i.value === value)
		)
	);
	let settling = false;
	// Where a smooth turn is heading: quick key presses add up from there, not from where it was.
	let heading: number | undefined;

	/** Brings a row to the middle; the scroll itself then sets the value. */
	function goTo(i: number, smooth = true) {
		const to = Math.max(0, Math.min(items.length - 1, i));
		heading = to;
		const reduce = reduced();
		wheel.scrollTo({ top: to * ROW, behavior: smooth && !reduce ? 'smooth' : 'instant' });
	}

	// Turn to the value once the wheel is actually on screen: inside a closed dialog it has no size,
	// and a scroll there would report the first row and overwrite the value.
	let ready = false;
	$effect(() => {
		const seen = new ResizeObserver(() => {
			if (ready || !wheel.clientHeight) return;
			goTo(index, false);
			ready = true;
		});
		seen.observe(wheel);
		return () => seen.disconnect();
	});
	// Set from outside (a reset): turn to it.
	$effect(() => {
		const i = index;
		if (ready && !settling && Math.round(wheel.scrollTop / ROW) !== i) goTo(i);
	});

	let frame = 0;
	function onscroll() {
		if (!ready) return;
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			const i = Math.max(0, Math.min(items.length - 1, Math.round(wheel.scrollTop / ROW)));
			if (i === heading) heading = undefined;
			if (items[i].value !== value) {
				settling = true;
				value = items[i].value;
				queueMicrotask(() => (settling = false));
			}
		});
	}

	function onkeydown(e: KeyboardEvent) {
		const by: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
		if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			return goTo(e.key === 'Home' ? 0 : items.length - 1);
		}
		if (by[e.key] === undefined) return;
		e.preventDefault();
		goTo((heading ?? index) + by[e.key]);
	}
</script>

<div class={['picker', className]} style:--row="{ROW}px">
	<!-- A spin button: arrow keys turn it; the rows themselves are for the eye and the pointer. -->
	<div
		bind:this={wheel}
		class="wheel"
		role="spinbutton"
		tabindex="0"
		aria-label={label}
		aria-valuenow={index}
		aria-valuemin={0}
		aria-valuemax={items.length - 1}
		aria-valuetext={spoken ? spoken(value) : items[index]?.label}
		{onscroll}
		{onkeydown}
	>
		{#each items as item, i (i)}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class={['row', i === index && 'chosen']} aria-hidden="true" onclick={() => goTo(i)}>
				{item.label}
			</div>
		{/each}
	</div>
	{#if unit}<span class="unit" aria-hidden="true">{unit}</span>{/if}
</div>

<style>
	.picker {
		position: relative;
		display: flex;
		align-items: center;
		color: var(--ui-fg);
		font: 400 1.375rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	/* Five rows tall, the chosen one in the middle; padding lets the first and last reach it. */
	.wheel {
		block-size: calc(var(--row) * 5);
		min-inline-size: 3.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		scroll-snap-type: y mandatory;
		scrollbar-width: none;
		padding-block: calc(var(--row) * 2);
		box-sizing: border-box;
		outline: none;
		perspective: 400px;
		/* Rows fade toward the edges, like the curve of a drum. */
		mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent);
	}
	.wheel::-webkit-scrollbar {
		display: none;
	}
	.wheel:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
		border-radius: var(--ui-radius);
	}
	.row {
		display: grid;
		place-items: center end;
		block-size: var(--row);
		padding-inline: 0.5rem;
		scroll-snap-align: center;
		color: var(--ui-muted);
		cursor: pointer;
		transition: color 120ms ease;
	}
	.chosen {
		color: var(--ui-fg);
	}
	/* Where supported, rows tilt away as they leave the middle: a real drum, driven by the scroll. */
	@supports (animation-timeline: view()) {
		.row {
			animation: drum linear both;
			animation-timeline: view();
		}
		@keyframes drum {
			0% {
				transform: rotateX(55deg) scale(0.9);
			}
			50% {
				transform: none;
			}
			100% {
				transform: rotateX(-55deg) scale(0.9);
			}
		}
	}
	.unit {
		min-inline-size: 3rem;
		padding-inline-start: 0.375rem;
		font-size: 1rem;
		font-weight: 600;
	}
	@media (prefers-reduced-motion: reduce) {
		.row {
			animation: none;
		}
	}
</style>
