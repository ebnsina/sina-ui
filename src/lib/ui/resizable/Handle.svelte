<script lang="ts">
	import { getGroup } from './context';

	interface Props {
		/** What it resizes, for screen readers ("Resize the catalog"). */
		label: string;
	}

	let { label }: Props = $props();
	const group = getGroup();
	let el: HTMLDivElement;
	// The panels either side, found in the page: a handle sits between the two it resizes.
	let before = $state('');
	let after = $state('');
	$effect(() => {
		before = (el.previousElementSibling as HTMLElement | null)?.dataset.panel ?? '';
		after = (el.nextElementSibling as HTMLElement | null)?.dataset.panel ?? '';
	});

	const horizontal = $derived(group.orientation === 'horizontal');
	const size = $derived(Math.round(group.size(before)));
	const panel = $derived(group.panel(before));
	let dragging = $state(false);

	function ondrag(e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		el.setPointerCapture(e.pointerId);
		dragging = true;
		const a = el.previousElementSibling as HTMLElement;
		const b = el.nextElementSibling as HTMLElement;
		const length = (x: HTMLElement) => (horizontal ? x.offsetWidth : x.offsetHeight);
		// Percent per pixel, from the two panels being resized.
		const scale = (group.size(before) + group.size(after)) / Math.max(1, length(a) + length(b));
		const rtl = horizontal && getComputedStyle(el).direction === 'rtl' ? -1 : 1;
		let last = horizontal ? e.clientX : e.clientY;
		const move = (m: PointerEvent) => {
			const now = horizontal ? m.clientX : m.clientY;
			group.move(before, after, (now - last) * scale * rtl, true);
			last = now;
		};
		const up = () => {
			dragging = false;
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerup', up);
			el.removeEventListener('pointercancel', up);
		};
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerup', up);
		el.addEventListener('pointercancel', up);
	}

	function onkeydown(e: KeyboardEvent) {
		const rtl = horizontal && getComputedStyle(el).direction === 'rtl';
		const step = e.shiftKey ? 10 : 5;
		const grow = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
		const shrink = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
		const act: Record<string, () => void> = {
			[grow]: () => group.move(before, after, step),
			[shrink]: () => group.move(before, after, -step),
			Home: () => group.move(before, after, -100),
			End: () => group.move(before, after, 100),
			Enter: () => group.toggle(before, after)
		};
		if (!act[e.key]) return;
		e.preventDefault();
		act[e.key]();
	}
</script>

<!-- The window splitter pattern: a focusable separator whose value is the size of the panel before it. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	bind:this={el}
	class={['handle', horizontal ? 'across' : 'down', dragging && 'dragging']}
	role="separator"
	tabindex="0"
	aria-label={label}
	aria-orientation={horizontal ? 'vertical' : 'horizontal'}
	aria-controls={before || undefined}
	aria-valuenow={size}
	aria-valuemin={panel?.collapsible ? 0 : (panel?.min ?? 0)}
	aria-valuemax={panel?.max ?? 100}
	onpointerdown={ondrag}
	ondblclick={() => group.reset(before, after)}
	{onkeydown}
>
	<span class="grip" aria-hidden="true"></span>
</div>

<style>
	/* A hairline you can grab: the hit area is wider than the line it draws. */
	.handle {
		position: relative;
		flex: none;
		display: grid;
		place-items: center;
		touch-action: none;
		outline: none;
	}
	.across {
		inline-size: 1px;
		cursor: col-resize;
	}
	.down {
		block-size: 1px;
		cursor: row-resize;
	}
	.handle::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ui-line);
		transition: background-color var(--ui-dur) ease;
	}
	/* 12px to grab (more by touch), centered on the line. */
	.handle::after {
		content: '';
		position: absolute;
		z-index: 1;
	}
	.across::after {
		inset: 0 -6px;
	}
	.down::after {
		inset: -6px 0;
	}
	@media (pointer: coarse) {
		.across::after {
			inset: 0 -12px;
		}
		.down::after {
			inset: -12px 0;
		}
	}
	.grip {
		position: relative;
		z-index: 1;
		border-radius: 999px;
		background: var(--ui-control-line);
		opacity: 0;
		scale: 0.8;
		transition:
			opacity var(--ui-dur) ease,
			scale var(--ui-dur) var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	.across .grip {
		inline-size: 4px;
		block-size: 1.5rem;
	}
	.down .grip {
		inline-size: 1.5rem;
		block-size: 4px;
	}
	@media (hover: hover) and (pointer: fine) {
		.handle:hover .grip {
			opacity: 1;
			scale: 1;
		}
	}
	.handle:focus-visible .grip,
	.dragging .grip {
		opacity: 1;
		scale: 1;
		background: var(--ui-accent);
	}
	.handle:focus-visible::before,
	.dragging::before {
		background: var(--ui-accent);
	}
	.handle:focus-visible .grip {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
