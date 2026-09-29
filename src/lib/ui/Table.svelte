<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		/** Says what the table holds; shown above it and read as its name. */
		caption: string;
		/** Keep the caption for screen readers only, when a heading above already says it. */
		hideCaption?: boolean;
		/** Your <thead>, <tbody> and <tfoot>. Mark number cells class="num" to right-align them. */
		children: Snippet;
		class?: string;
	}

	let { caption, hideCaption = false, children, class: className }: Props = $props();
	const id = $props.id();
</script>

<!-- Scrolls sideways on narrow screens; focusable so keyboard users can scroll it too. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class={['table', className]}
	role="region"
	aria-labelledby="{id}-caption"
	tabindex="0"
	{@attach scrollEdges}
	data-fade="x"
>
	<table>
		<caption id="{id}-caption" class={{ hidden: hideCaption }}>{caption}</caption>
		{@render children()}
	</table>
</div>

<style>
	.table {
		overflow-x: auto;
		min-inline-size: 0;
		border-radius: var(--ui-radius);
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.table:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	table {
		inline-size: 100%;
		border-collapse: separate;
		border-spacing: 0;
	}
	caption {
		padding-block-end: 0.5rem;
		font-weight: 600;
		text-align: start;
	}
	.hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.table :global(:is(th, td)) {
		padding: 0.5rem 0.75rem;
		text-align: start;
		vertical-align: top;
	}
	.table :global(thead th) {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
	}
	/* A row's own name (scope="row") reads as the start of the row, not as a column heading. */
	.table :global(tbody th) {
		font-weight: 500;
		white-space: nowrap;
	}
	.table :global(.num) {
		text-align: end;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	/* Rows told apart by tint, not rules; the one under the pointer is easier to follow across. */
	.table :global(tbody tr:nth-child(odd) > *) {
		background: var(--ui-subtle);
	}
	.table :global(tbody tr > *) {
		transition: background-color var(--ui-dur-press) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.table :global(tbody tr:hover > *) {
			background: var(--ui-hover);
		}
	}
	.table :global(tbody tr > :first-child) {
		border-start-start-radius: calc(var(--ui-radius) - 0.125rem);
		border-end-start-radius: calc(var(--ui-radius) - 0.125rem);
	}
	.table :global(tbody tr > :last-child) {
		border-start-end-radius: calc(var(--ui-radius) - 0.125rem);
		border-end-end-radius: calc(var(--ui-radius) - 0.125rem);
	}
	/* Totals: set apart by weight and a little space, still no rule. */
	.table :global(tfoot :is(th, td)) {
		padding-block-start: 0.75rem;
		font-weight: 600;
	}
</style>
