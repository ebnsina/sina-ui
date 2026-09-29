<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { glide } from '../glide';
	import { setNavMenu } from './context';

	interface Props {
		/** Names the navigation ("Main"). */
		label: string;
		/** NavigationMenu.Item and NavigationMenu.Link. */
		children: Snippet;
		class?: string;
	}

	let { label, children, class: className }: Props = $props();

	let root: HTMLElement;
	let backdrop: HTMLSpanElement;
	let open = $state<string>();
	let from = $state<-1 | 0 | 1>(0);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const trigger = (id: string) => root.querySelector<HTMLElement>(`[data-nav-item="${id}"]`);
	const panel = (id: string) => document.getElementById(`${id}-panel`);
	const order = (id: string) => [...root.querySelectorAll('[data-nav-item]')].indexOf(trigger(id)!);

	async function show(id: string | undefined) {
		clearTimeout(timer);
		if (id === open) return;
		const was = open;
		from = was && id ? (order(id) > order(was) ? 1 : -1) : 0;
		open = id;
		await tick();
		const el = id ? panel(id) : null;
		if (el) {
			// Under its item, kept on screen.
			const t = trigger(id!)!;
			el.style.left = '0px';
			const room = document.documentElement.clientWidth - 8 - root.getBoundingClientRect().left;
			el.style.left = `${Math.max(0, Math.min(t.offsetLeft, room - el.offsetWidth))}px`;
		}
		// One card glides and resizes between panels; it appears (and leaves) with a fade.
		glide(backdrop, el, !!was && !!el, 220);
	}

	setNavMenu({
		get open() {
			return open;
		},
		get from() {
			return from;
		},
		openNow: (id) => show(id),
		// Hover intent: passing across an item on the way somewhere else doesn't flash its panel open.
		openSoon(id) {
			clearTimeout(timer);
			if (open) show(id);
			else timer = setTimeout(() => show(id), 150);
		},
		toggle: (id) => show(open === id ? undefined : id),
		close(focusTrigger = false) {
			const was = open;
			show(undefined);
			if (focusTrigger && was) trigger(was)?.focus();
		}
	});
</script>

<svelte:document
	onpointerdown={(e) => {
		if (open && !root.contains(e.target as Node)) show(undefined);
	}}
/>

<!-- The handlers only watch the pointer, focus and Escape across the whole bar and its panels. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
	bind:this={root}
	aria-label={label}
	class={['nav', className]}
	onpointerenter={() => clearTimeout(timer)}
	onpointerleave={(e) => {
		if (e.pointerType === 'touch') return;
		// Leaving the bar and its panel closes it at once.
		show(undefined);
	}}
	onfocusout={(e) => {
		if (!root.contains(e.relatedTarget as Node | null)) show(undefined);
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			const was = open;
			show(undefined);
			trigger(was)?.focus();
		}
	}}
>
	<ul class="list">
		{@render children()}
	</ul>
	<span class="backdrop" aria-hidden="true" bind:this={backdrop}></span>
</nav>

<style>
	.nav {
		position: relative;
		z-index: 10;
		inline-size: fit-content;
		max-inline-size: 100%;
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
	}
	.list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	/* The card behind whichever panel is open: glides between them (see glide.ts). */
	.backdrop {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
		transform-origin: 0 0;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
	}
</style>
