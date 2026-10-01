<script lang="ts">
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import * as Dropdown from './dropdown/index';

	interface Props {
		variant?: 'primary' | 'secondary';
		size?: 'sm' | 'md' | 'lg';
		/** The main action. */
		onclick?: (e: MouseEvent) => void;
		/** Dropdown.Item elements for the related actions. */
		menu: Snippet;
		/** The chevron's name for screen readers. */
		menuLabel?: string;
		disabled?: boolean;
		children: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		onclick,
		menu,
		menuLabel = 'More options',
		disabled = false,
		children,
		class: className
	}: Props = $props();

	let open = $state(false);
	let group = $state<HTMLDivElement>();
	let dropdown = $state<ReturnType<typeof Dropdown.Root>>();
</script>

<div class={['split', open && 'open', className]} role="group" bind:this={group}>
	<Button
		{variant}
		{size}
		{disabled}
		onclick={(e: MouseEvent) => {
			open = false;
			onclick?.(e);
		}}
		onkeydown={(e: KeyboardEvent) => {
			// Menu button pattern: ArrowDown on the main action opens the related ones.
			if (e.key === 'ArrowDown' && !disabled) {
				e.preventDefault();
				dropdown?.show('first');
			}
		}}>{@render children()}</Button
	>
	<Dropdown.Root bind:this={dropdown} bind:open anchor={group}>
		{#snippet trigger(props)}
			<Button {variant} {size} {disabled} square aria-label={menuLabel} class="chevron" {...props}>
				<Icon icon={ArrowDown01Icon} size={16} />
			</Button>
		{/snippet}
		{@render menu()}
	</Dropdown.Root>
</div>

<style>
	/* Presses as one piece: the halves never shrink apart and open a gap between them. */
	.split {
		display: inline-flex;
		isolation: isolate;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.split:has(:global(.btn:active)) {
		scale: 0.97;
	}
	.split > :global(.btn:active),
	.split :global(.chevron:active) {
		transform: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.split:has(:global(.btn:active)) {
			scale: 1;
		}
	}
	/* Joined: the inner corners square off; the outer ones keep the control radius. */
	.split > :global(.btn:first-child) {
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}
	.split :global(.chevron) {
		position: relative;
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}
	/* The divider: a 1px line in the text color, faint, inset from top and bottom. */
	.split :global(.chevron)::before {
		content: '';
		position: absolute;
		inset-block: 25%;
		inset-inline-start: -0.5px;
		inline-size: 1px;
		background: currentColor;
		opacity: 0.25;
	}
	.split :global(.chevron svg) {
		transition: transform var(--ui-dur) var(--ui-ease-out);
	}
	.open :global(.chevron svg) {
		transform: rotate(180deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.split :global(.chevron svg) {
			transition: none;
		}
	}
</style>
