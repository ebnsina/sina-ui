<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import { scrollEdges } from './scroll-edges';

	interface Props extends Omit<HTMLDialogAttributes, 'open' | 'title'> {
		open?: boolean;
		title: string;
		description?: string;
		/** Accessible name of the close button; translate it for non-English UIs. */
		closeLabel?: string;
		/** center: modal in the middle. start: full-height sheet sliding in from the reading-start edge. */
		side?: 'center' | 'start';
		/** false: no close button, and a press on the backdrop doesn't close it (confirmations). */
		dismissible?: boolean;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		closeLabel = 'Close',
		side = 'center',
		dismissible = true,
		children,
		footer,
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();
	let dialog: HTMLDialogElement;
	let pressedBackdrop = false;

	// showModal() gives focus trap, inert page, Escape and focus return for free.
	$effect(() => {
		if (open && !dialog.open) {
			dialog.showModal();
			// Start on the dialog itself, so its title is read first, not "Close, button" (React Aria);
			// unless something inside asks for focus (a confirmation's safe choice).
			if (!dialog.querySelector('[autofocus]')) dialog.focus();
		} else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	tabindex="-1"
	class={['dialog', side === 'start' && 'sheet', className]}
	aria-labelledby="{id}-title"
	aria-describedby={description ? `${id}-desc` : undefined}
	{@attach scrollEdges}
	data-fade-over
	{...rest}
	onclose={(e) => {
		open = false;
		rest.onclose?.(e);
	}}
	onpointerdown={(e) => (pressedBackdrop = e.target === dialog)}
	onclick={(e) => {
		// Only a press that starts and ends on the backdrop closes: text-selection drags don't.
		if (dismissible && pressedBackdrop && e.target === dialog) dialog.close();
		rest.onclick?.(e);
	}}
>
	<div class="body">
		<header>
			<h2 id="{id}-title">{title}</h2>
			{#if dismissible}
				<button type="button" class="close" aria-label={closeLabel} onclick={() => dialog.close()}>
					<Icon icon={Cancel01Icon} />
				</button>
			{/if}
		</header>
		{#if description}<p id="{id}-desc" class="desc">{description}</p>{/if}
		{@render children?.()}
		{#if footer}<footer>{@render footer()}</footer>{/if}
	</div>
</dialog>

<style>
	:global(html:has(dialog[open]:modal)) {
		overflow: hidden;
		scrollbar-gutter: stable;
	}

	.dialog {
		box-sizing: border-box;
		/* Padding lives on .body so a click on the dialog element itself always means the backdrop. */
		padding: 0;
		/* Explicit: CSS resets (Tailwind preflight etc.) zero the UA margin that centres a modal dialog. */
		margin: auto;
		inline-size: min(32rem, 100vw - 2rem);
		max-block-size: calc(100dvh - 2rem);
		overflow: auto;
		overscroll-behavior: contain;
		/* Invisible normally; outlines the dialog in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.75);
		background: var(--ui-surface-overlay);
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
	}
	.dialog::backdrop {
		background: var(--ui-backdrop);
	}
	.body {
		padding: 1.25rem 1.5rem 1.5rem;
	}
	header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}
	header:not(:has(+ .desc)) {
		margin-block-end: 1rem;
	}
	h2 {
		margin: 0.25rem 0 0;
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
		text-wrap: balance;
	}
	.desc {
		margin: 0.375rem 0 1rem;
		color: var(--ui-muted);
	}
	.close {
		box-sizing: border-box;
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		margin-block-start: -0.25rem;
		margin-inline-end: -0.5rem;
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: transparent;
		color: var(--ui-muted);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.close {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (hover: hover) {
		.close:hover {
			background: var(--ui-subtle);
			color: var(--ui-fg);
		}
	}
	.close:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	footer {
		display: flex;
		flex-wrap: wrap-reverse;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-block-start: 1.5rem;
	}

	/* Focused itself on open so its title is read first; that isn't a control, so no ring. */
	.dialog:focus {
		outline: none;
	}
	/* Modal recipe: centred scale + fade, backdrop fading with it so they read as one surface. */
	.dialog,
	.dialog::backdrop {
		opacity: 0;
		transition-property: opacity, scale, overlay, display;
		transition-duration: var(--ui-dur-overlay);
		transition-timing-function: var(--ui-ease-out);
		transition-behavior: allow-discrete;
	}
	.dialog {
		scale: 0.96;
	}
	.dialog[open],
	.dialog[open]::backdrop {
		opacity: 1;
	}
	.dialog[open] {
		scale: 1;
	}
	@starting-style {
		.dialog[open],
		.dialog[open]::backdrop {
			opacity: 0;
		}
		.dialog[open] {
			scale: 0.96;
		}
	}

	/* Sheet: pinned to the start edge, slides in on the iOS drawer curve; mirrors in RTL. */
	.sheet {
		--from: -100%;
		margin: 0;
		margin-inline-end: auto;
		inline-size: min(20rem, 100vw - 3rem);
		block-size: 100dvh;
		max-block-size: 100dvh;
		border-radius: 0;
		opacity: 1;
		scale: 1;
		translate: var(--from) 0;
		transition-property: translate, overlay, display;
		transition-timing-function: var(--ui-ease-drawer);
	}
	.sheet:dir(rtl) {
		--from: 100%;
	}
	.sheet[open] {
		translate: 0 0;
	}
	@starting-style {
		.sheet[open] {
			opacity: 1;
			scale: 1;
			translate: var(--from) 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dialog,
		.dialog[open] {
			scale: 1;
		}
		.sheet,
		.sheet[open] {
			translate: 0 0;
		}
	}
</style>
