<script lang="ts" module>
	import type { TextBoldIcon } from '@hugeicons/core-free-icons';

	export interface Toggle {
		value: string;
		label: string;
		/** With an icon, the button shows only the icon and the label becomes its tooltip. */
		icon?: typeof TextBoldIcon;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		/** Names the group for screen readers ("Text style"). */
		label: string;
		items: Toggle[];
		/** The values switched on. */
		value?: string[];
		size?: 'sm' | 'md';
	}

	let { label, items, value = $bindable([]), size = 'md' }: Props = $props();

	let bar: HTMLDivElement;
	// The one Tab stop: the last button used, else the first that can be used.
	let current = $state<string>();
	const stop = $derived(current ?? items.find((i) => !i.disabled)?.value);

	function toggle(v: string) {
		value = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
		current = v;
	}

	// Toolbar keys (WAI-ARIA): arrows move between buttons, mirrored right to left; Home/End jump.
	function onkeydown(e: KeyboardEvent) {
		const buttons = [...bar.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
		const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
		if (at < 0) return;
		const rtl = getComputedStyle(bar).direction === 'rtl';
		const next = {
			ArrowRight: at + (rtl ? -1 : 1),
			ArrowLeft: at + (rtl ? 1 : -1),
			Home: 0,
			End: buttons.length - 1
		}[e.key];
		if (next === undefined) return;
		e.preventDefault();
		const target = buttons[(next + buttons.length) % buttons.length];
		current = target.dataset.value;
		target.focus();
	}
</script>

{#snippet button(item: Toggle, extra: HTMLButtonAttributes = {})}
	<button
		type="button"
		class={['toggle', size, item.icon && 'square']}
		data-value={item.value}
		aria-pressed={value.includes(item.value)}
		aria-label={item.icon && !extra['aria-labelledby'] ? item.label : undefined}
		tabindex={item.value === stop ? 0 : -1}
		disabled={item.disabled}
		{...extra}
		onclick={() => toggle(item.value)}
	>
		{#if item.icon}<Icon icon={item.icon} size={size === 'sm' ? 16 : 18} />{:else}{item.label}{/if}
	</button>
{/snippet}

<!-- The buttons take focus, not the toolbar (one roving Tab stop). -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div bind:this={bar} role="toolbar" aria-label={label} class="group" {onkeydown}>
	{#each items as item (item.value)}
		{#if item.icon}
			<Tooltip text={item.label} labels>
				{#snippet trigger(props)}{@render button(item, props)}{/snippet}
			</Tooltip>
		{:else}
			{@render button(item)}
		{/if}
	{/each}
</div>

<style>
	/* A tray on a tint; pressed buttons lift onto the surface. No outlines. */
	/* Hugs its buttons even inside a grid or flex parent that would stretch it. */
	.group {
		display: inline-flex;
		inline-size: fit-content;
		justify-self: start;
		align-self: start;
		flex-wrap: wrap;
		gap: 0.125rem;
		padding: 0.1875rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
	}
	.toggle {
		display: inline-grid;
		place-items: center;
		box-sizing: border-box;
		min-block-size: 2.125rem;
		margin: 0;
		padding: 0 0.75rem;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius-control) - 0.1875rem);
		background: transparent;
		color: var(--ui-muted);
		font: 500 0.875rem/1 var(--ui-font);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			background-color var(--ui-dur) ease,
			color var(--ui-dur) ease,
			box-shadow var(--ui-dur) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.sm {
		min-block-size: 1.75rem;
		padding: 0 0.5rem;
		font-size: 0.8125rem;
	}
	.square {
		padding: 0;
		inline-size: 2.125rem;
	}
	.sm.square {
		inline-size: 1.75rem;
	}
	@media (pointer: coarse) {
		.toggle {
			min-block-size: 2.75rem;
		}
		.square {
			inline-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.toggle:not(:disabled):hover {
			color: var(--ui-fg);
		}
	}
	.toggle:active:not(:disabled) {
		transform: scale(0.94);
	}
	/* Lifts in dark mode too, like Segmented's thumb (the surface there is darker than the tray). */
	.toggle[aria-pressed='true'] {
		background: light-dark(var(--ui-surface), rgb(255 255 255 / 0.12));
		color: var(--ui-fg);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.08),
			0 1px 1px rgb(0 0 0 / 0.04);
	}
	.toggle:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 1px;
	}
	.toggle:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	@media (forced-colors: active) {
		.toggle[aria-pressed='true'] {
			outline: 2px solid Highlight;
		}
	}
</style>
