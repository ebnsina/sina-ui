<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getGroup, type PanelDef } from './context';

	interface Props {
		/** Starting size in percent of the group. */
		defaultSize?: number;
		/** Smallest it can be dragged to, in percent. */
		minSize?: number;
		maxSize?: number;
		/** Can be dragged (or Entered) shut, and opened again. */
		collapsible?: boolean;
		/** Names the panel; the handle beside it says what it resizes. */
		label?: string;
		children: Snippet;
		class?: string;
	}

	let {
		defaultSize,
		minSize = 10,
		maxSize = 100,
		collapsible = false,
		label,
		children,
		class: className
	}: Props = $props();
	const group = getGroup();
	const id = $props.id();

	// svelte-ignore state_referenced_locally
	const def: PanelDef = { id, defaultSize, min: minSize, max: maxSize, collapsible };
	$effect(() => group.register(def));
	const size = $derived(group.size(id));

	// Focusable only while its content overflows, so keyboard users can scroll it (and nothing else).
	let el: HTMLElement;
	let scrolls = $state(false);
	$effect(() => {
		const check = () =>
			(scrolls = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
		check();
		const resized = new ResizeObserver(check);
		resized.observe(el);
		for (const child of el.children) resized.observe(child);
		return () => resized.disconnect();
	});
</script>

<!-- Flex grow by percent: panels share what the handles leave, so sizes always add up. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section
	bind:this={el}
	{id}
	tabindex={scrolls && size > 0 ? 0 : undefined}
	data-panel={id}
	class={['panel', size === 0 && 'collapsed', className]}
	style:flex="{size} 1 0px"
	aria-label={label}
	inert={size === 0}
>
	{@render children()}
</section>

<style>
	.panel {
		min-inline-size: 0;
		min-block-size: 0;
		overflow: auto;
	}
	.collapsed {
		overflow: hidden;
	}
	.panel:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
</style>
