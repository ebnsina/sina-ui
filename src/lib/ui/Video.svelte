<script lang="ts" module>
	const two = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
	const one = new Intl.NumberFormat(undefined);
	/** Seconds as a clock: 75 → "1:15", 3725 → "1:02:05". Digits follow the reader's locale. */
	export function clock(seconds: number) {
		const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const rest = two.format(s % 60);
		return h ? `${one.format(h)}:${two.format(m)}:${rest}` : `${one.format(m)}:${rest}`;
	}
</script>

<script lang="ts">
	import {
		ClosedCaptionIcon,
		DashboardSpeed01Icon,
		FullScreenIcon,
		MinimizeScreenIcon,
		PauseIcon,
		PictureInPictureOnIcon,
		PlayIcon,
		Tick02Icon,
		VolumeHighIcon,
		VolumeMute02Icon
	} from '@hugeicons/core-free-icons';
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLVideoAttributes } from 'svelte/elements';
	import * as Dropdown from './dropdown/index.js';
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';

	interface Props extends Omit<HTMLVideoAttributes, 'title' | 'children' | 'controls'> {
		/** Names the player, and shows on the lock screen and in system media controls. */
		title?: string;
		artist?: string;
		/** Image for the lock screen / media controls (defaults to the poster). */
		artwork?: string;
		/** Width / height, e.g. "16 / 9". */
		aspectRatio?: string;
		/** The <video> element, for libraries that attach to it (Shaka, hls.js). */
		element?: HTMLVideoElement;
		/** Set to show your own message over the player (a stream that failed to load). */
		error?: string;
		/** <source> and <track> elements. */
		children?: Snippet;
		/** Extra controls, placed before fullscreen (a quality menu). */
		controls?: Snippet;
		class?: string;
	}

	let {
		title,
		artist,
		artwork,
		poster,
		aspectRatio = '16 / 9',
		element = $bindable(),
		error,
		children,
		controls,
		class: className,
		...rest
	}: Props = $props();

	const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
	const rate = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

	let wrap: HTMLDivElement;
	let paused = $state(true);
	let time = $state(0);
	let duration = $state(0);
	let volume = $state(1);
	let muted = $state(false);
	let speed = $state(1);
	let buffered = $state<{ start: number; end: number }[]>([]);
	let started = $state(false);
	let waiting = $state(false);
	let failed = $state(false);
	let full = $state(false);
	let canPip = $state(false);
	let hasCaptions = $state(false);
	let captions = $state(false);
	let idle = $state(false);
	let menuOpen = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const message = $derived(error ?? (failed ? 'This video couldn’t be played.' : undefined));
	const hidden = $derived(started && !paused && idle && !menuOpen);
	const played = $derived(duration ? (time / duration) * 100 : 0);
	const loaded = $derived.by(() => {
		const range = buffered.find((r) => r.start <= time && time <= r.end);
		return duration && range ? (range.end / duration) * 100 : played;
	});

	/** Controls stay while the pointer moves or focus is inside; they fade after 2.5s idle. */
	function wake() {
		idle = false;
		clearTimeout(timer);
		timer = setTimeout(() => (idle = true), 2500);
	}
	const toggle = () => (element!.paused ? element!.play().catch(() => {}) : element!.pause());
	const seek = (to: number) => (element!.currentTime = Math.min(Math.max(0, to), duration || 0));

	function fullscreen() {
		if (document.fullscreenElement) return document.exitFullscreen();
		if (wrap.requestFullscreen) return wrap.requestFullscreen().catch(() => {});
		// iPhone: only the video itself can go fullscreen, with the system controls.
		(
			element as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
		).webkitEnterFullscreen?.();
	}
	function pip() {
		if (document.pictureInPictureElement) document.exitPictureInPicture();
		else element!.requestPictureInPicture().catch(() => {});
	}
	function setCaptions(on: boolean) {
		captions = on;
		for (const t of element!.textTracks)
			if (t.kind === 'captions' || t.kind === 'subtitles') t.mode = on ? 'showing' : 'hidden';
	}

	function onkeydown(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (e.metaKey || e.ctrlKey || e.altKey || t.closest('[popover]')) return;
		const onButton = t.tagName === 'BUTTON';
		const onScrub = t.classList.contains('scrub') || t.classList.contains('volume');
		const key = e.key.toLowerCase();
		if ((key === ' ' && !onButton && !onScrub) || key === 'k') toggle();
		else if (key === 'j') seek(time - 10);
		else if (key === 'l') seek(time + 10);
		else if (key === 'm') muted = !muted;
		else if (key === 'f') fullscreen();
		else if (key === 'c' && hasCaptions) setCaptions(!captions);
		else if (!onScrub && (key === 'arrowleft' || key === 'arrowright'))
			seek(time + (key === 'arrowleft' ? -5 : 5));
		else return;
		e.preventDefault();
		wake();
	}
	// The scrub bar moves 5s per arrow press, like the player; Page keys jump a tenth.
	function scrubKeys(e: KeyboardEvent) {
		const jumps: Record<string, number> = {
			ArrowLeft: time - 5,
			ArrowDown: time - 5,
			ArrowRight: time + 5,
			ArrowUp: time + 5,
			PageDown: time - duration / 10,
			PageUp: time + duration / 10,
			Home: 0,
			End: duration
		};
		if (!(e.key in jumps)) return;
		e.preventDefault();
		e.stopPropagation();
		seek(jumps[e.key]);
	}

	onMount(() => {
		const video = element!;
		canPip = document.pictureInPictureEnabled && !video.disablePictureInPicture;
		const tracks = () =>
			(hasCaptions = [...video.textTracks].some(
				(t) => t.kind === 'captions' || t.kind === 'subtitles'
			));
		tracks();
		video.textTracks.addEventListener('addtrack', tracks);
		const onFull = () => (full = document.fullscreenElement === wrap);
		document.addEventListener('fullscreenchange', onFull);
		return () => {
			clearTimeout(timer);
			video.textTracks.removeEventListener('addtrack', tracks);
			document.removeEventListener('fullscreenchange', onFull);
		};
	});

	// Lock screen, headset buttons and the OS media panel drive this player while it plays.
	function session() {
		if (!('mediaSession' in navigator)) return;
		const art = artwork ?? poster;
		if (title)
			navigator.mediaSession.metadata = new MediaMetadata({
				title,
				artist,
				artwork: art ? [{ src: art }] : []
			});
		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			['play', () => element!.play()],
			['pause', () => element!.pause()],
			['seekbackward', (d) => seek(time - (d.seekOffset ?? 10))],
			['seekforward', (d) => seek(time + (d.seekOffset ?? 10))],
			['seekto', (d) => d.seekTime !== undefined && seek(d.seekTime)]
		];
		for (const [action, handler] of handlers) {
			try {
				navigator.mediaSession.setActionHandler(action, handler);
			} catch {
				// Not every browser knows every action.
			}
		}
	}
