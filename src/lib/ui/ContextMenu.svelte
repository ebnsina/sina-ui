<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import Dropdown from './dropdown/Dropdown.svelte';

	interface Props {
		/** Names the menu for screen readers ("Options for Book of Optics"). */
		label: string;
		/** The thing that has the menu. */
		children: Snippet;
		/** The menu: Dropdown.Item and Dropdown.Separator. */
		menu: Snippet;
		class?: string;
	}

	let { label, children, menu, class: className }: Props = $props();

	const id = $props.id();
	let area: HTMLDivElement;
	let open = $state(false);
	// Where the menu opens: the pointer, or the item's corner from the keyboard.
	let point = $state({ x: 0, y: 0 });

	async function openAt(x: number, y: number) {
		point = { x, y };
		// Open once the anchor has moved there, or the menu measures where it used to be.
		await tick();
		open = true;
	}

	// Focus comes back to the item once the menu closes, not to the invisible anchor.
	let wasOpen = false;
	$effect(() => {
		if (wasOpen && !open) area.focus({ preventScroll: true });
		wasOpen = open;
	});

	// Long press for touch: iOS Safari never sends contextmenu, so it's timed here.
	let press: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | undefined;
	function cancelPress() {
		if (press) clearTimeout(press.timer);
		press = undefined;
	}
</script>

<!-- Wraps your own content, so it takes no role of its own; it's focusable for Shift+F10. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
<div
	bind:this={area}
	class={['area', className]}
	tabindex="0"
	aria-describedby="{id}-how"
	oncontextmenu={(e) => {
		e.preventDefault();
		cancelPress();
		openAt(e.clientX, e.clientY);
	}}
	onkeydown={(e) => {
		if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
			e.preventDefault();
			const r = area.getBoundingClientRect();
			openAt(r.left + 8, r.top + Math.min(r.height, 32));
		}
	}}
	onpointerdown={(e) => {
		if (e.pointerType !== 'touch') return;
		press = {
			x: e.clientX,
			y: e.clientY,
			timer: setTimeout(() => {
				if (press) openAt(press.x, press.y);
				press = undefined;
			}, 500)
		};
	}}
	onpointermove={(e) => {
		// A finger that moves is scrolling, not pressing.
		if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress();
	}}
	onpointerup={cancelPress}
	onpointercancel={cancelPress}
>
	{@render children()}
	<span id="{id}-how" class="sr-only">Right-click, long-press or press Shift+F10 for options.</span>
</div>

<Dropdown bind:open>
	{#snippet trigger(props)}
		<!-- A zero-size anchor at the pointer: the menu opens from there, with the usual flipping. -->
		<button
			{...props}
			type="button"
			class="point"
			aria-label={label}
			tabindex="-1"
			style:left="{point.x}px"
			style:top="{point.y}px"
		></button>
	{/snippet}
	{@render menu()}
</Dropdown>

<style>
	.area {
		border-radius: var(--ui-radius);
		/* Stops iOS's own long-press callout, which would cover the menu. */
		-webkit-touch-callout: none;
	}
	.area:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.point {
		position: fixed;
		inline-size: 0;
		block-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		opacity: 0;
		pointer-events: none;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
