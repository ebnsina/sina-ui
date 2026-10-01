<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Mic01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Orb from '#lib/ui/Orb.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';

	type State = 'idle' | 'listening' | 'thinking' | 'speaking';
	let mode = $state<State>('idle');
	let level = $state(0);
	let color = $state('var(--ui-accent)');

	// A pretend conversation: you speak, it thinks, it answers. In your app, level comes from the
	// microphone (an AnalyserNode) while listening, and from the voice playing while speaking.
	let timers: ReturnType<typeof setTimeout>[] = [];
	let talking: ReturnType<typeof setInterval> | undefined;
	const voice = () => {
		clearInterval(talking);
		talking = setInterval(
			() => (level = Math.max(0, Math.min(1, level * 0.5 + Math.random() * 0.7))),
			90
		);
	};
	const clear = () => {
		timers.forEach(clearTimeout);
		timers = [];
		clearInterval(talking);
		level = 0;
	};
	onDestroy(clear);

	function converse() {
		clear();
		mode = 'listening';
		voice();
		timers.push(setTimeout(() => ((mode = 'thinking'), clearInterval(talking), (level = 0)), 2600));
		timers.push(setTimeout(() => ((mode = 'speaking'), voice()), 4200));
		timers.push(setTimeout(() => ((mode = 'idle'), clear()), 7600));
	}

	const colors = [
		{ name: 'Emerald', value: 'var(--ui-accent)' },
		{ name: 'Blue', value: '#3b82f6' },
		{ name: 'Rose', value: '#f43f5e' },
		{ name: 'Amber', value: '#f59e0b' }
	];
</script>

<div class="voice">
	<Orb {mode} {level} {color} label="Librarian" />
	<p class="said" aria-live="polite">
		{{
			idle: 'Ready when you are.',
			listening: 'Listening…',
			thinking: 'Thinking…',
			speaking: 'Speaking…'
		}[mode]}
	</p>
	<Button onclick={converse} disabled={mode !== 'idle'}>
		<Icon icon={Mic01Icon} size={16} /> Talk to the librarian
	</Button>
	<Segmented
		label="Hold a state"
		options={[
			{ value: 'idle', label: 'Idle' },
			{ value: 'listening', label: 'Listening' },
			{ value: 'thinking', label: 'Thinking' },
			{ value: 'speaking', label: 'Speaking' }
		]}
		bind:value={
			() => mode,
			(v) => {
				clear();
				mode = v as State;
				if (v === 'listening' || v === 'speaking') voice();
			}
		}
	/>
	<div class="colors" role="radiogroup" aria-label="Color">
		{#each colors as c (c.name)}
			<button
				type="button"
				class="swatch"
				role="radio"
				aria-checked={color === c.value}
				aria-label={c.name}
				style:--c={c.value}
				onclick={() => (color = c.value)}
			></button>
		{/each}
	</div>
</div>

<style>
	.voice {
		display: grid;
		justify-items: center;
		gap: 1rem;
	}
	.said {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.9375rem;
	}
	.colors {
		display: flex;
		gap: 0.5rem;
	}
	.swatch {
		inline-size: 1.5rem;
		block-size: 1.5rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--c);
		cursor: pointer;
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.swatch:active {
		transform: scale(0.9);
	}
	.swatch[aria-checked='true'] {
		outline: 2px solid var(--c);
		outline-offset: 2px;
	}
	.swatch:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
