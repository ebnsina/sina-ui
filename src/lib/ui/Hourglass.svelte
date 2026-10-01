<script lang="ts">
	import { reduced } from './motion';
	import Widget from './Widget.svelte';
	import { announce } from './announce';
	import { chime } from './chime';
	import Button from './Button.svelte';
	import Segmented from './Segmented.svelte';
	import RollingNumber from './RollingNumber.svelte';

	interface Props {
		/** How long the sand takes to run through, in seconds. */
		seconds?: number;
		/** Quick picks, in minutes. */
		presets?: number[];
		label?: string;
		locale?: string;
		class?: string;
	}

	let {
		seconds = 60,
		presets = [1, 3, 5],
		label = 'Hourglass',
		locale = 'en',
		class: className
	}: Props = $props();

	const uid = $props.id();
	// svelte-ignore state_referenced_locally
	let length = $state(seconds * 1000);
	// How much sand is in the top bulb, 0 to 1; everything else lies in the bottom.
	let top = $state(0);
	let running = $state(false);
	let flipping = $state(false);
	let lastAt = 0;
	let frame = 0;

	const left = $derived(top * length);
	const two = $derived(new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }));
	const shown = $derived.by(() => {
		// At rest with all the sand below, it shows its length: ready to be flipped.
		const total = Math.ceil((top > 0 ? left : length) / 1000);
		return `${Math.floor(total / 60)}:${two.format(total % 60)}`;
	});

	function loop(now: number) {
		top = Math.max(0, top - (now - lastAt) / length);
		lastAt = now;
		if (top > 0) frame = requestAnimationFrame(loop);
		else {
			running = false;
			chime(2);
			announce('The sand has run out', 'assertive');
		}
	}
	function run() {
		if (top <= 0) return;
		lastAt = performance.now();
		frame = requestAnimationFrame(loop);
		running = true;
	}
	function pause() {
		cancelAnimationFrame(frame);
		running = false;
	}

	/** Turns the glass over: the sand goes with it, and what had fallen is now the top. */
	function flip() {
		pause();
		if (reduced()) return landed();
		flipping = true;
	}
	function landed() {
		flipping = false;
		top = 1 - top;
		run();
	}
	function choose(min: number) {
		pause();
		length = min * 60_000;
		top = 0;
	}
	$effect(() => () => cancelAnimationFrame(frame));

	// Sand in the picture: the top sits against the neck, dimpling as it drains; the bottom heaps up.
	const NECK = 80;
	const FULL = 56;
	const topY = $derived(NECK - top * FULL);
	const pile = $derived((1 - top) * FULL);
	// The top funnels into the neck as it drains; near the end the funnel reaches right down.
	const dip = $derived(Math.min(NECK - topY, 4 + (1 - top) * 14));
	// Height of the mound's surface at x: highest in the middle, falling away to the walls.
	const surface = (x: number) => 144 - pile * (0.55 + 0.4 * (1 - ((x - 50) / 50) ** 2));

	// Grains: a fixed pool of circles moved directly each frame, so a stream of thousands never
	// re-renders the page. Each falls from the neck, speeding up, lands and rolls a little down the slope.
	type Grain = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		r: number;
		rolling: number;
		alive: boolean;
	};
	const POOL = 60;
	const grains: Grain[] = Array.from({ length: POOL }, () => ({
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		r: 0,
		rolling: 0,
		alive: false
	}));
	let layer = $state<SVGGElement>();
	let grainFrame = 0;
	let grainAt = 0;
	let spawnDebt = 0;
	function stepGrains(now: number) {
		const dt = Math.min(0.05, (now - grainAt) / 1000);
		grainAt = now;
		let alive = 0;
		// About 110 grains a second while sand is falling.
		if (running && top > 0) spawnDebt += dt * 110;
		for (const g of grains) {
			if (!g.alive && spawnDebt >= 1) {
				spawnDebt -= 1;
				Object.assign(g, {
					x: 50 + (Math.random() - 0.5) * 1.2,
					y: NECK + 0.5,
					vx: (Math.random() - 0.5) * 3,
					vy: 6 + Math.random() * 6,
					r: 0.28 + Math.random() * 0.32,
					rolling: 0,
					alive: true
				});
			}
			if (!g.alive) continue;
			alive++;
			if (g.rolling > 0) {
				// On the mound: slide sideways and settle onto the surface, fading into the heap.
				g.rolling -= dt;
				g.x += g.vx * dt;
				g.vx *= 0.9;
				g.y = surface(g.x) - g.r;
				if (g.rolling <= 0) g.alive = false;
			} else {
				g.vy += 750 * dt;
				g.x += g.vx * dt;
				g.y += g.vy * dt;
				if (g.y >= surface(g.x) - g.r) {
					g.rolling = 0.15 + Math.random() * 0.25;
					g.vx = (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 14);
				}
			}
		}
		const dots = layer?.children;
		if (dots)
			grains.forEach((g, i) => {
				const c = dots[i] as SVGCircleElement;
				c.setAttribute('cx', g.x.toFixed(2));
				c.setAttribute('cy', g.y.toFixed(2));
				c.setAttribute('r', g.r.toFixed(2));
				c.style.opacity = g.alive
					? g.rolling > 0
						? String(Math.min(1, g.rolling * 5))
						: '1'
					: '0';
			});
		grainFrame = alive || (running && top > 0) ? requestAnimationFrame(stepGrains) : 0;
	}
	// Grains run while sand falls, and a moment after so the last ones land.
	$effect(() => {
		if (!running || grainFrame || reduced()) return;
		grainAt = performance.now();
		grainFrame = requestAnimationFrame(stepGrains);
	});
	$effect(() => () => cancelAnimationFrame(grainFrame));
