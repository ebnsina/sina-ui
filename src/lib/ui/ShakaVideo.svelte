<script lang="ts">
	import { SlidersHorizontalIcon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { onMount, type ComponentProps } from 'svelte';
	import type shaka from 'shaka-player';
	import * as Dropdown from './dropdown/index.js';
	import Icon from './Icon.svelte';
	import Video from './Video.svelte';

	interface Props extends Omit<ComponentProps<typeof Video>, 'src' | 'error' | 'controls'> {
		/** A DASH (.mpd) or HLS (.m3u8) manifest. */
		manifest: string;
	}

	let { manifest, element = $bindable(), ...rest }: Props = $props();

	type Track = shaka.extern.VideoTrack;
	let player: shaka.Player | undefined;
	let error = $state<string>();
	let tracks = $state<Track[]>([]);
	let auto = $state(true);

	// Highest first, one entry per height: "1080p", "720p"…
	const qualities = $derived(
		[...tracks]
			.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
			.filter((t, i, all) => t.height && all.findIndex((u) => u.height === t.height) === i)
	);
	const active = $derived(tracks.find((t) => t.active));

	/** Shaka's error categories, in words a viewer can act on. */
	function explain(e: unknown) {
		const category = (e as { category?: number })?.category;
		if (category === 1)
			return 'The video couldn’t be reached. Check your connection and try again.';
		if (category === 6) return 'This video is protected and can’t be played in this browser.';
		if (category === 4) return 'The video stream couldn’t be read.';
		if (category === 3) return 'This video’s format isn’t supported on this device.';
		return 'This video couldn’t be played.';
	}

	onMount(() => {
		let gone = false;
		(async () => {
			const { default: lib } = await import('shaka-player');
			if (gone) return;
			lib.polyfill.installAll();
			if (!lib.Player.isBrowserSupported()) {
				error = 'This browser can’t play streaming video. Try a recent Chrome, Safari or Firefox.';
				return;
			}
			const p = new lib.Player();
			player = p;
			p.addEventListener('error', (ev) => (error = explain((ev as unknown as CustomEvent).detail)));
			const refresh = () => (tracks = p.getVideoTracks());
			p.addEventListener('trackschanged', refresh);
			p.addEventListener('variantchanged', refresh);
			p.addEventListener('adaptation', refresh);
			try {
				await p.attach(element!);
				await p.load(manifest);
				refresh();
			} catch (e) {
				if (!gone) error = explain(e);
			}
		})();
		return () => {
			gone = true;
			player?.destroy();
		};
	});

	function choose(track?: Track) {
		if (!player) return;
		auto = !track;
		player.configure({ abr: { enabled: auto } });
		if (track) player.selectVideoTrack(track, true);
	}
</script>

<Video bind:element {error} {...rest}>
	{#snippet controls()}
		{#if qualities.length > 1}
			<Dropdown.Root>
				{#snippet trigger(props)}
					<button type="button" class="ctl" aria-label="Quality" {...props}>
						<Icon icon={SlidersHorizontalIcon} />
					</button>
				{/snippet}
				<Dropdown.Item onselect={() => choose()}>
					<span class="tick"
						>{#if auto}<Icon icon={Tick02Icon} size={16} />{/if}</span
					>
					Auto{auto && active?.height ? ` (${active.height}p)` : ''}
				</Dropdown.Item>
				{#each qualities as q (q.height)}
					<Dropdown.Item onselect={() => choose(q)}>
						<span class="tick"
							>{#if !auto && active?.height === q.height}<Icon
									icon={Tick02Icon}
									size={16}
								/>{/if}</span
						>
						{q.height}p
					</Dropdown.Item>
				{/each}
			</Dropdown.Root>
		{/if}
	{/snippet}
</Video>

<style>
	/* Matches the player's own buttons. */
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
	.ctl:focus-visible {
		outline: var(--ui-ring-width) solid #fff;
		outline-offset: 1px;
	}
	.tick {
		display: inline-grid;
		inline-size: 1rem;
	}
</style>
