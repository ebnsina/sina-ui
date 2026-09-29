<script lang="ts">
	import {
		Copy01Icon,
		Mic01Icon,
		StopIcon,
		Tick02Icon,
		Upload04Icon
	} from '@hugeicons/core-free-icons';
	import type { TranscriptionResult } from '@tanstack/ai';
	import {
		createAudioRecorder,
		createTranscription,
		type ConnectConnectionAdapter,
		type TranscriptionGenerateInput
	} from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { now } from '#lib/ui/now.svelte.js';
	import Spinner from '#lib/ui/Spinner.svelte';

	interface Props {
		/** fetchServerSentEvents('/api/transcribe'), or pass a fetcher instead. */
		connection?: ConnectConnectionAdapter;
		fetcher?: (
			input: TranscriptionGenerateInput,
			o?: { signal?: AbortSignal }
		) => Promise<TranscriptionResult>;
		class?: string;
	}

	let { connection, fetcher, class: className }: Props = $props();

	let problem = $state('');
	// svelte-ignore state_referenced_locally
	const gen = createTranscription({
		...(connection ? { connection } : { fetcher }),
		onResult: (r) => announce(`Transcribed: ${r.text.slice(0, 200)}`)
	});
	const recorder = createAudioRecorder({
		onError: () =>
			(problem = 'The microphone is blocked. Allow it in your browser, or upload a recording.')
	});

	let started = $state(0);
	const seconds = $derived(
		recorder.isRecording ? Math.max(0, Math.floor((now() - started) / 1000)) : 0
	);
	const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

	async function toggle() {
		problem = '';
		if (!recorder.isRecording) {
			started = Date.now();
			await recorder.start();
			if (recorder.isRecording) announce('Recording');
			return;
		}
		const take = await recorder.stop();
		gen.generate({ audio: take.blob });
	}

	let picker = $state<HTMLInputElement>();
	function upload(file: File | undefined) {
		if (!file) return;
		problem = file.type.startsWith('audio/') ? '' : `${file.name} isn't an audio file.`;
		if (!problem) gen.generate({ audio: file });
	}

	let copied = $state(false);
	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = true;
		announce('Copied');
		setTimeout(() => (copied = false), 1500);
	}
</script>

<section class={['studio', className]} aria-label="Transcribe">
	<div class="controls">
		{#if recorder.isSupported}
			<button
				type="button"
				class={['record', recorder.isRecording && 'on']}
				aria-pressed={recorder.isRecording}
				disabled={gen.isLoading}
				onclick={toggle}
			>
				<Icon icon={recorder.isRecording ? StopIcon : Mic01Icon} size={22} />
				<span class="sr-only">{recorder.isRecording ? 'Stop and transcribe' : 'Record'}</span>
			</button>
		{/if}
		<p class="state" aria-live="polite">
			{#if recorder.isRecording}
				<span class="live" aria-hidden="true"></span> Recording
				<span class="time">{clock(seconds)}</span>
			{:else if gen.isLoading}
				<Spinner size={16} /> Transcribing…
			{:else if recorder.isSupported}
				Press to record, then again to stop.
			{:else}
				This browser can't record; upload a recording instead.
			{/if}
		</p>
		<input
			bind:this={picker}
			class="sr-only"
			type="file"
			accept="audio/*"
			tabindex="-1"
			aria-hidden="true"
			onchange={(e) => {
				upload(e.currentTarget.files?.[0]);
				e.currentTarget.value = '';
			}}
		/>
		<Button
			variant="secondary"
			size="sm"
			disabled={recorder.isRecording || gen.isLoading}
			onclick={() => picker?.click()}
		>
			<Icon icon={Upload04Icon} size={16} /> Upload
		</Button>
	</div>

	{#if problem}
		<p class="failed" role="alert">{problem}</p>
	{:else if gen.error}
		<p class="failed" role="alert">The transcript didn't come through. Try again in a moment.</p>
	{:else if gen.result}
		<figure class="transcript">
			<blockquote>{gen.result.text}</blockquote>
			<figcaption>
				<Button
					variant="ghost"
					size="sm"
					square
					aria-label={copied ? 'Copied' : 'Copy transcript'}
					onclick={() => copy(gen.result!.text)}
				>
					<Icon icon={copied ? Tick02Icon : Copy01Icon} size={15} />
				</Button>
			</figcaption>
		</figure>
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
	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	/* The one big control: accent when idle, danger while recording, pressing in on tap. */
	.record {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 3.5rem;
		block-size: 3.5rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		cursor: pointer;
		transition:
			transform var(--ui-dur-press) var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	.record:active {
		transform: scale(0.94);
	}
	.record.on {
		background: var(--ui-danger);
		color: var(--ui-on-danger);
	}
	.record:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.record:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.state {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.live {
		inline-size: 0.5rem;
		block-size: 0.5rem;
		border-radius: 50%;
		background: var(--ui-danger);
		animation: pulse 1s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.3;
		}
	}
	.time {
		color: var(--ui-fg);
		font-variant-numeric: tabular-nums;
	}
	.transcript {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin: 0;
		padding-block: 1rem;
		padding-inline: 1.25rem 0.5rem;
		border-radius: calc(var(--ui-radius) + 0.5rem);
		background: var(--ui-subtle);
		animation: appear 300ms var(--ui-ease-out);
	}
	blockquote {
		flex: 1;
		margin: 0;
		line-height: 1.6;
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
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.transcript {
			animation: none;
		}
		.live {
			animation-duration: 2s;
		}
	}
</style>
