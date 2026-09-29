<script lang="ts">
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import { announce } from './announce';
	import { chime } from './chime';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import RollingNumber from './RollingNumber.svelte';
	import Widget from './Widget.svelte';

	interface Props {
		/** Starting length in minutes. */
		minutes?: number;
		/** The longest the ruler goes, in minutes. */
		max?: number;
		/** Names it for screen readers ("Tea timer"). */
		label?: string;
		locale?: string;
		class?: string;
	}

	let {
		minutes = 15,
		max = 60,
		label = 'Timer',
		locale = 'en',
		class: className
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let chosen = $state(minutes);
	let phase = $state<'idle' | 'running' | 'paused' | 'done'>('idle');
	let remaining = $state(0);
	// The end is a moment in time, so the countdown stays right while the tab sleeps.
	let endAt = 0;
	let frame = 0;
	let title = '';

	// Where the ruler stands, in minutes: the choice when idle, the time left once running.
	const at = $derived(phase === 'idle' ? chosen : remaining / 60_000);
	const two = $derived(new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }));
	const shown = $derived.by(() => {
		const total = phase === 'idle' ? chosen * 60 : Math.ceil(remaining / 1000);
		const h = Math.floor(total / 3600);
		const m = Math.floor(total / 60) % 60;
		return `${h ? `${h}:${two.format(m)}` : two.format(m)}:${two.format(total % 60)}`;
	});
	const spokenLength = $derived(
		new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'long' }).format(
			chosen
		)
	);

	function loop() {
		remaining = Math.max(0, endAt - performance.now());
		if (remaining > 0) frame = requestAnimationFrame(loop);
		else finish();
	}
	function start() {
		if (phase === 'idle') remaining = chosen * 60_000;
		endAt = performance.now() + remaining;
		frame = requestAnimationFrame(loop);
		phase = 'running';
	}
	function pause() {
		cancelAnimationFrame(frame);
		remaining = endAt - performance.now();
		phase = 'paused';
	}
	function finish() {
		phase = 'done';
		chime(3);
		announce("Time's up", 'assertive');
		title = document.title;
		document.title = `Time's up — ${title}`;
	}
	function cancel() {
		cancelAnimationFrame(frame);
		if (phase === 'done' && title) document.title = title;
		phase = 'idle';
	}
	$effect(() => () => {
		cancelAnimationFrame(frame);
		if (phase === 'done' && title) document.title = title;
	});

	// The ruler: a tick a minute, drawn in place and slid under a fixed pointer.
	// Ticks spread with the ruler's width: dense on a phone, roomier on a desktop card.
	let rulerWidth = $state(0);
	const GAP = $derived(Math.max(13, rulerWidth / 46));
	const set = (m: number) => (chosen = Math.max(1, Math.min(max, Math.round(m))));
	let dragging = $state(false);
	let dragFrom = 0;
	let dragValue = 0;
	let live = $state(0);
	const pos = $derived(dragging ? live : at);

	function ondown(e: PointerEvent) {
		if (phase !== 'idle' || e.button !== 0) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragging = true;
		dragFrom = e.clientX;
		dragValue = live = chosen;
	}
	function onmove(e: PointerEvent) {
		if (!dragging) return;
		live = Math.max(0, Math.min(max, dragValue - (e.clientX - dragFrom) / GAP));
	}
	function onup() {
		if (!dragging) return;
		dragging = false;
		set(live);
	}
	// Two-finger swipes and mouse wheels move it too, a minute per notch.
	let wheelRest = 0;
	function onwheel(e: WheelEvent) {
		if (phase !== 'idle') return;
		e.preventDefault();
		wheelRest += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / GAP;
		const whole = Math.trunc(wheelRest);
		if (whole) {
			set(chosen + whole);
			wheelRest -= whole;
		}
	}
	function onkeydown(e: KeyboardEvent) {
		if (phase !== 'idle') return;
		const by: Record<string, number> = {
			ArrowRight: 1,
			ArrowUp: 1,
			ArrowLeft: -1,
			ArrowDown: -1,
			PageUp: 5,
			PageDown: -5
		};
		if (e.key === 'Home') set(1);
		else if (e.key === 'End') set(max);
		else if (by[e.key] !== undefined) set(chosen + by[e.key]);
		else return;
		e.preventDefault();
	}
</script>

