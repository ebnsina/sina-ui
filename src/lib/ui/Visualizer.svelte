<script lang="ts" module>
	// One audio graph per page. A media element can only ever be wired into it once, so its source
	// node is kept and reused by every visualizer that listens to it.
	let context: AudioContext | undefined;
	const wired = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
	const audio = () => (context ??= new AudioContext());
</script>

<script lang="ts">
	import { reduced } from './motion';

	interface Props {
		/** What to listen to: an <audio>/<video> element or a microphone stream. */
		source?: HTMLMediaElement | MediaStream | null;
		/** bars: loudness per pitch, low to high. wave: the sound's shape. */
		variant?: 'bars' | 'wave';
		/** How many bars. */
		bars?: number;
		/** Bars grow up and down from the middle instead of up from the floor. */
		mirror?: boolean;
		/** Names it for screen readers; without it the visualizer is decorative. */
		label?: string;
		class?: string;
	}

	let {
		source = null,
		variant = 'bars',
		bars = 32,
		mirror = false,
		label,
		class: className
	}: Props = $props();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		const g = canvas.getContext('2d');
		if (!g) return;
		const ctx = source ? audio() : undefined;
		let analyser: AnalyserNode | undefined;
		let input: AudioNode | undefined;
		if (ctx && source) {
			analyser = ctx.createAnalyser();
			analyser.fftSize = variant === 'wave' ? 2048 : 256;
			analyser.smoothingTimeConstant = 0.8;
			if (source instanceof MediaStream) {
				// Not connected to the speakers: a microphone played back would howl.
				input = ctx.createMediaStreamSource(source);
				ctx.resume();
			} else {
				input = wired.get(source);
				if (!input) {
					input = ctx.createMediaElementSource(source);
					input.connect(ctx.destination);
					wired.set(source, input as MediaElementAudioSourceNode);
				}
			}
			input.connect(analyser);
		}
		const freq = new Uint8Array(analyser?.frequencyBinCount ?? 0);
		const wave = new Uint8Array(analyser?.fftSize ?? 0);
		const levels = new Float32Array(bars);

		// Color comes from the page (--ui-accent through `color`), so it follows the theme.
		let color = getComputedStyle(canvas).color;
		const recolor = () => {
			color = getComputedStyle(canvas).color;
			if (!frame) draw();
		};
		const themes = new MutationObserver(recolor);
		themes.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class']
		});
		const scheme = matchMedia('(prefers-color-scheme: dark)');
		scheme.addEventListener('change', recolor);

		const size = () => {
			const dpr = devicePixelRatio || 1;
			canvas.width = Math.round(canvas.clientWidth * dpr);
			canvas.height = Math.round(canvas.clientHeight * dpr);
			if (!frame) draw();
		};

		function draw() {
			const { width: w, height: h } = canvas;
			g!.clearRect(0, 0, w, h);
			g!.fillStyle = g!.strokeStyle = color;
			if (variant === 'wave') {
				g!.lineWidth = 2 * (devicePixelRatio || 1);
				g!.lineJoin = g!.lineCap = 'round';
				g!.beginPath();
				const n = analyser ? wave.length : 2;
				for (let i = 0; i < n; i++) {
					const v = analyser ? (wave[i] - 128) / 128 : 0;
					const x = (i / (n - 1)) * w;
					const y = h / 2 - v * (h / 2 - g!.lineWidth);
					if (i) g!.lineTo(x, y);
					else g!.moveTo(x, y);
				}
				g!.stroke();
				return;
			}
			const gap = Math.max(2, (w / bars) * 0.25);
			const bw = (w - gap * (bars - 1)) / bars;
			for (let i = 0; i < bars; i++) {
				const bh = Math.max(bw, levels[i] * h);
				const y = mirror ? (h - bh) / 2 : h - bh;
				// A resting bar is a quiet dot; a lit one is solid.
				g!.globalAlpha = 0.25 + 0.75 * Math.min(1, levels[i] * 3);
				g!.beginPath();
				g!.roundRect(i * (bw + gap), y, bw, bh, bw / 2);
				g!.fill();
			}
			g!.globalAlpha = 1;
		}

		/** Spreads the spectrum over the bars on a curve, so the busy low end isn't crammed into one. */
		function measure() {
			if (!analyser) return 0;
			if (variant === 'wave') {
				analyser.getByteTimeDomainData(wave);
				let peak = 0;
				for (const v of wave) peak = Math.max(peak, Math.abs(v - 128) / 128);
				return peak;
			}
			analyser.getByteFrequencyData(freq);
			const usable = Math.floor(freq.length * 0.7);
			let peak = 0;
			for (let i = 0; i < bars; i++) {
				const from = Math.floor(usable * (i / bars) ** 1.6);
				const to = Math.max(from + 1, Math.floor(usable * ((i + 1) / bars) ** 1.6));
				let sum = 0;
				for (let j = from; j < to; j++) sum += freq[j];
				levels[i] = sum / (to - from) / 255;
				peak = Math.max(peak, levels[i]);
			}
			return peak;
		}

		let frame = 0;
		let last = 0;
		let visible = true;
		const playing = () =>
			source instanceof MediaStream ? source.active : !!source && !source.paused;
		function tick(now: number) {
			frame = 0;
			// Reduced motion: a calm 8 frames a second instead of 60.
			if (reduced() && now - last < 125) {
				frame = requestAnimationFrame(tick);
				return;
			}
			last = now;
			const peak = measure();
			draw();
			// Keeps going after a pause until the bars have settled, then rests.
			if (visible && (playing() || peak > 0.01)) frame = requestAnimationFrame(tick);
		}
		const kick = () => {
			if (source instanceof HTMLMediaElement) ctx?.resume();
			if (!frame && visible) frame = requestAnimationFrame(tick);
		};

		const seen = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible) kick();
		});
		seen.observe(canvas);
		const resized = new ResizeObserver(size);
		resized.observe(canvas);
		const media = source instanceof HTMLMediaElement ? source : undefined;
		media?.addEventListener('play', kick);
		size();
		kick();

		return () => {
			cancelAnimationFrame(frame);
			seen.disconnect();
			resized.disconnect();
			themes.disconnect();
			scheme.removeEventListener('change', recolor);
			media?.removeEventListener('play', kick);
			if (analyser) input?.disconnect(analyser);
			// A microphone's node is ours alone; a media element's stays wired for next time.
			if (source instanceof MediaStream) input?.disconnect();
		};
	});
</script>

<canvas
	bind:this={canvas}
	class={['visualizer', className]}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
></canvas>

<style>
	.visualizer {
		display: block;
		inline-size: 100%;
		block-size: 4rem;
		/* Read by the script as the drawing color. */
		color: var(--ui-accent);
	}
</style>