</script>

<Widget {label} tone="var(--ui-accent)" max="36rem" class={className}>
	<div class={['hourglass']}>
		<svg
			viewBox="0 0 100 160"
			role="img"
			aria-label={top > 0 ? `${label}, ${shown} left` : `${label}, all the sand has fallen`}
		>
			<defs>
				<!-- Sand: lighter where the light catches the top, deeper below, with a fine grain. -->
				<linearGradient id="{uid}-sand" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#e7bd6a" />
					<stop offset="1" stop-color="#c9933a" />
				</linearGradient>
				<filter id="{uid}-grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="2.2"
						numOctaves="2"
						seed="7"
						result="noise"
					/>
					<feColorMatrix
						in="noise"
						type="matrix"
						values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 0.55 -0.12"
						result="specks"
					/>
					<feComposite in="specks" in2="SourceGraphic" operator="in" result="grain" />
					<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /></feMerge>
				</filter>
				<clipPath id="{uid}-glass">
					<path
						d="M22,16 C22,56 46,68 47.5,80 C46,92 22,104 22,144 L78,144 C78,104 54,92 52.5,80 C54,68 78,56 78,16 Z"
					/>
				</clipPath>
			</defs>
			<!-- Everything inside turns when flipped: glass, frame and sand together. -->
			<g
				class={['body', flipping && 'turning']}
				ontransitionend={(e) => e.propertyName === 'rotate' && flipping && landed()}
			>
				<g clip-path="url(#{uid}-glass)">
					<rect class="glass" x="0" y="0" width="100" height="160" />
					<g class="sand" fill="url(#{uid}-sand)" filter="url(#{uid}-grain)">
						<!-- Top: level at the walls, sinking into a funnel over the neck as it drains. -->
						{#if top > 0}
							<path
								d="M0,{NECK} L0,{topY} L{50 - 20},{topY} C{50 - 9},{topY} {50 - 3},{topY +
									dip} 50,{topY + dip} C{50 + 3},{topY + dip} {50 + 9},{topY} {50 +
									20},{topY} L100,{topY} L100,{NECK} Z"
							/>
						{/if}
						<!-- Bottom: a mound, highest where the stream lands. -->
						<path
							d="M0,144 L0,{144 - pile * 0.55} Q50,{144 - pile * 1.35} 100,{144 -
								pile * 0.55} L100,144 Z"
						/>
					</g>
					{#if running && top > 0}
						<!-- A faint thread for the stream's body; the grains give it life. -->
						<line class="stream" x1="50" y1={NECK} x2="50" y2={surface(50)} />
					{/if}
					<g class="grains" bind:this={layer} aria-hidden="true">
						{#each Array.from({ length: 60 }, (_, i) => i) as i (i)}<circle
								r="0"
								style:opacity="0"
							/>{/each}
					</g>
				</g>
				<path
					class="rim"
					d="M22,16 C22,56 46,68 47.5,80 C46,92 22,104 22,144 L78,144 C78,104 54,92 52.5,80 C54,68 78,56 78,16 Z"
				/>
				<!-- A glint down the left of the glass, so it reads as glass. -->
				<path class="glint" d="M27,24 C27,50 40,64 45,75 M45,85 C40,96 27,110 27,136" />
				<rect class="post" x="15.5" y="15" width="2.5" height="130" rx="1.25" />
				<rect class="post" x="82" y="15" width="2.5" height="130" rx="1.25" />
				<rect class="cap" x="10" y="7" width="80" height="9" rx="4.5" />
				<rect class="cap" x="10" y="144" width="80" height="9" rx="4.5" />
			</g>
		</svg>

		<div class="side">
			<p class="readout" role="timer" aria-live="off" aria-label="{shown} left">
				<RollingNumber value={shown} />
			</p>
			<Segmented
				label="Length"
				hideLabel
				options={presets.map((p) => ({ value: String(p), label: `${p} min` }))}
				bind:value={() => String(length / 60_000), (v) => choose(Number(v))}
				disabled={running || flipping}
			/>
			<div class="actions">
				{#if running}
					<Button variant="secondary" onclick={pause}>Pause</Button>
				{:else}
					<Button variant="secondary" onclick={run} disabled={top <= 0 || flipping}>Resume</Button>
				{/if}
				<Button onclick={flip} disabled={flipping}>Flip</Button>
			</div>
		</div>
	</div>
</Widget>

<style>
	.hourglass {
		display: grid;
		justify-items: center;
		gap: 1rem;
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
	}
	svg {
		inline-size: 9rem;
		overflow: visible;
	}
	.body {
		transform-origin: 50px 80px;
		transform-box: view-box;
	}
	/* The flip: a weighty turn, slow at both ends, like lifting and setting down a real glass. */
	.turning {
		rotate: 180deg;
		transition: rotate 750ms cubic-bezier(0.65, 0, 0.35, 1);
	}
	.glass {
		fill: var(--ui-subtle);
	}
	/* Caps and posts in quiet neutrals: dark on a light card, silver on a dark one. */
	.cap {
		fill: color-mix(in srgb, var(--ui-fg) 80%, var(--ui-surface));
	}
	.post {
		fill: var(--ui-muted);
	}
	.glint {
		fill: none;
		stroke: rgb(255 255 255 / 0.6);
		stroke-width: 1.2;
		stroke-linecap: round;
	}
	.side {
		display: grid;
		justify-items: center;
		gap: 1rem;
	}
	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		inline-size: min(100%, 16rem);
	}
	.actions :global(.btn) {
		inline-size: 100%;
	}
	.rim {
		fill: none;
		stroke: var(--ui-control-line);
		stroke-width: 1.2;
	}
	.stream {
		stroke: #d6a24b;
		stroke-width: 0.7;
		opacity: 0.55;
	}
	.grains circle {
		fill: #d19a45;
	}
	.readout {
		margin: 0;
		color: var(--tone);
		font: 200 2.5rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	/* Desktop: the glass on the left, time and controls beside it. */
	@container widget (min-width: 30rem) {
		.hourglass {
			grid-template-columns: auto auto;
			justify-content: center;
			align-items: center;
			column-gap: 3.5rem;
		}
		.side {
			justify-items: start;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.grains {
			display: none;
		}
	}
</style>
