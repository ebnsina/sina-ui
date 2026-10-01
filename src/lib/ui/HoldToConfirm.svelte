<script lang="ts">
	import { Tick02Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import { ease } from './motion';
	import Morph from './Morph.svelte';

	interface Props {
		/** Runs once the hold completes. A promise keeps the button busy until it settles. */
		onconfirm: () => Promise<unknown> | unknown;
		children: Snippet;
		/** How long to hold, in milliseconds. */
		duration?: number;
		done?: string;
		variant?: 'primary' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		onconfirm,
		children,
		duration = 1200,
		done = 'Done',
		variant = 'danger',
		size,
		class: className
	}: Props = $props();

	const hint = $props.id();
	let status = $state<'idle' | 'working' | 'done'>('idle');
	let fill = $state<HTMLSpanElement>();
	let hold: Animation | undefined;
	let timer: ReturnType<typeof setTimeout>;
	$effect(() => () => {
		clearTimeout(timer);
		hold?.cancel();
	});

	// The fill is a solid copy of the button (white label and all) wiped in from the start edge,
	// so the label is readable on either side of the edge as it travels.
	const shut = () =>
		getComputedStyle(fill!).direction === 'rtl' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
	const reachedAt = (p: number) =>
		getComputedStyle(fill!).direction === 'rtl'
			? `inset(0 0 0 ${(1 - p) * 100}%)`
			: `inset(0 ${(1 - p) * 100}% 0 0)`;

	function start() {
		if (status !== 'idle' || hold || !fill) return;
		// Linear: the fill is the time left, so it must move at a steady pace.
		hold = fill.animate([{ clipPath: shut() }, { clipPath: 'inset(0 0 0 0)' }], {
			duration,
			easing: 'linear',
			fill: 'forwards'
		});
		hold.onfinish = complete;
	}
	function release() {
		if (!hold || hold.playState !== 'running' || !fill) return;
		// Let go early: it drains back quickly from wherever it had reached.
		const reached = Number(hold.currentTime) / duration;
		hold.cancel();
		hold = undefined;
		fill.animate([{ clipPath: reachedAt(reached) }, { clipPath: shut() }], {
			duration: 200,
			easing: ease.standard
		});
	}
	async function complete() {
		// Stays filled while it works and says it's done, then fades back to the light button.
		status = 'working';
		try {
			await onconfirm();
			status = 'done';
			announce(done);
			timer = setTimeout(reset, 1600);
		} catch {
			reset();
		}
	}
	function reset() {
		status = 'idle';
		const filled = hold;
		hold = undefined;
		if (!fill || !filled) return;
		fill.animate([{ opacity: 1 }, { opacity: 0 }], {
			duration: 240,
			easing: ease.standard
		}).onfinish = () => filled.cancel();
	}
	const isKey = (e: KeyboardEvent) => e.key === ' ' || e.key === 'Enter';
</script>

{#snippet label()}
	<Morph
		current={status}
		states={[
			{ key: 'idle', label: children },
			{ key: 'working', spinner: true },
			{ key: 'done', text: done, icon: Tick02Icon }
		]}
	/>
{/snippet}

<Button
	variant="ghost"
	{size}
	class={['hold', `hold-${variant}`, className].filter(Boolean).join(' ')}
	aria-describedby={hint}
	style="touch-action: none; -webkit-touch-callout: none"
	onpointerdown={(e: PointerEvent) => e.button === 0 && start()}
	onpointerup={release}
	onpointerleave={release}
	onpointercancel={release}
	oncontextmenu={(e: MouseEvent) => e.preventDefault()}
	onkeydown={(e: KeyboardEvent) => {
		if (!isKey(e)) return;
		e.preventDefault();
		if (!e.repeat) start();
	}}
	onkeyup={(e: KeyboardEvent) => isKey(e) && release()}
	onblur={release}
>
	{@render label()}
	<span class="fill" bind:this={fill} aria-hidden="true">{@render label()}</span>
</Button>
<span id={hint} class="hint">Press and hold to confirm</span>

<style>
	/* At rest a light tint of its color; holding fills it solid. */
	:global(.btn.ghost.hold) {
		--tone: var(--ui-danger);
		--on-tone: var(--ui-on-danger);
		overflow: hidden;
		background: color-mix(in srgb, var(--tone) 12%, transparent);
		color: color-mix(in srgb, var(--tone) 85%, var(--ui-fg));
	}
	:global(.btn.ghost.hold-primary) {
		--tone: var(--ui-accent);
		--on-tone: var(--ui-on-accent);
	}
	@media (hover: hover) and (pointer: fine) {
		:global(.btn.ghost.hold:hover) {
			background: color-mix(in srgb, var(--tone) 18%, transparent);
		}
	}
	/* Over the button's 1px border too, so no tinted ring shows round the solid fill. */
	.fill {
		position: absolute;
		inset: -1px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--tone);
		color: var(--on-tone);
		clip-path: inset(0 100% 0 0);
		pointer-events: none;
	}
	.fill:dir(rtl) {
		clip-path: inset(0 0 0 100%);
	}
	.hint {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
