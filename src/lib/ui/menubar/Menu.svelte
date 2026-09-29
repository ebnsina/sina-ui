<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dropdown from '../dropdown/Dropdown.svelte';
	import { getMenubar, type MenubarEntry } from './context';

	interface Props {
		/** The menu's name in the bar ("File"). */
		label: string;
		/** Menubar.Item and Menubar.Separator. */
		children: Snippet;
	}

	let { label, children }: Props = $props();
	const bar = getMenubar();
	let open = $state(false);
	let dropdown = $state<ReturnType<typeof Dropdown>>();
	let button = $state<HTMLButtonElement>()!;

	const entry: MenubarEntry = {
		button: () => button,
		menu: () => document.getElementById(button.getAttribute('aria-controls') ?? ''),
		isOpen: () => open,
		setOpen: (v) => (open = v),
		closeNow: () => dropdown?.closeNow(),
		show: (at) => dropdown?.show(at)
	};
	$effect(() => bar.register(entry));
	$effect(() => {
		if (open) bar.opened(entry);
	});
</script>

<Dropdown bind:this={dropdown} bind:open>
	{#snippet trigger(props)}
		<button
			bind:this={button}
			type="button"
			{...props}
			role="menuitem"
			tabindex={bar.isTabStop(entry) ? 0 : -1}
			class="name"
			onkeydown={(e) => {
				if (e.key === 'Home' || e.key === 'End') {
					e.preventDefault();
					bar.move(entry, e.key === 'Home' ? 'first' : 'last');
				} else props.onkeydown?.(e as never);
			}}
			onpointerenter={() => {
				// With a menu open, pointing at another name opens it: no second click needed.
				if (!open && bar.anyOpen()) dropdown?.show('menu');
			}}>{label}</button
		>
	{/snippet}
	{@render children()}
</Dropdown>

<style>
	.name {
		min-block-size: 2rem;
		margin: 0;
		padding: 0 0.75rem;
		border: 0;
		border-radius: calc(var(--ui-radius) - 0.125rem);
		background: none;
		color: var(--ui-fg);
		font: 500 0.875rem/1 var(--ui-font);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (pointer: coarse) {
		.name {
			min-block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.name:hover {
			background: var(--ui-hover);
		}
	}
	.name[aria-expanded='true'] {
		background: var(--ui-surface);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
	}
	.name:active {
		transform: scale(0.97);
	}
	.name:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
</style>
