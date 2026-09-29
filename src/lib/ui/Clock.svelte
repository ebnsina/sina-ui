<script lang="ts">
	import { onMount } from 'svelte';
	import { now } from './now.svelte';
	import RollingNumber from './RollingNumber.svelte';

	interface Props {
		/** An IANA time zone ("Asia/Baghdad"); the reader's own by default. */
		timeZone?: string;
		/** A place name shown under it ("Baghdad"). */
		label?: string;
		/** led: seven-segment digits on a dark panel, like a bedside clock. */
		variant?: 'analog' | 'digital' | 'led';
		/** The lit colour of an led clock. */
		color?: string;
		seconds?: boolean;
		/** Diameter of the analog face, in px. */
		size?: number;
		locale?: string;
		class?: string;
	}

	let {
		timeZone,
		label,
		variant = 'analog',
		color = 'color-mix(in srgb, var(--ui-accent) 55%, #fff)',
		seconds = true,
		size = 144,
		locale = 'en',
		class: className
	}: Props = $props();

	// The time only exists in the browser: until then, an empty face instead of a wrong time.
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const t = $derived(mounted ? new Date(now()) : undefined);

	const parts = $derived.by(() => {
		if (!t) return undefined;
		const p = new Intl.DateTimeFormat('en', {
			timeZone,
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hourCycle: 'h23'
		}).formatToParts(t);
		const n = (type: string) => Number(p.find((x) => x.type === type)?.value);
		return { h: n('hour'), m: n('minute'), s: n('second') };
	});
	const shown = $derived(
		t &&
			new Intl.DateTimeFormat(locale, {
				timeZone,
				hour: 'numeric',
				minute: '2-digit',
				second: seconds ? '2-digit' : undefined
			}).format(t)
	);
	// For screen readers, to the minute: a label that changed every second would be noise.
	const spoken = $derived(
		t && new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit' }).format(t)
	);

	// How far ahead or behind the reader's own clock ("3 hr ahead"), for world clocks.
	const offset = $derived.by(() => {
		if (!t || !timeZone || !parts) return '';
		const here = t.getHours() * 60 + t.getMinutes();
		let diff = parts.h * 60 + parts.m - here;
		if (diff > 720) diff -= 1440;
		if (diff < -720) diff += 1440;
		if (diff === 0) return 'Same time';
		const hrs = new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: 'hour',
			unitDisplay: 'short',
			maximumFractionDigits: 1
		});
		return `${hrs.format(Math.abs(diff) / 60)} ${diff > 0 ? 'ahead' : 'behind'}`;
	});

	// Angles keep growing through the day, so a hand passing 12 carries on instead of spinning back.
	const sec = $derived(parts ? (parts.h * 3600 + parts.m * 60 + parts.s) * 6 : 0);
	const min = $derived(parts ? (parts.h * 60 + parts.m + parts.s / 60) * 6 : 0);
	const hr = $derived(parts ? (parts.h * 60 + parts.m) * 0.5 : 0);
	// Seven segments per digit (a–g, clockwise from the top, g across the middle).
	const SEGMENTS: Record<string, string> = {
		'0': 'abcdef',
		'1': 'bc',
		'2': 'abged',
		'3': 'abgcd',
		'4': 'fgbc',
		'5': 'afgcd',
		'6': 'afgedc',
		'7': 'abc',
		'8': 'abcdefg',
		'9': 'abcdfg'
	};
	const H = (x: number, y: number) =>
		`${x},${y + 1} ${x + 1},${y} ${x + 7},${y} ${x + 8},${y + 1} ${x + 7},${y + 2} ${x + 1},${y + 2}`;
	const V = (x: number, y: number) =>
		`${x + 1},${y} ${x + 2},${y + 1} ${x + 2},${y + 7} ${x + 1},${y + 8} ${x},${y + 7} ${x},${y + 1}`;
	const SHAPES: [string, string][] = [
		['a', H(2, 0)],
		['b', V(10, 1.5)],
		['c', V(10, 10.5)],
		['d', H(2, 18)],
		['e', V(0, 10.5)],
		['f', V(0, 1.5)],
		['g', H(2, 9)]
	];
	// Digits always Latin here: seven segments can only draw 0–9.
	const led = $derived.by(() => {
		if (!t) return { digits: ['', '', '', ''].concat(seconds ? ['', ''] : []), period: '' };
		const p = new Intl.DateTimeFormat(locale, {
			timeZone,
			hour: '2-digit',
			minute: '2-digit',
			second: seconds ? '2-digit' : undefined,
			numberingSystem: 'latn'
		}).formatToParts(t);
		const get = (type: string) => p.find((x) => x.type === type)?.value ?? '';
		const period = get('dayPeriod');
		const hour = get('hour').padStart(2, '0');
		// A 12-hour clock leaves its leading zero dark (" 7:40"), as real ones do; 24-hour keeps it.
		const digits = [
			period && hour[0] === '0' ? ' ' : hour[0],
			hour[1],
			...get('minute'),
			...(seconds ? [...get('second')] : [])
		];
		return { digits, period };
	});

	const night = $derived(!!parts && (parts.h < 6 || parts.h >= 18));
</script>

