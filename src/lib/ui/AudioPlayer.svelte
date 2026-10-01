<script lang="ts">
	import {
		GoBackward15SecIcon,
		GoForward15SecIcon,
		MusicNote01Icon,
		PauseIcon,
		PlayIcon,
		VolumeHighIcon,
		VolumeOffIcon
	} from '@hugeicons/core-free-icons';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';
	import Visualizer from './Visualizer.svelte';

	interface Props {
		src: string;
		title: string;
		artist?: string;
		/** Cover image URL; shown beside the title and on the lock screen. */
		artwork?: string;
		/** Draws the sound above the timeline. The file's host must allow cross-origin requests. */
		visualizer?: boolean | 'bars' | 'wave';
		/** The <audio> element, for your own controls or a Visualizer elsewhere. */
		element?: HTMLAudioElement;
		/** Locale for times and speeds; fixed so server and browser render the same text. */
		locale?: string;
		class?: string;
	}

	let {
		src,
		title,
		artist,
		artwork,
		visualizer = false,
		element = $bindable(),
		locale = 'en',
		class: className
	}: Props = $props();

	let paused = $state(true);
	let current = $state(0);
	let duration = $state(0);
	let buffered = $state<{ start: number; end: number }[]>([]);
	let readyState = $state(0);
	let seeking = $state(false);
	let rate = $state(1);
	let volume = $state(1);
	let muted = $state(false);
	let failed = $state(false);
	let artFailed = $state(false);
	// While the thumb is held, it shows where it is, not where playback has caught up to.
	let drag = $state<number | null>(null);

	const rates = [1, 1.25, 1.5, 2, 0.75];
	const length = $derived(Number.isFinite(duration) ? duration : 0);
	const at = $derived(drag ?? current);
	const loading = $derived(!failed && ((!paused && readyState < 3) || seeking));
	const loaded = $derived(buffered.find((r) => r.start <= at && at <= r.end)?.end ?? at);

	const two = $derived(new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }));
	const speed = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }));
	/** 83 → "1:23", 3723 → "1:02:03". */
	function clock(t: number) {
		const s = Math.floor(t % 60);
		const m = Math.floor(t / 60) % 60;
		const h = Math.floor(t / 3600);
		return h ? `${h}:${two.format(m)}:${two.format(s)}` : `${m}:${two.format(s)}`;
	}
	/** 83 → "1 minute, 23 seconds", for screen readers. */
	function spoken(t: number) {
		const unit = (n: number, u: string) =>
			new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'long' }).format(n);
		const m = Math.floor(t / 60);
		const s = Math.floor(t % 60);
		return m ? `${unit(m, 'minute')}, ${unit(s, 'second')}` : unit(s, 'second');
	}

	const seek = (t: number) => {
		if (element) element.currentTime = Math.min(Math.max(0, t), length || 0);
	};
	function toggle() {
		if (!element) return;
		if (element.paused) element.play().catch(() => (paused = true));
		else element.pause();
	}
	function retry() {
		failed = false;
		element?.load();
	}
	function keys(e: KeyboardEvent) {
		const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl';
		const step = {
			ArrowRight: rtl ? -5 : 5,
			ArrowLeft: rtl ? 5 : -5,
			ArrowUp: 5,
			ArrowDown: -5,
			PageUp: 30,
			PageDown: -30
		}[e.key];
		if (step === undefined) return;
		e.preventDefault();
		seek(current + step);
	}

	// Lock screen, headphones and keyboard media keys.
	$effect(() => {
		if (!('mediaSession' in navigator) || paused) return;
		const s = navigator.mediaSession;
		s.metadata = new MediaMetadata({
			title,
			artist: artist ?? '',
			artwork: artwork ? [{ src: artwork }] : []
		});
		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			['play', () => element?.play()],
			['pause', () => element?.pause()],
			['seekbackward', (d) => seek(current - (d.seekOffset ?? 15))],
			['seekforward', (d) => seek(current + (d.seekOffset ?? 15))],
			['seekto', (d) => d.seekTime !== undefined && seek(d.seekTime)]
		];
		for (const [action, fn] of handlers) {
			try {
				s.setActionHandler(action, fn);
			} catch {
				// An action this browser doesn't know: the others still work.
			}
		}
		return () => {
			for (const [action] of handlers) {
				try {
					s.setActionHandler(action, null);
				} catch {
					// Not supported, so nothing was set.
				}
			}
		};
	});
	$effect(() => {
		if (!('mediaSession' in navigator) || !length) return;
		try {
			navigator.mediaSession.setPositionState({
				duration: length,
				position: Math.min(current, length),
				playbackRate: rate
			});
		} catch {
			// Position out of range mid-seek: the next update corrects it.
		}
	});
