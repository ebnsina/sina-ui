<script lang="ts">
	import { reduced } from './motion';
	import { onMount } from 'svelte';

	interface Props {
		/** What the voice is doing; the liquid moves to match. */
		mode?: 'idle' | 'listening' | 'thinking' | 'speaking';
		/** Loudness, 0 to 1: the microphone while listening, the voice while speaking. */
		level?: number;
		/** Names it for screen readers ("Assistant"); its state is read after. */
		label?: string;
		/** sm 32, md 64, lg 160, xl 240, or any diameter in px. */
		size?: 'sm' | 'md' | 'lg' | 'xl' | number;
		/** The liquid's colour: any CSS colour. */
		color?: string;
		class?: string;
	}

	let {
		mode = 'idle',
		level = 0,
		label = 'Assistant',
		size = 'lg',
		color = 'var(--ui-accent)',
		class: className
	}: Props = $props();

	const id = $props.id();
	const px = $derived(typeof size === 'number' ? size : { sm: 32, md: 64, lg: 160, xl: 240 }[size]);
	// The streaks are blurred in the orb's own units; a small orb gets a lighter hand so it stays crisp.
	const blur = $derived(px < 80 ? '0.5 1.8' : '0.8 2.8');
	// Safe inside url(#…) references.
	const uid = id.replaceAll(/[^a-zA-Z0-9_-]/g, '');
	// Three waves, back to front: each lower, more opaque, moving at its own pace.
	const layers = [
		{ depth: -9, speed: 0.6, opacity: 0.3, freq: 0.7 },
		{ depth: -2, speed: -0.8, opacity: 0.55, freq: 0.9 },
		{ depth: 6, speed: 1, opacity: 1, freq: 1.1 }
	];
	let paths = $state(layers.map(() => ''));

	// Each state's waterline, wave height and pace; the drawn values ease toward them so changes flow.
	const targets = {
		idle: { line: 52, amp: 4.5, pace: 0.6 },
		listening: { line: 46, amp: 5.5, pace: 1 },
		thinking: { line: 50, amp: 5, pace: 2.4 },
		speaking: { line: 44, amp: 6.5, pace: 1.4 }
	};
	let line = 52;
	let amp = 4.5;
	let pace = 0.6;
	let loud = 0;

	function wave(t: number, i: number) {
		const l = layers[i];
		const y0 = line + l.depth - loud * 6;
		const a = amp * (1 + loud * 0.7);
		let d = `M -5 110 L -5 ${y0.toFixed(2)}`;
		for (let x = -5; x <= 105; x += 2) {
			const y =
				y0 +
				Math.sin((x / 100) * Math.PI * 2 * l.freq + t * l.speed * pace) * a +
				Math.sin((x / 100) * Math.PI * 23 + t * l.speed * pace * 2.3 + i) * a * 0.06;
			d += ` L ${x} ${y.toFixed(2)}`;
		}
		return `${d} L 105 110 Z`;
	}

	onMount(() => {
		const still = reduced();
		let frame = 0;
		let t = 0;
		let last = performance.now();
		const draw = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const target = targets[mode];
			const k = 1 - Math.exp(-dt * 4);
			line += (target.line - line) * k;
			amp += (target.amp - amp) * k;
			pace += (target.pace - pace) * k;
			// Loudness rises fast and falls slowly, as meters do.
			const heard = mode === 'listening' || mode === 'speaking' ? level : 0;
			loud += (heard - loud) * (heard > loud ? 1 - Math.exp(-dt * 18) : k);
			t += dt;
			paths = layers.map((_, i) => wave(t, i));
			if (!still) frame = requestAnimationFrame(draw);
		};
		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	});

	const words = {
		idle: 'ready',
		listening: 'listening',
		thinking: 'thinking',
		speaking: 'speaking'
	};
</script>

<div
	class={['orb', mode, className]}
	style:--size="{px}px"
	style:--c={color}
	role="img"
	aria-label="{label}, {words[mode]}"
>
	<svg viewBox="0 0 100 100" aria-hidden="true">
		<defs>
			<clipPath id="{uid}-clip"><circle cx="50" cy="50" r="50" /></clipPath>
			<!-- Blurred far more up and down than across: the waterline smears into fine vertical streaks. -->
			<filter id="{uid}-soft" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur stdDeviation={blur} />
			</filter>
		</defs>
		<g clip-path="url(#{uid}-clip)">
			<rect class="sky" width="100" height="100" />
			<g filter="url(#{uid}-soft)">
				{#each paths as d, i (i)}
					<path {d} class="liquid" style:opacity={layers[i].opacity} />
				{/each}
			</g>
		</g>
	</svg>
</div>

<style>
	.orb {
		position: relative;
		inline-size: var(--size);
		block-size: var(--size);
		border-radius: 50%;
		overflow: hidden;
		transition: transform 400ms var(--ui-ease-out);
	}
	/* Active, it swells a touch. */
	.listening,
	.speaking {
		transform: scale(1.03);
	}
	svg {
		display: block;
		inline-size: 100%;
		block-size: 100%;
	}
	.sky {
		fill: #fff;
	}
	.liquid {
		fill: var(--c);
	}
	@media (prefers-reduced-motion: reduce) {
		.orb {
			transition: none;
		}
		.listening,
		.speaking {
			transform: none;
		}
	}
</style>
