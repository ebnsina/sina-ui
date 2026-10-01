<script lang="ts" module>
	export type Announcement = {
		text: string;
		/** A call to action: a link with href, or a button with onclick. */
		link?: string;
		href?: string;
		onclick?: () => void;
		/** A live countdown to a moment, e.g. the end of a sale. */
		countdown?: { to: Date | string | number; label?: string };
	};
</script>

<script lang="ts">
	import { ArrowRight02Icon, Cancel01Icon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { ms } from './motion';
	import RollingNumber from './RollingNumber.svelte';
	import { load, save } from './stored';

	interface Props {
		/** One message, or several that take turns. */
		messages: Announcement[];
		/** inverted: dark on a light page (light on a dark one). */
		tone?: 'inverted' | 'accent' | 'neutral' | 'warning';
		/** Remembers a dismissal in this browser under this key; change the key to show a new one. */
		persist?: string;
		dismissible?: boolean;
		/** Milliseconds each message shows when there are several. */
		interval?: number;
		label?: string;
		ondismiss?: () => void;
		class?: string;
	}

	let {
		messages,
		tone = 'inverted',
		persist,
		dismissible = true,
		interval = 6000,
		label = 'Announcements',
		ondismiss,
		class: className
	}: Props = $props();

	let open = $state(true);
	let gone = $state(false);
	let current = $state(0);
	let left = $state<number>();
	// Held by hover or focus (to read), or by the pause button (for good).
	let held = $state(false);
	let paused = $state(false);
	let now = $state(Date.now());

	onMount(() => {
		if (persist && load(persist, false)) gone = true;
	});

	// The ring's own animation is the timer: when it completes, the next message comes. Pausing it
	// pauses both, so the ring always shows exactly how long is left.
	function next() {
		left = current;
		current = (current + 1) % messages.length;
	}

	const hasCountdown = $derived(messages.some((m) => m.countdown));
	$effect(() => {
		if (!hasCountdown) return;
		const t = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(t);
	});
	const pad = (n: number) => String(n).padStart(2, '0');
	function remaining(to: Date | string | number) {
		const s = Math.max(0, Math.floor((new Date(to).getTime() - now) / 1000));
		return {
			done: s === 0,
			d: Math.floor(s / 86400),
			h: pad(Math.floor(s / 3600) % 24),
			m: pad(Math.floor(s / 60) % 60),
			s: pad(s % 60)
		};
	}
	const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

	function dismiss() {
		open = false;
		// Leaves the page once it has folded shut.
		setTimeout(() => (gone = true), ms(360));
		if (persist) save(persist, true);
		ondismiss?.();
	}
</script>

{#if !gone}
	<!-- Dismissed, it fades, then folds shut (rows 1fr → 0fr) so the page closes up under it. -->
	<section
		class={['announcement', tone, !open && 'closing', className]}
		aria-label={label}
		onpointerenter={() => (held = true)}
		onpointerleave={() => (held = false)}
		onfocusin={() => (held = true)}
		onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && (held = false)}
	>
		<div class="inner">
			<div class="bar">
				{#if messages.length > 1}
					<!-- Time to the next message, drawn round the pause button. -->
					<button
						type="button"
						class="ring"
						aria-label={paused ? 'Play announcements' : 'Pause announcements'}
						onclick={() => (paused = !paused)}
					>
						{#key current}
							<svg viewBox="0 0 20 20" aria-hidden="true">
								<circle class="track" cx="10" cy="10" r="8.5" />
								<circle
									class="fill"
									cx="10"
									cy="10"
									r="8.5"
									pathLength="1"
									style:animation-duration="{interval}ms"
									style:animation-play-state={held || paused || !open ? 'paused' : 'running'}
									onanimationend={next}
								/>
							</svg>
						{/key}
						<span class="glyph"><Icon icon={paused ? PlayIcon : PauseIcon} size={10} /></span>
					</button>
				{/if}

				<div class="viewport">
					{#each messages as m, i (i)}
						<div
							class={['face', i === current && 'on', i === left && 'left']}
							role="group"
							aria-label="{i + 1} of {messages.length}"
							aria-hidden={i !== current}
							inert={i !== current}
						>
							<p class="message">
								<span class="text">{m.text}</span>
								{#if m.countdown}
									{@const r = remaining(m.countdown.to)}
									{#if !r.done}
										<span class="countdown">
											<span class="sr">
												{m.countdown.label ?? 'Ends'}
												{when.format(new Date(m.countdown.to))}
											</span>
											<span aria-hidden="true">{m.countdown.label ?? 'Ends in'}</span>
											<span class="time" aria-hidden="true">
												{#if r.d}<RollingNumber value={r.d} /><span class="unit">d</span><span
														class="gap"
													></span>{/if}<RollingNumber value={r.h} /><span class="sep">:</span
												><RollingNumber value={r.m} /><span class="sep">:</span><RollingNumber
													value={r.s}
												/>
											</span>
										</span>
									{/if}
								{/if}
								{#if m.link && (m.href || m.onclick)}
									{#if m.href}
										<a class="cta" href={m.href} onclick={m.onclick}
											>{m.link}<Icon icon={ArrowRight02Icon} size={14} /></a
										>
									{:else}
										<button type="button" class="cta" onclick={m.onclick}
											>{m.link}<Icon icon={ArrowRight02Icon} size={14} /></button
										>
									{/if}
								{/if}
							</p>
						</div>
					{/each}
				</div>

				{#if dismissible}
					<button type="button" class="icon" aria-label="Dismiss" onclick={dismiss}>
						<Icon icon={Cancel01Icon} size={16} />
					</button>
				{/if}
			</div>
		</div>
	</section>
{/if}

<style>
	.announcement {
		--bg: var(--ui-fg);
		--fg: var(--ui-bg);
		--muted: color-mix(in srgb, var(--ui-bg) 66%, transparent);
		display: grid;
		grid-template-rows: 1fr;
		color: var(--fg);
		font: 0.875rem/1.4 var(--ui-font);
		transition:
			grid-template-rows var(--ui-dur-overlay) var(--ui-ease-out) 80ms,
			opacity var(--ui-dur-exit) ease;
	}
	.accent {
		--bg: color-mix(in srgb, var(--ui-accent) 10%, var(--ui-surface));
		--fg: color-mix(in srgb, var(--ui-accent) 75%, var(--ui-fg));
		--muted: color-mix(in srgb, var(--fg) 85%, transparent);
	}
	.neutral {
		--bg: var(--ui-subtle);
		--fg: var(--ui-fg);
		--muted: var(--ui-muted);
	}
	.warning {
		--bg: color-mix(in srgb, var(--ui-warning) 12%, var(--ui-surface));
		--fg: color-mix(in srgb, var(--ui-warning) 85%, var(--ui-fg));
		--muted: color-mix(in srgb, var(--fg) 85%, transparent);
	}
	.closing {
		grid-template-rows: 0fr;
		opacity: 0;
	}
	.inner {
		min-block-size: 0;
		overflow: hidden;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: 2.75rem;
		padding: 0.375rem 0.5rem 0.375rem 0.875rem;
		/* Invisible normally; outlines it in Windows High Contrast. */
		border-block-end: 1px solid transparent;
		background: var(--bg);
	}
	.bar:has(.ring) {
		padding-inline-start: 0.375rem;
	}

	/* Every message in one cell, so the bar keeps the tallest one's height and never jumps. The old
	   one lifts away as the next rises from below, like a ticker. */
	.viewport {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
	}
	.face {
		display: flex;
		grid-area: 1 / 1;
		align-items: center;
		opacity: 0;
		translate: 0 1.25rem;
		visibility: hidden;
		transition:
			opacity 180ms ease,
			translate 0s 180ms,
			visibility 0s 180ms;
	}
	.left {
		translate: 0 -0.5rem;
		transition:
			opacity 180ms ease,
			translate 240ms var(--ui-ease-out),
			visibility 0s 240ms;
	}
	.on {
		opacity: 1;
		translate: 0 0;
		visibility: visible;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur-spring) var(--ui-ease-spring),
			visibility 0s;
	}
	.message {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.125rem 0.75rem;
		margin: 0;
		padding-block: 0.375rem;
		text-wrap: balance;
	}
	.text {
		min-inline-size: 0;
	}
	.countdown {
		display: inline-flex;
		align-items: baseline;
		gap: 0.375rem;
		color: var(--muted);
		white-space: nowrap;
	}
	.time {
		display: inline-flex;
		align-items: baseline;
		color: var(--fg);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.unit,
	.sep {
		color: var(--muted);
		font-weight: 400;
	}
	.unit {
		margin-inline-start: 1px;
	}
	.sep {
		padding-inline: 1px;
	}
	.gap {
		display: inline-block;
		inline-size: 0.4em;
	}
	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0;
		border: 0;
		border-radius: 4px;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
	}
	.cta :global(svg) {
		transition: translate var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.cta:hover :global(svg) {
			translate: 2px 0;
		}
	}
	.cta:dir(rtl) :global(svg) {
		scale: -1 1;
	}

	.icon,
	.ring {
		position: relative;
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur-press) ease,
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.icon:hover,
		.ring:hover {
			background: color-mix(in srgb, currentColor 14%, transparent);
			color: var(--fg);
		}
	}
	.icon:active,
	.ring:active {
		scale: 0.94;
	}
	.ring svg {
		inline-size: 1.25rem;
		block-size: 1.25rem;
		overflow: visible;
		rotate: -90deg;
	}
	.ring circle {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
	}
	.track {
		stroke-opacity: 0.25;
	}
	/* Linear: it is the time left, so it must move at a steady pace. */
	.fill {
		stroke-linecap: round;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation-name: ring;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}
	@keyframes ring {
		to {
			stroke-dashoffset: 0;
		}
	}
	.glyph {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	:is(.cta, .icon, .ring):focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 2px;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (pointer: coarse) {
		.icon,
		.ring {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.face,
		.left,
		.on {
			translate: 0 0;
		}
		.announcement {
			transition: opacity var(--ui-dur-exit) ease;
		}
	}
</style>