<Widget {label} tone="var(--ui-accent)" max="44rem" class={className}>
	<div class={['timer', phase]}>
		<!-- A slider: drag, swipe or use the arrow keys; locked while the timer runs. -->
		<div
			bind:clientWidth={rulerWidth}
			class={['ruler', dragging && 'dragging']}
			role="slider"
			tabindex={phase === 'idle' ? 0 : -1}
			aria-label="Length"
			aria-valuemin={1}
			aria-valuemax={max}
			aria-valuenow={chosen}
			aria-valuetext={spokenLength}
			aria-disabled={phase !== 'idle' || undefined}
			onpointerdown={ondown}
			onpointermove={onmove}
			onpointerup={onup}
			onpointercancel={onup}
			{onwheel}
			{onkeydown}
		>
			<div class="track" style:translate="{-pos * GAP}px 0" aria-hidden="true">
				{#each Array.from({ length: max + 1 }, (_, i) => i) as i (i)}
					<span
						class={['tick', i % 5 === 0 && 'major', i <= pos + 0.001 && 'lit']}
						style:left="{i * GAP}px"
					>
						{#if i % 5 === 0}<span class="num">{i}</span>{/if}
					</span>
				{/each}
			</div>
			<span class="pointer" aria-hidden="true"></span>
		</div>

		<div class="bottom">
			<div class="buttons">
				{#if phase === 'idle'}
					<Button size="lg" onclick={start}>Start Timer</Button>
				{:else if phase === 'running'}
					<Button variant="secondary" size="lg" onclick={pause}>Pause</Button>
				{:else if phase === 'paused'}
					<Button size="lg" onclick={start}>Resume</Button>
				{:else}
					<Button variant="secondary" size="lg" onclick={cancel}>Done</Button>
				{/if}
				{#if phase === 'running' || phase === 'paused'}
					<Button variant="ghost" size="lg" square aria-label="Cancel timer" onclick={cancel}>
						<Icon icon={Cancel01Icon} size={18} />
					</Button>
				{/if}
			</div>
			<p
				class="readout"
				role="timer"
				aria-live="off"
				aria-label="{shown} {phase === 'idle' ? 'set' : 'left'}"
			>
				<RollingNumber value={shown} />
			</p>
		</div>
	</div>
</Widget>

<style>
	/* Inside an iOS-style widget card, in the brand colour. */
	.timer {
		display: grid;
		gap: 1.25rem;
	}
	/* Desktop: a longer ruler shows more minutes, and the time reads from across the room. */
	@container widget (min-width: 34rem) {
		.ruler {
			block-size: 6rem;
		}
		.readout {
			font-size: 4.5rem;
		}
	}
	/* Phone: a little smaller all round. */
	@container widget (max-width: 22rem) {
		.readout {
			font-size: 2.25rem;
		}
	}
	.ruler {
		position: relative;
		block-size: 5.25rem;
		overflow: hidden;
		cursor: grab;
		touch-action: pan-y;
		outline: none;
		/* The ends blur away, as on iOS: fade plus a soft blur toward the edges. */
		mask-image: linear-gradient(to right, transparent, #000 22%, #000 78%, transparent);
	}
	.dragging {
		cursor: grabbing;
	}
	.ruler[aria-disabled='true'] {
		cursor: default;
	}
	.ruler:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
		border-radius: 0.75rem;
	}
	/* The track slides so the chosen minute sits over the pointer, dead centre. */
	.track {
		position: absolute;
		inset: 0 auto 0 50%;
		transition: translate 260ms var(--ui-ease-out);
	}
	.dragging .track,
	.running .track {
		transition: none;
	}
	.tick {
		position: absolute;
		top: 1.5rem;
		inline-size: 3px;
		block-size: 2.25rem;
		margin-inline-start: -1.5px;
		border-radius: 2px;
		background: color-mix(in srgb, var(--tone) 32%, transparent);
		transition: background-color 120ms ease;
	}
	.tick.lit {
		background: var(--tone);
	}
	.num {
		position: absolute;
		bottom: calc(100% + 0.375rem);
		left: 50%;
		translate: -50% 0;
		/* Minutes beyond the pointer recede to grey; still readable. */
		color: var(--ui-muted);
		font: 600 0.9375rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		transition: color 120ms ease;
	}
	.lit .num {
		color: var(--tone);
	}
	.pointer {
		position: absolute;
		bottom: 0.125rem;
		left: 50%;
		translate: -50% 0;
		inline-size: 0;
		block-size: 0;
		border-inline: 7px solid transparent;
		border-block-end: 10px solid var(--tone);
		border-radius: 2px;
	}
	.bottom {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.buttons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.readout {
		margin: 0;
		font: 200 3.25rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}
	.paused .readout {
		animation: breathe 2s ease-in-out infinite;
	}
	.done .readout {
		animation: pulse 900ms ease-in-out infinite;
	}
	@keyframes breathe {
		50% {
			opacity: 0.45;
		}
	}
	@keyframes pulse {
		50% {
			scale: 1.05;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			transition: none;
		}
		.paused .readout,
		.done .readout {
			animation: none;
		}
	}
</style>
