<script lang="ts" module>
	export interface Alarm {
		id: string;
		/** "HH:MM", 24-hour. */
		time: string;
		label: string;
		on: boolean;
		/** Offers Snooze when it rings. */
		snooze?: boolean;
		/** Rings once, then removes itself (a snooze). */
		once?: boolean;
	}
</script>

<script lang="ts">
	import { ms, reflow } from './motion';
	import Widget from './Widget.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Add01Icon, MinusSignIcon } from '@hugeicons/core-free-icons';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import { chime } from './chime';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Input from './Input.svelte';
	import RollingNumber from './RollingNumber.svelte';
	import { now } from './now.svelte';
	import { load, save as store } from './stored';
	import Switch from './Switch.svelte';
	import WheelPicker from './WheelPicker.svelte';

	interface Props {
		alarms?: Alarm[];
		/** Remember alarms in this browser under this key. */
		persist?: string;
		/** Minutes a snooze lasts. */
		snooze?: number;
		locale?: string;
		class?: string;
	}

	let {
		alarms = $bindable([]),
		persist,
		snooze = 5,
		locale = 'en',
		class: className
	}: Props = $props();

	let mounted = $state(false);
	onMount(() => {
		const saved = persist && load(persist, null);
		if (Array.isArray(saved)) alarms = saved;
		mounted = true;
	});
	$effect(() => {
		const list = $state.snapshot(alarms);
		if (mounted && persist) store(persist, list);
	});

	const t = $derived(mounted ? new Date(now()) : undefined);
	const hhmm = (d: Date) =>
		`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	const timeFmt = $derived(new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }));
	const show = (time: string) => timeFmt.format(new Date(`2000-01-01T${time}`));

	// When the next alarm rings, in words: "in 7 hr, 12 min".
	const next = $derived.by(() => {
		if (!t) return undefined;
		const mins = t.getHours() * 60 + t.getMinutes();
		const waits = alarms
			.filter((a) => a.on)
			.map((a) => {
				const [h, m] = a.time.split(':').map(Number);
				return (h * 60 + m - mins + 1440) % 1440 || 1440;
			});
		if (!waits.length) return undefined;
		const w = Math.min(...waits);
		const unit = (u: string, n: number) =>
			new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'short' }).format(n);
		return [
			Math.floor(w / 60) && unit('hour', Math.floor(w / 60)),
			w % 60 && unit('minute', w % 60)
		]
			.filter(Boolean)
			.join(', ');
	});

	// Ringing: checked every second; each alarm rings once in its minute.
	let ringing = $state<Alarm>();
	let rangAt = '';
	let repeat: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		if (!t || ringing) return;
		const key = hhmm(t);
		if (key === rangAt) return;
		const due = alarms.find((a) => a.on && a.time === key);
		if (!due) return;
		rangAt = key;
		ringing = due;
		announce(`${due.label || 'Alarm'}, ${show(due.time)}`, 'assertive');
		chime(2);
		repeat = setInterval(() => chime(2), 2500);
	});
	function stop(snoozed = false) {
		clearInterval(repeat);
		const rang = ringing;
		ringing = undefined;
		if (!rang) return;
		alarms = alarms.filter((a) => !(a.once && a.id === rang.id));
		if (snoozed) {
			const at = new Date(Date.now() + snooze * 60_000);
			alarms = [
				...alarms,
				{ id: crypto.randomUUID(), time: hhmm(at), label: rang.label, on: true, once: true }
			];
			announce(`Snoozed until ${show(hhmm(at))}`);
		}
	}
	$effect(() => () => clearInterval(repeat));

	// Adding one, in a sheet with wheels, as on iOS.
	let adding = $state(false);
	let editing = $state(false);
	const hour12 = $derived(
		['h11', 'h12'].includes(
			new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle ?? ''
		)
	);
	const pad = (n: number) => String(n).padStart(2, '0');
	let wHour = $state(5);
	let wMinute = $state(30);
	let wPm = $state(0);
	let newLabel = $state('');
	let newSnooze = $state(true);
	const periods = $derived(
		[9, 21].map(
			(h) =>
				new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
					.formatToParts(new Date(2000, 0, 1, h))
					.find((p) => p.type === 'dayPeriod')?.value ?? ''
		)
	);
	function openSheet() {
		const t = new Date();
		wHour = hour12 ? t.getHours() % 12 || 12 : t.getHours();
		wMinute = t.getMinutes();
		wPm = t.getHours() >= 12 ? 1 : 0;
		newLabel = '';
		newSnooze = true;
		adding = true;
	}
	function save() {
		const h24 = hour12 ? (wHour % 12) + (wPm ? 12 : 0) : wHour;
		const time = `${pad(h24)}:${pad(wMinute)}`;
		alarms = [
			...alarms,
			{ id: crypto.randomUUID(), time, label: newLabel.trim(), on: true, snooze: newSnooze }
		].sort((a, b) => a.time.localeCompare(b.time));
		announce(`Alarm set for ${show(time)}`);
		adding = false;
	}
	// The time split into its number and its period, for the large-and-small iOS type.
	const split = (time: string) => {
		const parts = timeFmt.formatToParts(new Date(`2000-01-01T${time}`));
		const period = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';
		const main = parts
			.filter((p) => p.type !== 'dayPeriod')
			.map((p) => p.value)
			.join('')
			.trim();
		return { main, period };
	};
</script>

<Widget label="Alarm clock" tone="var(--ui-accent)" max="48rem" class={className}>
	<div class={['alarms']}>
		<div class="bar">
			<Button
				variant="ghost"
				aria-pressed={editing}
				disabled={!alarms.length}
				onclick={() => (editing = !editing)}>{editing ? 'Done' : 'Edit'}</Button
			>
			<Button variant="secondary" square aria-label="Add alarm" onclick={openSheet}>
				<Icon icon={Add01Icon} size={20} />
			</Button>
		</div>
		<header>
			<p class="now">
				<time datetime={t?.toISOString()}
					>{#if t}<RollingNumber value={timeFmt.format(t)} />{:else}––:––{/if}</time
				>
			</p>
			<p class="next" aria-live="polite">
				{#if next}Next alarm in {next}{:else}No alarms on{/if}
			</p>
		</header>

		{#if alarms.length}
			<ul class="list" aria-label="Alarms">
				{#each alarms as a (a.id)}
					{@const t2 = split(a.time)}
					<li
						class={['alarm', !a.on && 'off']}
						animate:reflow
						transition:fly={{ y: -6, duration: ms(200) }}
					>
						{#if editing}
							<button
								type="button"
								class="remove"
								aria-label="Delete {a.label || 'alarm'} at {show(a.time)}"
								onclick={() => {
									alarms = alarms.filter((x) => x !== a);
									if (!alarms.length) editing = false;
								}}
								transition:fly={{ x: -12, duration: ms(180) }}
							>
								<Icon icon={MinusSignIcon} size={14} strokeWidth={3} />
							</button>
						{/if}
						<div class="what">
							<span class="time"
								>{t2.main}{#if t2.period}<small>{t2.period}</small>{/if}</span
							>
							<span class="label">{a.label || 'Alarm'}{a.once ? ' (snoozed)' : ''}</span>
						</div>
						<Switch bind:checked={a.on} aria-label="{a.label || 'Alarm'} at {show(a.time)}" />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</Widget>

<Dialog bind:open={adding} title="Add alarm">
	<div class="sheet">
		<div class="wheels" role="group" aria-label="Time">
			<span class="band" aria-hidden="true"></span>
			<WheelPicker
				label="Hour"
				items={Array.from({ length: hour12 ? 12 : 24 }, (_, i) => {
					const v = hour12 ? i + 1 : i;
					return { value: v, label: String(v) };
				})}
				bind:value={wHour}
			/>
			<WheelPicker
				label="Minute"
				items={Array.from({ length: 60 }, (_, i) => ({ value: i, label: pad(i) }))}
				bind:value={wMinute}
			/>
			{#if hour12}
				<WheelPicker
					label="AM or PM"
					items={periods.map((p, i) => ({ value: i, label: p }))}
					bind:value={wPm}
				/>
			{/if}
		</div>
		<Input label="Label" bind:value={newLabel} placeholder="Alarm" />
		<Switch bind:checked={newSnooze}>Snooze</Switch>
	</div>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (adding = false)}>Cancel</Button>
		<Button onclick={save}>Save</Button>
	{/snippet}
</Dialog>

<Dialog
	open={!!ringing}
	title={ringing?.label || 'Alarm'}
	description={ringing ? show(ringing.time) : undefined}
	onclose={() => ringing && stop()}
>
	{#snippet footer()}
		{#if ringing?.snooze !== false}
			<Button variant="secondary" onclick={() => stop(true)}>Snooze {snooze} min</Button>
		{/if}
		<Button onclick={() => stop()}>Stop</Button>
	{/snippet}
</Dialog>

<style>
	.alarms {
		display: grid;
		gap: 0.75rem;
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	/* Edit's label lines up with the alarm times below, not its own padding. */
	.bar > :global(:first-child) {
		margin-inline-start: -0.75rem;
	}
	header {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
		padding-block: 0.5rem 1rem;
	}
	.now {
		margin: 0;
		font: 200 3rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	.next {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	/* Desktop: the time and what's next on the left, the alarms on the right. */
	@container widget (min-width: 36rem) {
		.alarms {
			grid-template: 'bar bar' auto 'now list' 1fr / 1fr 1.4fr;
			column-gap: 2rem;
		}
		.bar {
			grid-area: bar;
		}
		header {
			grid-area: now;
			align-self: start;
		}
		.list {
			grid-area: list;
		}
	}
	/* iOS rows: hairlines between, big thin time, the name under it, the switch to the right. */
	.list {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.alarm {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0.25rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.alarm:first-child {
		box-shadow:
			inset 0 1px var(--ui-line),
			inset 0 -1px var(--ui-line);
	}
	.what {
		display: grid;
		flex: 1;
	}
	.time {
		font: 200 2.75rem/1.05 var(--ui-font);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
	}
	.time small {
		margin-inline-start: 0.25rem;
		font-size: 1.125rem;
		font-weight: 400;
	}
	.label {
		font-size: 0.875rem;
	}
	/* Off: resting, still readable. */
	.off .time,
	.off .label {
		color: var(--ui-muted);
	}
	.remove {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 1.5rem;
		block-size: 1.5rem;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-danger);
		color: var(--ui-on-danger);
		cursor: pointer;
	}
	.remove:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.sheet {
		display: grid;
		gap: 1rem;
	}
	.wheels {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
	}
	.band {
		position: absolute;
		inset-inline: 0;
		top: 50%;
		block-size: 2.25rem;
		translate: 0 -50%;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		pointer-events: none;
	}
</style>