</script>

<div class={['player', className]} role="group" aria-label="Audio player: {title}">
	<audio
		bind:this={element}
		{src}
		preload="metadata"
		crossorigin={visualizer ? 'anonymous' : undefined}
		bind:paused
		bind:currentTime={current}
		bind:duration
		bind:buffered
		bind:readyState
		bind:seeking
		bind:playbackRate={rate}
		bind:volume
		bind:muted
		onerror={() => (failed = true)}
		onloadstart={() => (failed = false)}
	></audio>

	<div class="head">
		{#if artwork && !artFailed}
			<img class="art" src={artwork} alt="" onerror={() => (artFailed = true)} />
		{:else}
			<span class="art" aria-hidden="true"><Icon icon={MusicNote01Icon} size={22} /></span>
		{/if}
		<div class="names">
			<strong>{title}</strong>
			{#if artist}<span>{artist}</span>{/if}
		</div>
	</div>

	{#if visualizer && element}
		<Visualizer
			source={element}
			variant={visualizer === 'wave' ? 'wave' : 'bars'}
			mirror
			class="wave"
		/>
	{/if}

	{#if failed}
		<p class="error" role="alert">
			This recording can’t be played right now. Check your connection, then try again.
			<Button variant="secondary" size="sm" onclick={retry}>Try again</Button>
		</p>
	{:else}
		<div class="timeline">
			<input
				type="range"
				aria-label="Position"
				min="0"
				max={length || 0}
				step="any"
				value={at}
				disabled={!length}
				aria-valuetext="{spoken(at)} of {spoken(length)}"
				style:--p="{length ? (at / length) * 100 : 0}%"
				style:--b="{length ? (loaded / length) * 100 : 0}%"
				oninput={(e) => {
					drag = +e.currentTarget.value;
					seek(drag);
				}}
				onchange={() => (drag = null)}
				onkeydown={keys}
			/>
			<div class="times" aria-hidden="true">
				<span>{clock(at)}</span>
				<span>{length ? clock(length) : '–:––'}</span>
			</div>
		</div>
	{/if}

	<div class="controls">
		<span class="side">
			<Button
				variant="ghost"
				size="sm"
				class="rate"
				aria-label="Playback speed, {speed.format(rate)} times"
				onclick={() => (rate = rates[(rates.indexOf(rate) + 1) % rates.length])}
				>{speed.format(rate)}×</Button
			>
		</span>
		<Button variant="ghost" square aria-label="Back 15 seconds" onclick={() => seek(current - 15)}>
			<Icon icon={GoBackward15SecIcon} size={20} />
		</Button>
		<Button
			square
			class="play"
			aria-label={paused ? 'Play' : 'Pause'}
			disabled={failed}
			onclick={toggle}
		>
			<span class={['glyph', !paused && 'off']}><Icon icon={PlayIcon} size={20} /></span>
			<span class={['glyph', (paused || loading) && 'off']}
				><Icon icon={PauseIcon} size={20} /></span
			>
			{#if loading}<span class="glyph"><Spinner size={18} /></span>{/if}
		</Button>
		<Button
			variant="ghost"
			square
			aria-label="Forward 15 seconds"
			onclick={() => seek(current + 15)}
		>
			<Icon icon={GoForward15SecIcon} size={20} />
		</Button>
		<span class="side end">
			<Button
				variant="ghost"
				size="sm"
				square
				aria-label="Mute"
				aria-pressed={muted}
				onclick={() => (muted = !muted)}
			>
				<Icon icon={muted || volume === 0 ? VolumeOffIcon : VolumeHighIcon} size={18} />
			</Button>
			<input
				class="volume"
				type="range"
				aria-label="Volume"
				min="0"
				max="1"
				step="0.05"
				bind:value={volume}
				aria-valuetext="{Math.round(volume * 100)}%"
				style:--p="{(muted ? 0 : volume) * 100}%"
				style:--b="0%"
				oninput={() => (muted = false)}
			/>
		</span>
	</div>
</div>

<style>
	.player {
		display: grid;
		gap: 0.75rem;
		box-sizing: border-box;
		inline-size: 100%;
		max-inline-size: 28rem;
		padding: 1rem;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-inline-size: 0;
	}
	.art {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 3.25rem;
		block-size: 3.25rem;
		border-radius: var(--ui-radius);
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		color: var(--ui-accent);
		object-fit: cover;
	}
	.names {
		display: grid;
		min-inline-size: 0;
	}
	.names > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.names span {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.player :global(.wave) {
		block-size: 3rem;
	}

	.timeline {
		display: grid;
		gap: 0.125rem;
	}
	.times {
		display: flex;
		justify-content: space-between;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}
	/* Played in the accent, loaded a shade darker than the empty rest. */
	input {
		--track: 0.3125rem;
		--thumb: 0.875rem;
		--dir: to right;
		--fill: linear-gradient(
			var(--dir),
			var(--ui-accent) var(--p),
			var(--ui-hover) var(--p) var(--b),
			var(--ui-subtle) var(--b)
		);
		appearance: none;
		inline-size: 100%;
		block-size: 1.5rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	input:dir(rtl) {
		--dir: to left;
	}
	@media (pointer: coarse) {
		input {
			block-size: 2.75rem;
		}
	}
	input::-webkit-slider-runnable-track {
		block-size: var(--track);
		border-radius: 999px;
		background: var(--fill);
	}
	input::-moz-range-track {
		block-size: var(--track);
		border-radius: 999px;
		background: var(--fill);
	}
	input::-webkit-slider-thumb {
		appearance: none;
		inline-size: var(--thumb);
		block-size: var(--thumb);
		margin-block-start: calc((var(--track) - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		scale: 0.85;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	input::-moz-range-thumb {
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		scale: 0.85;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	/* The thumb grows when it's reached for, and more under the finger. */
	input:hover::-webkit-slider-thumb,
	input:focus-visible::-webkit-slider-thumb {
		scale: 1;
	}
	input:hover::-moz-range-thumb,
	input:focus-visible::-moz-range-thumb {
		scale: 1;
	}
	input:active::-webkit-slider-thumb {
		scale: 1.2;
	}
	input:active::-moz-range-thumb {
		scale: 1.2;
	}
	input:focus-visible {
		outline: none;
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input:focus-visible::-moz-range-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr auto auto auto 1fr;
		align-items: center;
		gap: 0.25rem;
	}
	.side {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-inline-size: 0;
	}
	.end {
		justify-content: flex-end;
	}
	.side :global(.rate) {
		min-inline-size: 3rem;
		font-variant-numeric: tabular-nums;
	}
	.volume {
		inline-size: 4.5rem;
	}
	/* Phones set volume with their buttons; the slider would do nothing there. */
	@media (pointer: coarse) {
		.volume {
			display: none;
		}
	}
	.controls :global(.play) {
		position: relative;
		inline-size: 2.75rem;
		block-size: 2.75rem;
		border-radius: 50%;
	}
	/* Play, pause and the spinner share one spot and trade places with a quick scale and fade. */
	.glyph {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		transition:
			opacity var(--ui-dur-press) var(--ui-ease-out),
			scale var(--ui-dur) var(--ui-ease-spring);
	}
	.glyph.off {
		opacity: 0;
		scale: 0.5;
	}

	.error {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.glyph,
		input::-webkit-slider-thumb,
		input::-moz-range-thumb {
			transition: opacity var(--ui-dur-press) ease;
			scale: none;
		}
	}
</style>
