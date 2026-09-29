<script lang="ts">
	import { ms, reflow } from './motion';
	import Widget from './Widget.svelte';
	import { fly } from 'svelte/transition';
	import { announce } from './announce';
	import Button from './Button.svelte';

	interface Props {
		/** Names it for screen readers when there's more than one ("Experiment timer"). */
		label?: string;
		locale?: string;
		class?: string;
	}

	let { label = 'Stopwatch', locale = 'en', class: className }: Props = $props();

	let running = $state(false);
	// Timestamps, not a count of frames: exact even when the tab sleeps in the background.
	let startedAt = 0;
	let banked = $state(0);
	let elapsed = $state(0);
	let laps = $state<number[]>([]);
	let frame = 0;

	const two = $derived(new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }));
	function format(ms: number) {
		const cs = Math.floor(ms / 10) % 100;
		const s = Math.floor(ms / 1000) % 60;
		const m = Math.floor(ms / 60000) % 60;
		const h = Math.floor(ms / 3600000);
		return `${h ? `${h}:` : ''}${two.format(m)}:${two.format(s)}.${two.format(cs)}`;
	}

	function loop() {
		elapsed = banked + performance.now() - startedAt;
		frame = requestAnimationFrame(loop);
	}
	function toggle() {
		if (running) {
			cancelAnimationFrame(frame);
			banked = elapsed = banked + performance.now() - startedAt;
			announce(`Stopped at ${format(elapsed)}`);
		} else {
			startedAt = performance.now();
			frame = requestAnimationFrame(loop);
		}
		running = !running;
	}
	function lapOrReset() {
		if (running) {
			const total = banked + performance.now() - startedAt;
			const split = total - laps.reduce((a, b) => a + b, 0);
			laps = [...laps, split];
			announce(`Lap ${laps.length}, ${format(split)}`);
		} else {
			banked = elapsed = 0;
			laps = [];
		}
	}
	$effect(() => () => cancelAnimationFrame(frame));

	// The current lap runs live at the top; the fastest and slowest finished ones are marked.
	const current = $derived(elapsed - laps.reduce((a, b) => a + b, 0));
	const fastest = $derived(laps.length > 2 ? Math.min(...laps) : -1);
	const slowest = $derived(laps.length > 2 ? Math.max(...laps) : -1);
</script>

<Widget {label} max="44rem" class={className}>
	<div class={['stopwatch', laps.length > 0 && 'with-laps']}>
		<!-- Updates a hundred times a second: never announced as it runs, only when stopped or lapped. -->
		<p class="readout" role="timer" aria-live="off">{format(elapsed)}</p>
		<div class="actions">
			<Button variant="secondary" size="lg" onclick={lapOrReset} disabled={!running && !elapsed}>
				{running ? 'Lap' : 'Reset'}
			</Button>
			<Button variant={running ? 'danger' : 'primary'} size="lg" onclick={toggle}>
				{running ? 'Stop' : elapsed ? 'Resume' : 'Start'}
			</Button>
		</div>
		{#if laps.length || running}
			<ol class="laps" aria-label="Laps" reversed>
				{#if running || elapsed}
					<li class="lap live">
						<span>Lap {laps.length + 1}</span><span class="time">{format(current)}</span>
					</li>
				{/if}
				{#each laps.map((ms, i) => ({ ms, n: i + 1 })).reverse() as lap (lap.n)}
					<li
						class={['lap', lap.ms === fastest && 'fastest', lap.ms === slowest && 'slowest']}
						animate:reflow
						in:fly={{ y: -8, duration: ms(200) }}
					>
						<span>
							Lap {lap.n}
							{#if lap.ms === fastest}<span class="note">fastest</span>{/if}
							{#if lap.ms === slowest}<span class="note">slowest</span>{/if}
						</span>
						<span class="time">{format(lap.ms)}</span>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</Widget>

<style>
	.stopwatch {
		display: grid;
		grid-template-areas: 'time' 'actions' 'laps';
		justify-items: center;
		gap: 1.25rem;
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
	}
	.readout {
		grid-area: time;
		margin: 0.5rem 0;
		font: 200 4rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}
	/* Start/Stop and Lap/Reset share one row, each keeping its place and width. */
	.actions {
		grid-area: actions;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		inline-size: min(100%, 20rem);
	}
	.actions :global(.btn) {
		inline-size: 100%;
	}
	.laps {
		grid-area: laps;
		display: grid;
		inline-size: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
		font-variant-numeric: tabular-nums;
	}
	/* Desktop with laps: time and buttons on the left, laps beside them. Without laps, one column. */
	@container widget (min-width: 34rem) {
		.with-laps {
			grid-template: 'time laps' auto 'actions laps' 1fr / 1fr 1fr;
			align-items: start;
			column-gap: 2rem;
		}
		.laps {
			max-block-size: 14rem;
			overflow-y: auto;
		}
	}
	@container widget (max-width: 22rem) {
		.readout {
			font-size: 3rem;
		}
	}
	.lap {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0.25rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.live {
		color: var(--ui-muted);
	}
	.fastest .time,
	.fastest .note {
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
	}
	.slowest .time,
	.slowest .note {
		color: var(--ui-danger);
	}
	.note {
		margin-inline-start: 0.375rem;
		font-size: 0.75rem;
	}
</style>
