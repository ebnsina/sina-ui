<script lang="ts">
	import { PauseIcon, PlayIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
	import type { TTSResult } from '@tanstack/ai';
	import {
		createGenerateSpeech,
		type ConnectConnectionAdapter,
		type SpeechGenerateInput
	} from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Slider from '#lib/ui/Slider.svelte';
	import Spinner from '#lib/ui/Spinner.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';

	interface Props {
		/** fetchServerSentEvents('/api/speech'), or pass a fetcher instead. */
		connection?: ConnectConnectionAdapter;
		fetcher?: (input: SpeechGenerateInput, o?: { signal?: AbortSignal }) => Promise<TTSResult>;
		/** The provider's voice ids, with names people understand. */
		voices?: { value: string; label: string }[];
		text?: string;
		class?: string;
	}

	let {
		connection,
		fetcher,
		voices = [
			{ value: 'alloy', label: 'Warm' },
			{ value: 'verse', label: 'Bright' },
			{ value: 'sage', label: 'Calm' }
		],
		text = $bindable(''),
		class: className
	}: Props = $props();

	let audio = $state<HTMLAudioElement>();
	// svelte-ignore state_referenced_locally
	const gen = createGenerateSpeech({
		...(connection ? { connection } : { fetcher }),
		onResult: () => {
			announce('Ready to play');
			// Plays as soon as it's in, as a read-aloud button should.
			queueMicrotask(() => audio?.play().catch(() => {}));
		}
	});

	// svelte-ignore state_referenced_locally
	let voice = $state(voices[0].value);
	let error = $state('');
	let time = $state(0);
	let duration = $state(0);
	let paused = $state(true);

	// Playing, the thumb follows the audio every frame (its own time events come only ~4 a second).
	$effect(() => {
		if (paused || scrubbing) return;
		let frame = requestAnimationFrame(function follow() {
			if (audio) time = audio.currentTime;
			frame = requestAnimationFrame(follow);
		});
		return () => cancelAnimationFrame(frame);
	});

	// Scrubbing, your hand owns the thumb: the sound pauses so it doesn't stutter, jumps to where you
	// let go, and carries on if it was playing.
	let scrubbing = $state(false);
	let resume = false;
	function scrub(to: number) {
		if (!audio) return;
		if (!scrubbing) {
			scrubbing = true;
			resume = !audio.paused;
			audio.pause();
		}
		time = to;
		audio.currentTime = to;
	}
	function release() {
		if (!scrubbing) return;
		scrubbing = false;
		if (resume) audio?.play().catch(() => {});
	}
	const src = $derived(gen.result && `data:audio/${gen.result.format};base64,${gen.result.audio}`);
	const clock = (s: number) =>
		`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

	function speak(e: SubmitEvent) {
		e.preventDefault();
		if (!text.trim()) {
			error = 'Write something to read aloud.';
			return;
		}
		error = '';
		gen.generate({ text: text.trim(), voice, format: 'wav' });
	}
</script>

<section class={['studio', className]} aria-label="Read aloud">
	<form onsubmit={speak}>
		<Textarea
			label="Text to read"
			bind:value={text}
			rows={3}
			{error}
			oninput={() => (error = '')}
		/>
		<div class="row">
			<Segmented label="Voice" hideLabel options={voices} bind:value={voice} />
			{#if gen.isLoading}
				<Button variant="secondary" onclick={() => gen.stop()}><Spinner size={16} /> Stop</Button>
			{:else}
				<Button type="submit"><Icon icon={VolumeHighIcon} size={16} /> Read aloud</Button>
			{/if}
		</div>
	</form>

	{#if gen.error}
		<p class="failed" role="alert">The audio didn't come through. Try again in a moment.</p>
	{:else if src}
		<div class="player">
			<audio
				bind:this={audio}
				{src}
				bind:duration
				bind:paused
				onended={() => (time = duration)}
				onseeked={() => !scrubbing && audio && (time = audio.currentTime)}
			></audio>
			<Button
				square
				aria-label={paused ? 'Play' : 'Pause'}
				onclick={() => (paused ? audio?.play() : audio?.pause())}
			>
				<Icon icon={paused ? PlayIcon : PauseIcon} size={18} />
			</Button>
			<Slider
				class="seek"
				label="Position"
				bind:value={() => time, scrub}
				onchange={release}
				onpointerup={release}
				onpointercancel={release}
				min={0}
				max={duration || 1}
				step={0.01}
				format={(v) => `${clock(v)} / ${clock(duration)}`}
			/>
		</div>
	{/if}
</section>

<style>
	.studio {
		display: grid;
		gap: 1.25rem;
		inline-size: 100%;
		box-sizing: border-box;
		padding: 1.25rem;
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	form {
		display: grid;
		gap: 0.75rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	/* Concentric: the button's corners + the 0.75rem around it. */
	.player {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-block: 0.75rem;
		padding-inline: 0.75rem 1rem;
		border-radius: calc(var(--ui-radius) + 0.75rem);
		background: var(--ui-subtle);
		animation: appear 300ms var(--ui-ease-out);
	}
	.player :global(.seek) {
		flex: 1;
	}
	@keyframes appear {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}
	.failed {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.player {
			animation: none;
		}
	}
</style>
