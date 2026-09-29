<script lang="ts">
	import { Video01Icon } from '@hugeicons/core-free-icons';
	import {
		createGenerateVideo,
		type ConnectConnectionAdapter,
		type VideoGenerateInput,
		type VideoGenerateResult
	} from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import GridReveal from '#lib/ui/GridReveal.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { now } from '#lib/ui/now.svelte.js';
	import Progress from '#lib/ui/Progress.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';

	interface Props {
		/** fetchServerSentEvents('/api/video'), or pass a fetcher instead. */
		connection?: ConnectConnectionAdapter;
		fetcher?: (
			input: VideoGenerateInput,
			o?: { signal?: AbortSignal }
		) => Promise<VideoGenerateResult>;
		placeholder?: string;
		class?: string;
	}

	let { connection, fetcher, placeholder = '', class: className }: Props = $props();

	// svelte-ignore state_referenced_locally
	const gen = createGenerateVideo({
		...(connection ? { connection } : { fetcher }),
		onResult: () => announce('Video ready')
	});

	let prompt = $state('');
	let duration = $state('4');
	let error = $state('');
	let started = $state(0);
	const waited = $derived(gen.isLoading ? Math.max(0, Math.floor((now() - started) / 1000)) : 0);
	// Providers report progress for long jobs; without it, the bar just shows work is happening.
	const progress = $derived(gen.videoStatus?.progress);

	function generate(e: SubmitEvent) {
		e.preventDefault();
		if (!prompt.trim()) {
			error = 'Describe the scene.';
			return;
		}
		error = '';
		started = Date.now();
		gen.generate({ prompt: prompt.trim(), duration: Number(duration), size: '1280x720' });
	}
</script>

<section class={['studio', className]} aria-label="Video generator">
	<form onsubmit={generate}>
		<Textarea
			label="Describe the scene"
			bind:value={prompt}
			{placeholder}
			rows={2}
			{error}
			oninput={() => (error = '')}
		/>
		<div class="row">
			<Segmented
				label="Length"
				hideLabel
				options={[
					{ value: '4', label: '4 seconds' },
					{ value: '8', label: '8 seconds' }
				]}
				bind:value={duration}
			/>
			{#if gen.isLoading}
				<Button variant="secondary" onclick={() => gen.stop()}>Stop</Button>
			{:else}
				<Button type="submit"><Icon icon={Video01Icon} size={16} /> Generate</Button>
			{/if}
		</div>
	</form>

	<!-- One 16:9 frame throughout, so nothing moves when the video arrives. -->
	<div class="frame" aria-live="polite" aria-busy={gen.isLoading}>
		{#if gen.isLoading}
			<!-- Tiles at work fill the frame; how far along sits on top. -->
			<GridReveal alt="Your video" ratio={16 / 9} status={false} class="fill" />
			<div class="working">
				<Progress label="Making your video" value={progress} />
				<p>Usually under a minute · {waited}s so far</p>
			</div>
		{:else if gen.error}
			<p class="note failed" role="alert">The video didn't come through. Try again in a moment.</p>
		{:else if gen.result}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={gen.result.url} controls autoplay muted loop playsinline aria-label={prompt}
			></video>
		{:else}
			<p class="note">Your video appears here.</p>
		{/if}
	</div>
</section>

<style>
	/* Concentric: 1.75rem card = 1.25rem padding + the frame's 0.5rem. */
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
	.frame {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.frame video {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		animation: appear 400ms var(--ui-ease-out);
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
	}
	.frame {
		position: relative;
	}
	.frame :global(.fill) {
		position: absolute;
		inset: 0;
		border-radius: 0;
	}
	.working {
		position: relative;
		display: grid;
		gap: 0.5rem;
		inline-size: min(20rem, 80%);
		padding: 0.875rem 1rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: color-mix(in srgb, var(--ui-surface) 82%, transparent);
		backdrop-filter: blur(10px);
		box-shadow: var(--ui-shadow-card);
	}
	.working p,
	.note {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	.failed {
		color: var(--ui-danger);
	}
	@media (prefers-reduced-motion: reduce) {
		.frame video {
			animation: none;
		}
	}
</style>
