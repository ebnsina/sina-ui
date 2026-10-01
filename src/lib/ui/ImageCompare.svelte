<script lang="ts">
	import { ArrowLeftRightIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	interface Props {
		/** The two images (or anything) to compare, drawn to fill the same box. */
		before: Snippet;
		after: Snippet;
		beforeLabel?: string;
		afterLabel?: string;
		/** How much of "after" shows, 0–100. */
		value?: number;
		ratio?: string;
		class?: string;
	}

	let {
		before,
		after,
		beforeLabel = 'Before',
		afterLabel = 'After',
		value = $bindable(50),
		ratio = '4 / 3',
		class: className
	}: Props = $props();

	// Dragging follows the finger exactly; a click or a key glides to the new place.
	let dragging = $state(false);
</script>

<div
	class={['compare', dragging && 'dragging', className]}
	style:aspect-ratio={ratio}
	style:--split="{value}%"
>
	<div class="layer" aria-hidden="true">{@render before()}</div>
	<div class="layer after" aria-hidden="true">{@render after()}</div>
	<span class="tag start" aria-hidden="true">{beforeLabel}</span>
	<span class="tag end" aria-hidden="true">{afterLabel}</span>
	<span class="handle" aria-hidden="true"
		><span class="knob"><Icon icon={ArrowLeftRightIcon} size={16} /></span></span
	>
	<!-- A native range over the whole image: drag anywhere, arrow keys, and screen readers for free. -->
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		bind:value
		aria-label="Compare {beforeLabel} and {afterLabel}"
		aria-valuetext="{value}% {afterLabel}"
		onpointerdown={() => (dragging = true)}
		onpointerup={() => (dragging = false)}
		onpointercancel={() => (dragging = false)}
	/>
</div>

<style>
	.compare {
		position: relative;
		inline-size: 100%;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		direction: ltr;
		user-select: none;
		-webkit-user-select: none;
		touch-action: pan-y;
	}
	.layer {
		position: absolute;
		inset: 0;
	}
	.layer > :global(*) {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.after,
	.handle {
		transition:
			clip-path var(--ui-dur-spring) var(--ui-ease-spring),
			translate var(--ui-dur-spring) var(--ui-ease-spring);
	}
	.after {
		clip-path: inset(0 0 0 var(--split));
	}
	/* As wide as the image, so translate by --split lands its left edge (the line) on the split. */
	.handle {
		position: absolute;
		inset: 0;
		translate: var(--split) 0;
		pointer-events: none;
	}
	.handle::before {
		content: '';
		position: absolute;
		inset-block: 0;
		left: -1px;
		inline-size: 2px;
		background: #fff;
		box-shadow: 0 0 0 1px rgb(0 0 0 / 0.08);
	}
	.dragging .after,
	.dragging .handle {
		transition: none;
	}
	.knob {
		position: absolute;
		inset-block-start: 50%;
		left: 0;
		display: grid;
		place-items: center;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		border-radius: var(--ui-radius-control);
		background: #fff;
		box-shadow: var(--ui-shadow-xs);
		color: #0f172a;
		translate: -50% -50%;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.dragging .knob {
		scale: 0.94;
	}
	.tag {
		position: absolute;
		inset-block-end: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: calc(var(--ui-radius-control) - 0.125rem);
		background: rgb(0 0 0 / 0.55);
		color: #fff;
		font: 500 0.75rem/1.2 var(--ui-font);
		pointer-events: none;
	}
	.start {
		left: 0.75rem;
	}
	.end {
		right: 0.75rem;
	}
	input {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		margin: 0;
		opacity: 0;
		cursor: ew-resize;
	}
	/* The ring goes on the knob, where the eye already is. */
	.compare:has(input:focus-visible) .knob {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	@media (prefers-reduced-motion: reduce) {
		.after,
		.handle,
		.knob {
			transition: none;
		}
	}
</style>
