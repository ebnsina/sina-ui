<script lang="ts">
	import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';

	interface Props {
		src: string;
		/** Names it for screen readers ("Voice message from Maryam"). */
		label: string;
		class?: string;
	}

	let { src, label, class: className }: Props = $props();

	let audio = $state<HTMLAudioElement>();
	let paused = $state(true);
	let current = $state(0);
	let duration = $state(0);
	let failed = $state(false);
	const clock = (s: number) =>
		`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
</script>

<div class={['note', className]} role="group" aria-label={label}>
	<audio
		bind:this={audio}
		{src}
		preload="metadata"
		bind:paused
		bind:currentTime={current}
		bind:duration
		onerror={() => (failed = true)}
	></audio>
	{#if failed}
		<span class="failed">This voice message couldn’t be played.</span>
	{:else}
		<button
			type="button"
			class="play"
			aria-label={paused ? 'Play' : 'Pause'}
			onclick={() => (paused ? audio?.play() : audio?.pause())}
		>
			<Icon icon={paused ? PlayIcon : PauseIcon} size={16} />
		</button>
		<input
			type="range"
			min="0"
			max={duration || 0}
			step="0.1"
			bind:value={current}
			aria-label="Position"
			aria-valuetext="{clock(current)} of {clock(duration || 0)}"
			style:--at="{duration ? (current / duration) * 100 : 0}%"
		/>
		<span class="time">{clock(paused && !current ? duration || 0 : current)}</span>
	{/if}
</div>

<style>
	.note {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		inline-size: min(16rem, 100%);
		padding: 0.375rem 0.75rem 0.375rem 0.375rem;
		border-radius: 999px;
		background: var(--ui-subtle);
		font-size: 0.8125rem;
	}
	.play {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 2rem;
		block-size: 2rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		cursor: pointer;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.play:active {
		scale: 0.92;
	}
	.play:focus-visible,
	input:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: 1rem;
		margin: 0;
		background: none;
		appearance: none;
		cursor: pointer;
	}
	input::-webkit-slider-runnable-track {
		block-size: 0.25rem;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--ui-accent) var(--at),
			color-mix(in srgb, var(--ui-fg) 18%, transparent) var(--at)
		);
	}
	input::-moz-range-track {
		block-size: 0.25rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--ui-fg) 18%, transparent);
	}
	input::-moz-range-progress {
		block-size: 0.25rem;
		border-radius: 999px;
		background: var(--ui-accent);
	}
	input::-webkit-slider-thumb {
		inline-size: 0.75rem;
		block-size: 0.75rem;
		margin-block-start: -0.25rem;
		border-radius: 50%;
		background: var(--ui-accent);
		appearance: none;
	}
	input::-moz-range-thumb {
		inline-size: 0.75rem;
		block-size: 0.75rem;
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
	}
	.time {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.failed {
		padding-inline-start: 0.375rem;
		color: var(--ui-muted);
	}
	:global([dir='rtl']) input::-webkit-slider-runnable-track {
		background: linear-gradient(
			to left,
			var(--ui-accent) var(--at),
			color-mix(in srgb, var(--ui-fg) 18%, transparent) var(--at)
		);
	}
</style>