<figure class={['clock', variant, night && 'night', className]}>
	{#if variant === 'analog'}
		<svg
			viewBox="0 0 100 100"
			width={size}
			height={size}
			role="img"
			aria-label={spoken ? `${label ? `${label}, ` : ''}${spoken}` : label}
		>
			<circle class="face" cx="50" cy="50" r="49" />
			{#each Array.from({ length: 60 }, (_, i) => i) as i (i)}
				<line
					class={i % 5 ? 'tick' : 'hour-mark'}
					x1="50"
					y1={i % 5 ? 5 : 4}
					x2="50"
					y2={i % 5 ? 7.5 : 10}
					transform="rotate({i * 6} 50 50)"
				/>
			{/each}
			<g class={['hands', mounted && 'shown']}>
				<line class="hour" x1="50" y1="54" x2="50" y2="28" style:rotate="{hr}deg" />
				<line class="minute" x1="50" y1="56" x2="50" y2="15" style:rotate="{min}deg" />
				{#if seconds}
					<g class="second" style:rotate="{sec}deg">
						<line x1="50" y1="60" x2="50" y2="12" />
					</g>
				{/if}
				<circle class="pin" cx="50" cy="50" r="2.2" />
			</g>
		</svg>
	{:else if variant === 'led'}
		<time class="panel" datetime={t?.toISOString()} style:--led={color}>
			<span class="sr-only">{spoken}</span>
			<span class="digits" aria-hidden="true">
				{#each led.digits as d, i (i)}
					{#if i === 2 || i === 4}
						<svg class="colon" viewBox="0 0 4 20"
							><circle
								cx="2"
								cy="6"
								r="1.4"
								class={['seg', parts && parts.s % 2 === 0 && 'on']}
							/><circle
								cx="2"
								cy="14"
								r="1.4"
								class={['seg', parts && parts.s % 2 === 0 && 'on']}
							/></svg
						>
					{/if}
					<svg class="digit" viewBox="-0.5 -0.5 13 21">
						{#each SHAPES as [name, points] (name)}
							<polygon {points} class={['seg', SEGMENTS[d]?.includes(name) && 'on']} />
						{/each}
					</svg>
				{/each}
			</span>
			{#if led.period}<span class="period" aria-hidden="true">{led.period}</span>{/if}
		</time>
	{:else}
		<time class="readout" datetime={t?.toISOString()} aria-label={spoken}>
			{#if shown}<RollingNumber value={shown} />{:else}––:––{/if}
		</time>
	{/if}
	{#if label || offset}
		<figcaption>
			{#if label}<span class="place">{label}</span>{/if}
			{#if offset}<span class="offset">{offset}</span>{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.clock {
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-fg);
		font: 0.875rem/1.3 var(--ui-font);
	}
	/* Day and night faces from the theme: a plain face by day, an accent-tinted one after dusk, so a
	   row of world clocks reads day and night at a glance. */
	.face {
		fill: var(--ui-subtle);
		transition: fill 600ms ease;
	}
	.night .face {
		fill: color-mix(in srgb, var(--ui-accent) 16%, var(--ui-surface));
	}
	.tick,
	.hour-mark {
		stroke: var(--ui-muted);
		stroke-linecap: round;
	}
	.tick {
		stroke-width: 0.6;
		opacity: 0.5;
	}
	.hour-mark {
		stroke-width: 1.6;
	}
	.hands line {
		stroke: var(--ui-fg);
		stroke-linecap: round;
	}
	.hands {
		opacity: 0;
		transition: opacity 400ms ease;
	}
	.hands.shown {
		opacity: 1;
	}
	.hands :is(line, g) {
		transform-origin: 50px 50px;
		transform-box: view-box;
	}
	.hour {
		stroke-width: 3.2;
	}
	.minute {
		stroke-width: 2;
	}
	/* The second hand ticks: a short, springy step each second, like a quartz movement. */
	.second {
		transition: rotate 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.hands .second line {
		stroke: var(--ui-accent);
		stroke-width: 0.9;
	}
	.pin {
		fill: var(--ui-accent);
	}
	.readout {
		font: 500 2rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
	}
	/* LED: a dark panel whatever the theme; unlit segments stay faintly visible, as on the real thing. */
	.panel {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: #0a0d0c;
		box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.6);
	}
	.digits {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		/* A slight slant, like a segment display; one soft glow over the lit segments. */
		transform: skewX(-6deg);
		filter: drop-shadow(0 0 3px color-mix(in srgb, var(--led) 55%, transparent));
	}
	.digit {
		inline-size: 1.75rem;
		block-size: 2.9rem;
	}
	.colon {
		inline-size: 0.5rem;
		block-size: 2.9rem;
	}
	.seg {
		fill: var(--led);
		opacity: 0.08;
		/* Segments fade on and off, as LEDs do, rather than jumping. */
		transition: opacity 140ms ease-out;
	}
	.seg.on {
		opacity: 1;
	}
	.period {
		color: var(--led);
		font: 600 0.75rem/1 var(--ui-font);
		letter-spacing: 0.06em;
		text-shadow: 0 0 6px var(--led);
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	figcaption {
		display: grid;
		justify-items: center;
		gap: 0.125rem;
	}
	.place {
		font-weight: 600;
	}
	.offset {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.second {
			transition: none;
		}
	}
</style>
