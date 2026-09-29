<script lang="ts">
	import { Mic01Icon, MicOff01Icon, Moon02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import DynamicIsland from '#lib/ui/DynamicIsland.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { now } from '#lib/ui/now.svelte.js';
	import Progress from '#lib/ui/Progress.svelte';

	type View = 'upload' | 'uploaded' | 'prayer' | 'circle';
	let view = $state<View | ''>('');
	let expanded = $state(false);
	let settle: ReturnType<typeof setTimeout> | undefined;
	function show(next: View | '') {
		clearTimeout(settle);
		cancelAnimationFrame(frame);
		expanded = false;
		view = next;
	}
	const pct = new Intl.NumberFormat('en', { style: 'percent' });

	// Upload: three scans, sent one after another; when done it says so, then steps aside.
	const scans = [
		'Book of Optics, folio 12.jpg',
		'Book of Optics, folio 13.jpg',
		'Star tables, plate 4.jpg'
	];
	let progress = $state(0);
	let frame = 0;
	// Smooth progress, every frame, at a speed that drifts a little as a real upload's does.
	function upload() {
		show('upload');
		progress = 0;
		let last = performance.now();
		const step = (now: number) => {
			progress = Math.min(
				1,
				progress + ((now - last) / 1000) * (0.14 + 0.05 * Math.sin(now / 700))
			);
			last = now;
			if (progress < 1) frame = requestAnimationFrame(step);
			else {
				view = 'uploaded';
				expanded = false;
				settle = setTimeout(() => (view = ''), 2600);
			}
		};
		frame = requestAnimationFrame(step);
	}
	$effect(() => () => cancelAnimationFrame(frame));
	const current = $derived(Math.min(scans.length - 1, Math.floor(progress * scans.length)));

	// Next prayer: today's times; the next one is whichever hasn't passed yet.
	const prayers = [
		['Fajr', '04:52'],
		['Dhuhr', '12:08'],
		['Asr', '15:31'],
		['Maghrib', '18:14'],
		['Isha', '19:36']
	] as const;
	const minuteOfDay = (hhmm: string) => {
		const [h, m] = hhmm.split(':').map(Number);
		return h * 60 + m;
	};
	const next = $derived.by(() => {
		const d = new Date(now());
		const here = d.getHours() * 60 + d.getMinutes();
		const i = prayers.findIndex(([, t]) => minuteOfDay(t) > here);
		const at = i === -1 ? 0 : i;
		return { i: at, wait: (minuteOfDay(prayers[at][1]) - here + 1440) % 1440 };
	});
	const until = $derived.by(() => {
		const unit = (u: string, n: number) =>
			new Intl.NumberFormat('en', { style: 'unit', unit: u, unitDisplay: 'short' }).format(n);
		const h = Math.floor(next.wait / 60);
		const m = next.wait % 60;
		return `in ${[h && unit('hour', h), m && unit('minute', m)].filter(Boolean).join(' ') || 'a moment'}`;
	});
	const clock = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });
	const show12 = (hhmm: string) => clock.format(new Date(`2000-01-01T${hhmm}`));

	let muted = $state(false);
</script>