</script>

<!-- Focusable, so its keyboard shortcuts work once you click into it. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	bind:this={wrap}
	class={['player', hidden && 'hidden', full && 'full', className]}
	style:aspect-ratio={aspectRatio}
	role="region"
	aria-label={title ?? 'Video player'}
	aria-keyshortcuts="k j l m f c"
	tabindex="0"
	{onkeydown}
	onpointermove={wake}
	onfocusin={wake}
>
	<!-- Captions come in as <track> children. -->
	<video
		bind:this={element}
		bind:paused
		bind:currentTime={time}
		bind:duration
		bind:volume
		bind:muted
		bind:playbackRate={speed}
		bind:buffered
		{poster}
		playsinline
		preload="metadata"
		{...rest}
		onclick={toggle}
		onplay={() => {
			started = true;
			failed = false;
			session();
			wake();
		}}
		onwaiting={() => (waiting = true)}
		onplaying={() => (waiting = false)}
		oncanplay={() => (waiting = false)}
		onerror={() => (failed = true)}
	>
		{@render children?.()}
	</video>

	{#if message}
		<p class="message" role="alert">{message}</p>
	{:else if waiting}
		<span class="center"><Spinner size={36} label="Loading" /></span>
	{:else if !started}
		<button
			type="button"
			class="big"
			aria-label="Play {title ?? 'video'}"
			onclick={() => {
				toggle();
				// The button goes once it plays: keep keyboard focus on the player, not the page.
				wrap.focus({ preventScroll: true });
			}}
		>
			<Icon icon={PlayIcon} size={28} />
		</button>
	{/if}

	<div class="bar">
		<input
			class="scrub"
			type="range"
			min="0"
			max={duration || 0}
			step="any"
			value={time}
			aria-label="Seek"
			aria-valuetext="{clock(time)} of {clock(duration)}"
			style:--p="{played}%"
			style:--b="{loaded}%"
			oninput={(e) => seek(+e.currentTarget.value)}
			onkeydown={scrubKeys}
		/>
		<div class="row">
			<button
				type="button"
				class="ctl"
				aria-label={paused ? 'Play' : 'Pause'}
				aria-keyshortcuts="k"
				onclick={toggle}
			>
				<Icon icon={paused ? PlayIcon : PauseIcon} />
			</button>
			<button
				type="button"
				class="ctl"
				aria-label={muted ? 'Unmute' : 'Mute'}
				aria-keyshortcuts="m"
				onclick={() => (muted = !muted)}
			>
				<Icon icon={muted || volume === 0 ? VolumeMute02Icon : VolumeHighIcon} />
			</button>
			<input
				class="volume"
				type="range"
				min="0"
				max="1"
				step="0.05"
				aria-label="Volume"
				aria-valuetext="{Math.round((muted ? 0 : volume) * 100)}%"
				value={muted ? 0 : volume}
				style:--p="{(muted ? 0 : volume) * 100}%"
				style:--b="0%"
				oninput={(e) => {
					volume = +e.currentTarget.value;
					muted = volume === 0;
				}}
			/>
			<span class="time"><span>{clock(time)}</span> / <span>{clock(duration)}</span></span>
			<span class="grow"></span>
			{@render controls?.()}
			<Dropdown.Root bind:open={menuOpen}>
				{#snippet trigger(props)}
					<button type="button" class="ctl" aria-label="Playback speed" {...props}>
						<Icon icon={DashboardSpeed01Icon} />
					</button>
				{/snippet}
				{#each rates as r (r)}
					<Dropdown.Item onselect={() => (speed = r)}>
						<span class="tick"
							>{#if r === speed}<Icon icon={Tick02Icon} size={16} />{/if}</span
						>
						{r === 1 ? 'Normal' : `${rate.format(r)}×`}
					</Dropdown.Item>
				{/each}
			</Dropdown.Root>
			{#if hasCaptions}
				<button
					type="button"
					class="ctl"
					aria-label="Captions"
					aria-pressed={captions}
					aria-keyshortcuts="c"
					onclick={() => setCaptions(!captions)}
				>
					<Icon icon={ClosedCaptionIcon} />
				</button>
			{/if}
			{#if canPip}
				<button type="button" class="ctl" aria-label="Picture in picture" onclick={pip}>
					<Icon icon={PictureInPictureOnIcon} />
				</button>
			{/if}
			<button
				type="button"
				class="ctl"
				aria-label={full ? 'Exit full screen' : 'Full screen'}
				aria-keyshortcuts="f"
				onclick={fullscreen}
			>
				<Icon icon={full ? MinimizeScreenIcon : FullScreenIcon} />
			</button>
		</div>
	</div>
</div>

<style>
	.player {
		position: relative;
		overflow: hidden;
		inline-size: 100%;
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: #000;
		color: #fff;
		font: 0.875rem/1.4 var(--ui-font);
	}
	.player:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.full {
		border-radius: 0;
	}
	.hidden {
		cursor: none;
	}
	video {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: contain;
	}
	/* Captions sit above the controls while they show. */
	video::cue {
		font-family: var(--ui-font);
	}

	.center,
	.big,
	.message {
		position: absolute;
		inset: 0;
		margin: auto;
	}
	.center {
		display: grid;
		place-items: center;
		color: #fff;
		pointer-events: none;
	}
	.big {
		display: grid;
		place-items: center;
		inline-size: 4rem;
		block-size: 4rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
		cursor: pointer;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.big:active {
		scale: 0.94;
	}
	.message {
		display: grid;
		place-items: center;
		padding: 1.5rem;
		background: rgb(0 0 0 / 0.7);
		text-align: center;
	}

	/* The bar rides on a dark scrim, so white controls read on any frame. */
	.bar {
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		padding: 2.5rem 0.75rem 0.5rem;
		background: linear-gradient(transparent, rgb(0 0 0 / 0.65));
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur) var(--ui-ease-out);
	}
	.hidden .bar {
		opacity: 0;
		translate: 0 0.5rem;
		transition-timing-function: var(--ui-ease-in-out);
		pointer-events: none;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.125rem;
	}
	.grow {
		flex: 1;
	}
	.ctl {
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: inherit;
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.ctl:hover {
			background: rgb(255 255 255 / 0.15);
		}
	}
	.ctl:active {
		scale: 0.94;
	}
	.ctl[aria-pressed='true'] {
		color: var(--ui-accent);
	}
	:is(.ctl, .big):focus-visible {
		outline: var(--ui-ring-width) solid #fff;
		outline-offset: 1px;
	}
	.time {
		padding-inline: 0.5rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		direction: ltr;
	}
	.tick {
		display: inline-grid;
		inline-size: 1rem;
	}

	/* Scrub and volume: played in the accent, loaded in soft white, the rest faint. */
	input {
		--track: 0.25rem;
		--thumb: 0.875rem;
		appearance: none;
		block-size: 1.25rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	.scrub {
		display: block;
		inline-size: 100%;
	}
	.volume {
		inline-size: 4.5rem;
	}
	@media (pointer: coarse) {
		.scrub {
			block-size: 2rem;
		}
		/* Phones use their own volume buttons. */
		.volume {
			display: none;
		}
	}
	input::-webkit-slider-runnable-track {
		block-size: var(--track);
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--ui-accent) var(--p),
			rgb(255 255 255 / 0.45) var(--p) var(--b),
			rgb(255 255 255 / 0.2) var(--b)
		);
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	input::-moz-range-track {
		block-size: var(--track);
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--ui-accent) var(--p),
			rgb(255 255 255 / 0.45) var(--p) var(--b),
			rgb(255 255 255 / 0.2) var(--b)
		);
	}
	input::-webkit-slider-thumb {
		appearance: none;
		inline-size: var(--thumb);
		block-size: var(--thumb);
		margin-block-start: calc((var(--track) - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: #fff;
		scale: 0;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	input::-moz-range-thumb {
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: #fff;
		scale: 0;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	/* The thumb appears when you reach for the bar. */
	:is(input:hover, input:focus-visible, input:active)::-webkit-slider-thumb {
		scale: 1;
	}
	:is(input:hover, input:focus-visible, input:active)::-moz-range-thumb {
		scale: 1;
	}
	input:focus-visible {
		outline: none;
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: var(--ui-ring-width) solid #fff;
		outline-offset: 1px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: var(--ui-ring-width) solid #fff;
		outline-offset: 1px;
	}
	@media (prefers-reduced-motion: reduce) {
		.bar,
		.hidden .bar {
			translate: none;
		}
		.big,
		.ctl,
		input::-webkit-slider-thumb,
		input::-moz-range-thumb {
			transition: none;
		}
	}
</style>
