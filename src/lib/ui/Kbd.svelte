<script lang="ts" module>
	// token → [Apple symbol, elsewhere, spoken name on Apple, spoken elsewhere, event.key]
	const KEYS: Record<string, [string, string, string, string, string]> = {
		mod: ['⌘', 'Ctrl', 'Command', 'Control', ''],
		ctrl: ['⌃', 'Ctrl', 'Control', 'Control', 'control'],
		shift: ['⇧', 'Shift', 'Shift', 'Shift', 'shift'],
		alt: ['⌥', 'Alt', 'Option', 'Alt', 'alt'],
		enter: ['↵', 'Enter', 'Return', 'Enter', 'enter'],
		esc: ['Esc', 'Esc', 'Escape', 'Escape', 'escape'],
		backspace: ['⌫', 'Backspace', 'Delete', 'Backspace', 'backspace'],
		tab: ['⇥', 'Tab', 'Tab', 'Tab', 'tab'],
		up: ['↑', '↑', 'Up arrow', 'Up arrow', 'arrowup'],
		down: ['↓', '↓', 'Down arrow', 'Down arrow', 'arrowdown'],
		left: ['←', '←', 'Left arrow', 'Left arrow', 'arrowleft'],
		right: ['→', '→', 'Right arrow', 'Right arrow', 'arrowright']
	};
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { isApple } from './announce';

	interface Props {
		/** A shortcut, one key per item: ['mod', 'K']. mod is ⌘ on Apple devices and Ctrl elsewhere. */
		keys?: string[];
		/** Or a single key written out: <Kbd>Esc</Kbd>. */
		children?: Snippet;
		class?: string;
	}

	let { keys, children, class: className }: Props = $props();

	// Apple symbols in the server render, swapped in the browser if it isn't a Mac or iPhone.
	let apple = $state(true);
	onMount(() => (apple = isApple()));

	const parts = $derived(
		(keys ?? []).map((k) => {
			const [sym, other, sayApple, sayOther, key] = KEYS[k.toLowerCase()] ?? [
				k,
				k,
				k,
				k,
				k.toLowerCase()
			];
			return {
				shown: apple ? sym : other,
				said: apple ? sayApple : sayOther,
				key: key || (apple ? 'meta' : 'control')
			};
		})
	);

	// Keys light up while they're held, so the shortcut can be tried right where it's shown.
	let held = $state<string[]>([]);
	function down(e: KeyboardEvent) {
		const k = e.key.toLowerCase();
		if (!held.includes(k)) held = [...held, k];
	}
	function up(e: KeyboardEvent) {
		const k = e.key.toLowerCase();
		// With ⌘ down, macOS sends no keyup for the other keys: releasing ⌘ lets go of them all.
		held = k === 'meta' ? [] : held.filter((h) => h !== k);
	}
</script>

<svelte:window
	onkeydown={keys ? down : undefined}
	onkeyup={keys ? up : undefined}
	onblur={() => (held = [])}
/>

{#if keys}
	<!-- Nested kbd is HTML's way to write a combination; it's read as one phrase ("Command+K"). -->
	<kbd class={['combo', className]}>
		<span class="sr-only">{parts.map((p) => p.said).join('+')}</span>
		{#each parts as p, i (i)}<kbd class={['key', held.includes(p.key) && 'held']} aria-hidden="true"
				>{p.shown}</kbd
			>{/each}
	</kbd>
{:else}
	<kbd class={['key', className]}>{@render children?.()}</kbd>
{/if}

<style>
	.combo {
		display: inline-flex;
		gap: 0.1875rem;
		vertical-align: baseline;
		font: inherit;
	}
	.key {
		display: inline-grid;
		place-items: center;
		box-sizing: border-box;
		min-inline-size: 1.375rem;
		block-size: 1.375rem;
		padding: 0 0.3rem;
		border-radius: calc(var(--ui-radius) * 0.6);
		background: var(--ui-subtle);
		/* A hint of a key's lower edge, drawn inside so it takes no space. */
		box-shadow: inset 0 -1px 0 var(--ui-line);
		color: var(--ui-muted);
		font: 500 0.75rem/1 var(--ui-font);
		white-space: nowrap;
		vertical-align: baseline;
		transition:
			translate 80ms ease-out,
			background-color 80ms ease-out,
			color 80ms ease-out,
			box-shadow 80ms ease-out;
	}
	.held {
		translate: 0 1px;
		background: color-mix(in srgb, var(--ui-accent) 16%, transparent);
		box-shadow: none;
		color: var(--ui-fg);
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.held {
			translate: none;
		}
	}
</style>