<div class="stage">
	<!-- A fixed-height zone: the island grows inside it, so nothing below moves. -->
	<div class="zone">
		<DynamicIsland label="Live activity" {view} bind:expanded expandable={(v) => v !== 'uploaded'}>
			{#snippet children(v, open)}
				{#if v === 'upload'}
					{#if !open}
						<div class="compact">
							<svg class="ring" viewBox="0 0 20 20" aria-hidden="true">
								<circle cx="10" cy="10" r="8" pathLength="1" class="track" />
								<circle
									cx="10"
									cy="10"
									r="8"
									pathLength="1"
									class="done"
									style:stroke-dashoffset={1 - progress}
								/>
							</svg>
							<span class="spacer"></span>
							<span class="value slot">{pct.format(progress)}</span>
						</div>
					{:else}
						<div class="panel">
							<Progress label="Uploading {scans.length} scans" value={progress * 100} />
							<p class="muted">{current + 1} of {scans.length}: {scans[current]}</p>
							<Button variant="danger" onclick={() => show('')}>Cancel upload</Button>
						</div>
					{/if}
				{:else if v === 'uploaded'}
					<div class="compact">
						<span class="accent"><Icon icon={Tick02Icon} size={16} strokeWidth={2.5} /></span>
						<span class="spacer"></span>
						<span class="value">Uploaded</span>
					</div>
				{:else if v === 'prayer'}
					{#if !open}
						<div class="compact">
							<span class="accent"><Icon icon={Moon02Icon} size={16} /></span>
							<span class="value">{prayers[next.i][0]}</span>
							<span class="spacer"></span>
							<span class="muted">{until}</span>
						</div>
					{:else}
						<div class="panel">
							<p class="title">Prayer times · Baghdad</p>
							<ol class="times">
								{#each prayers as [name, time], i (name)}
									<li class={[i === next.i && 'next', i < next.i && 'past']}>
										<span>{name}</span><span>{show12(time)}</span>
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				{:else if v === 'circle'}
					{#if !open}
						<div class="compact">
							<span class={['wave', muted && 'quiet']} aria-hidden="true"
								>{#each [0.8, 0.5, 0.95, 0.6] as d, i (i)}<span style:animation-duration="{d}s"
									></span>{/each}</span
							>
							<span class="value">Live</span>
							<span class="spacer"></span>
							<span class="muted">12 listening</span>
						</div>
					{:else}
						<div class="panel">
							<div>
								<p class="title">Reading circle</p>
								<p class="muted">The Book of Optics, chapter 3 · 12 listening</p>
							</div>
							<div class="actions">
								<Button variant="secondary" aria-pressed={muted} onclick={() => (muted = !muted)}>
									<Icon icon={muted ? MicOff01Icon : Mic01Icon} size={16} />
									{muted ? 'Unmute' : 'Mute'}
								</Button>
								<Button variant="danger" onclick={() => show('')}>Leave</Button>
							</div>
						</div>
					{/if}
				{/if}
			{/snippet}
		</DynamicIsland>
	</div>

	<div class="switcher" role="group" aria-label="Start an activity">
		<Button variant="secondary" size="sm" onclick={upload}>Upload scans</Button>
		<Button variant="secondary" size="sm" onclick={() => show('prayer')}>Next prayer</Button>
		<Button variant="secondary" size="sm" onclick={() => show('circle')}>Join reading circle</Button
		>
		<Button variant="ghost" size="sm" onclick={() => show('')}>Clear</Button>
	</div>
	<p class="hint">Tap the island for details.</p>
</div>

<style>
	.stage {
		display: grid;
		justify-items: center;
		gap: 1.25rem;
		inline-size: 100%;
	}
	.zone {
		display: grid;
		justify-items: center;
		align-items: start;
		inline-size: 100%;
		block-size: 15.5rem;
	}
	.switcher {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}
	.hint {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	/* Compact: one line either side of the camera, never wrapping. */
	.compact {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		block-size: 2.3rem;
		padding-inline: 0.75rem 1rem;
		white-space: nowrap;
	}
	.spacer {
		inline-size: 4.5rem;
	}
	.value {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	/* Changing numbers get a fixed slot, so the island doesn't resize as they tick. */
	.slot {
		min-inline-size: 3.25em;
		text-align: end;
	}
	.muted {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.accent {
		display: flex;
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
	}
	.title {
		margin: 0;
		font-weight: 600;
	}
	.ring {
		inline-size: 1.125rem;
		rotate: -90deg;
	}
	.ring circle {
		fill: none;
		stroke-width: 3;
	}
	.ring .track {
		stroke: var(--ui-hover);
	}
	.ring .done {
		stroke: var(--ui-accent);
		stroke-linecap: round;
		stroke-dasharray: 1;
	}
	/* Opened: a card with room to read. */
	.panel {
		display: grid;
		gap: 0.875rem;
		box-sizing: border-box;
		inline-size: min(22rem, 100vw - 3rem);
		padding: 1.25rem;
	}
	.times {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
	.times li {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0.625rem;
		border-radius: var(--ui-radius);
	}
	.times .next {
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
		font-weight: 600;
	}
	.times .past {
		color: var(--ui-muted);
	}
	/* Two actions share the row evenly. */
	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	.actions :global(.btn) {
		inline-size: 100%;
	}
	.wave {
		display: flex;
		align-items: center;
		gap: 2px;
		block-size: 1rem;
	}
	.wave span {
		inline-size: 3px;
		block-size: 100%;
		border-radius: 2px;
		background: var(--ui-accent);
		animation: talk ease-in-out infinite alternate;
	}
	.quiet span {
		animation: none;
		transform: scaleY(0.25);
		background: var(--ui-muted);
	}
	@keyframes talk {
		from {
			transform: scaleY(0.3);
		}
		to {
			transform: scaleY(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wave span {
			animation: none;
		}
	}
</style>
