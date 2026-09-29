<script lang="ts">
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import {
		CalendarDate,
		CalendarDateTime,
		DateFormatter,
		getLocalTimeZone,
		isSameDay,
		today
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { now } from '#lib/ui/now.svelte.js';
	import { at, layout, onDay, span, type CalendarDef, type CalendarEvent } from './events';

	interface Props {
		days: CalendarDate[];
		events: CalendarEvent[];
		calendars: CalendarDef[];
		locale: string;
		onopen: (e: CalendarEvent) => void;
		oncreate: (start: CalendarDateTime, end: CalendarDateTime, allDay?: boolean) => void;
		onmove: (e: CalendarEvent) => void;
		onday: (day: CalendarDate) => void;
	}

	let { days, events, calendars, locale, onopen, oncreate, onmove, onday }: Props = $props();

	const PX = 0.8; // px per minute: 48px an hour
	const SNAP = 15;
	const snap = (px: number, round = Math.round) =>
		Math.min(1440, Math.max(0, round(px / PX / SNAP) * SNAP));
	const calOf = (e: CalendarEvent) => calendars.find((c) => c.id === e.calendar);
	const color = (e: CalendarEvent) => calOf(e)?.color;

	const utc = (opts: Intl.DateTimeFormatOptions) =>
		new DateFormatter(locale, { ...opts, timeZone: 'UTC' });
	const weekday = $derived(utc({ weekday: days.length > 1 ? 'short' : 'long' }));
	const hour = $derived(utc({ hour: 'numeric' }));
	const times = $derived(utc({ hour: 'numeric', minute: '2-digit' }));
	const longDay = $derived(utc({ weekday: 'long', month: 'long', day: 'numeric' }));
	const range = (e: CalendarEvent) => times.formatRange(e.start.toDate('UTC'), e.end.toDate('UTC'));

	// Today and the time only exist in the browser: no line until then, rather than a wrong one.
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const todayDate = $derived(mounted ? today(getLocalTimeZone()) : undefined);
	const minuteNow = $derived.by(() => {
		if (!mounted) return 0;
		const d = new Date(now());
		return d.getHours() * 60 + d.getMinutes();
	});

	// Dragging an event moves it (or, from its bottom edge, resizes it); the grid shows where it
	// would land and it's only saved on release.
	let drag = $state<{
		id: string;
		resize: boolean;
		x: number;
		y: number;
		day: number;
		min: number;
	}>();
	let dragged = false;
	let cols: HTMLDivElement;

	function preview(e: CalendarEvent): CalendarEvent {
		if (!drag || drag.id !== e.id) return e;
		if (drag.resize) {
			const end = e.end.add({ minutes: drag.min });
			return {
				...e,
				end: end.compare(e.start.add({ minutes: SNAP })) < 0 ? e.start.add({ minutes: SNAP }) : end
			};
		}
		const by = { days: drag.day, minutes: drag.min };
		return { ...e, start: e.start.add(by), end: e.end.add(by) };
	}
	const shown = $derived(events.map(preview));

	function grab(ev: PointerEvent, e: CalendarEvent, resize: boolean) {
		if (ev.button !== 0) return;
		ev.stopPropagation();
		(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
		dragged = false;
		drag = { id: e.id, resize, x: ev.clientX, y: ev.clientY, day: 0, min: 0 };
	}
	function slide(ev: PointerEvent) {
		if (!drag) return;
		const dy = ev.clientY - drag.y;
		if (!dragged && Math.hypot(ev.clientX - drag.x, dy) < 4) return;
		dragged = true;
		const r = cols.getBoundingClientRect();
		const w = r.width / days.length;
		const from = Math.floor((drag.x - r.left) / w);
		const to = Math.min(days.length - 1, Math.max(0, Math.floor((ev.clientX - r.left) / w)));
		drag.min = Math.round(dy / PX / SNAP) * SNAP;
		drag.day = drag.resize ? 0 : to - from;
	}
	function drop() {
		if (!drag) return;
		const e = events.find((x) => x.id === drag!.id);
		if (e && dragged && (drag.min || drag.day)) onmove(preview(e));
		drag = undefined;
	}

	// Pressing an empty stretch of a day and dragging draws a new event, in quarter hours.
	let draw = $state<{ day: number; anchor: number; from: number; to: number; y: number }>();
	function begin(ev: PointerEvent, day: number) {
		if (ev.button !== 0 || ev.target !== ev.currentTarget) return;
		(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
		const top = (ev.currentTarget as HTMLElement).getBoundingClientRect().top;
		const m = Math.min(1440 - SNAP, snap(ev.clientY - top, Math.floor));
		draw = { day, anchor: m, from: m, to: m + SNAP, y: ev.clientY };
	}
	function extend(ev: PointerEvent) {
		if (!draw) return;
		const top = (ev.currentTarget as HTMLElement).getBoundingClientRect().top;
		const m = snap(ev.clientY - top);
		draw.from = Math.min(draw.anchor, m);
		draw.to = Math.max(draw.anchor + SNAP, m);
	}
	function finish(ev: PointerEvent) {
		if (!draw) return;
		const { day, from, y } = draw;
		// A plain click makes an hour-long event, as calendars do.
		const to = Math.abs(ev.clientY - y) < 4 ? Math.min(1440, from + 60) : draw.to;
		draw = undefined;
		oncreate(at(days[day], from), at(days[day], to));
	}

	// Opens on the working day rather than midnight; again next frame, in case it had no height yet.
	function toMorning(node: HTMLElement) {
		const go = () => (node.scrollTop = 8 * 60 * PX - 8);
		go();
		requestAnimationFrame(go);
	}
</script>

<div class="grid" style:--days={days.length}>
	<div class="head">
		<span></span>
		{#each days as day (day.toString())}
			<button
				type="button"
				class={['day-name', todayDate && isSameDay(day, todayDate) && 'today']}
				aria-label={longDay.format(day.toDate('UTC'))}
				onclick={() => onday(day)}
			>
				<span>{weekday.format(day.toDate('UTC'))}</span>
				<span class="num">{day.day}</span>
			</button>
		{/each}
	</div>
	<div class="all-day">
		<span class="gutter-label">All day</span>
		{#each days as day (day.toString())}
			<div class="all-day-cell">
				{#each shown.filter((e) => e.allDay && onDay(e, day)) as e (e.id)}
					<button type="button" class="chip" style:--c={color(e)} onclick={() => onopen(e)}
						>{#if calOf(e)?.icon}<Icon icon={calOf(e)!.icon!} size={13} />{/if}{e.title}</button
					>
				{/each}
			</div>
		{/each}
	</div>
	<div class="scroll" {@attach toMorning} {@attach scrollEdges} data-fade>
		<div class="body">
			<div class="hours" aria-hidden="true">
				{#each { length: 23 }, i (i)}
					<span style:top="{(i + 1) * 60 * PX}px"
						>{hour.format(new Date(Date.UTC(2000, 0, 1, i + 1)))}</span
					>
				{/each}
			</div>
			<div class="cols" bind:this={cols}>
				{#each days as day, di (day.toString())}
					{@const timed = shown.filter((e) => {
						if (e.allDay || !onDay(e, day)) return false;
						const s = span(e, day);
						return s.end > s.start;
					})}
					<!-- Pointer only: keyboard users add events with the New event button. -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="col"
						role="group"
						aria-label={longDay.format(day.toDate('UTC'))}
						onpointerdown={(ev) => begin(ev, di)}
						onpointermove={extend}
						onpointerup={finish}
						onpointercancel={() => (draw = undefined)}
					>
						{#each layout(timed) as { e, col, cols: n } (e.id)}
							{@const s = span(e, day)}
							<button
								type="button"
								class={['event', drag?.id === e.id && 'dragging', s.end - s.start < 50 && 'short']}
								style:--c={color(e)}
								style:top="{s.start * PX}px"
								style:height="{Math.max(SNAP, s.end - s.start) * PX - 2}px"
								style:left="calc({(col / n) * 100}% + 2px)"
								style:width="calc({100 / n}% - 4px)"
								aria-label="{e.title}, {range(e)}, {calendars.find((c) => c.id === e.calendar)
									?.name}"
								onpointerdown={(ev) => grab(ev, e, false)}
								onpointermove={slide}
								onpointerup={drop}
								onpointercancel={() => (drag = undefined)}
								onclick={() => {
									if (dragged) dragged = false;
									else onopen(e);
								}}
							>
								<span class="title"
									>{#if calOf(e)?.icon}<Icon icon={calOf(e)!.icon!} size={13} />{/if}{e.title}</span
								>
								<span class="time">{range(e)}</span>
								<span class="resize" aria-hidden="true" onpointerdown={(ev) => grab(ev, e, true)}
								></span>
							</button>
						{/each}
						{#if draw?.day === di}
							<div
								class="draft"
								style:top="{draw.from * PX}px"
								style:height="{(draw.to - draw.from) * PX - 2}px"
							>
								{times.formatRange(
									at(day, draw.from).toDate('UTC'),
									at(day, draw.to).toDate('UTC')
								)}
							</div>
						{/if}
						{#if todayDate && isSameDay(day, todayDate)}
							<div class="now" style:top="{minuteNow * PX}px" aria-hidden="true"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		min-block-size: 0;
		--gutter: 3.5rem;
	}
	.head,
	.all-day,
	.body {
		display: grid;
		grid-template-columns: var(--gutter) 1fr;
	}
	.head,
	.all-day {
		grid-template-columns: var(--gutter) repeat(var(--days), minmax(0, 1fr));
	}
	.all-day {
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.day-name {
		display: grid;
		justify-items: center;
		gap: 0.125rem;
		padding: 0.5rem 0.25rem;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-muted);
		font: 500 0.75rem/1.2 var(--ui-font);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background var(--ui-dur) var(--ui-ease-out);
	}
	.day-name:hover {
		background: var(--ui-subtle);
	}
	.day-name:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: calc(var(--ui-ring-offset) * -1);
	}
	.num {
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		border-radius: 50%;
		color: var(--ui-fg);
		font: 500 1.125rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
		text-transform: none;
	}
	.today {
		color: var(--ui-accent);
	}
	.today .num {
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.gutter-label {
		align-self: center;
		padding-inline-end: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.6875rem;
		text-align: end;
	}
	.all-day-cell {
		display: grid;
		align-content: start;
		gap: 2px;
		min-block-size: 1.75rem;
		padding: 2px;
		box-shadow: inset 1px 0 var(--ui-line);
	}
	.chip {
		overflow: hidden;
		padding: 0.1875rem 0.5rem;
		/* Transparent, so it shows only in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) - 2px);
		background: color-mix(in srgb, var(--c) 14%, var(--ui-surface));
		color: var(--ui-fg);
		font: 600 0.75rem/1.3 var(--ui-font);
		text-align: start;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
	}
	.scroll {
		min-block-size: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.body {
		position: relative;
		block-size: calc(1440px * 0.8);
	}
	.hours {
		position: relative;
	}
	.hours span {
		position: absolute;
		inset-inline-end: 0.5rem;
		translate: 0 -50%;
		color: var(--ui-muted);
		font-size: 0.6875rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(var(--days), minmax(0, 1fr));
		/* Hour lines, drawn once for every column. */
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 calc(48px - 1px),
			var(--ui-line) calc(48px - 1px) 48px
		);
	}
	.col {
		position: relative;
		box-shadow: inset 1px 0 var(--ui-line);
		touch-action: pan-y;
		cursor: cell;
	}
	.event {
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
		overflow: hidden;
		padding: 0.25rem 0.5rem;
		/* A tint of the calendar's colour, like an Alert; opaque, so hour lines don't show through.
		   The transparent border shows only in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) - 2px);
		background: color-mix(in srgb, var(--c) 14%, var(--ui-surface));
		color: var(--ui-fg);
		font: 0.75rem/1.3 var(--ui-font);
		text-align: start;
		cursor: grab;
		touch-action: none;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			transform var(--ui-dur) var(--ui-ease-out);
		@starting-style {
			opacity: 0;
			transform: scale(0.96);
		}
	}
	.event:focus-visible,
	.chip:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
		z-index: 2;
	}
	/* Picked up: it lifts off the grid while it follows the pointer. */
	.dragging {
		z-index: 3;
		cursor: grabbing;
		transform: scale(1.02);
		box-shadow: var(--ui-shadow-overlay);
		transition: none;
	}
	.short {
		flex-direction: row;
		gap: 0.375rem;
		padding-block: 0.0625rem;
	}
	/* On one line the time gives way before the title does. */
	.short .time {
		flex-shrink: 100;
	}
	.title {
		min-block-size: 1lh;
		overflow: hidden;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Inline, so a long title still ends in an ellipsis. */
	:is(.title, .chip) :global(svg) {
		display: inline-block;
		margin-inline-end: 0.25rem;
		vertical-align: -2px;
		color: var(--c);
	}
	.time {
		overflow: hidden;
		color: var(--ui-muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.resize {
		position: absolute;
		inset-inline: 0;
		inset-block-end: 0;
		block-size: 6px;
		cursor: ns-resize;
	}
	.draft {
		position: absolute;
		inset-inline: 2px;
		padding: 0.25rem 0.5rem;
		border-radius: calc(var(--ui-radius) - 2px);
		background: color-mix(in srgb, var(--ui-accent) 24%, var(--ui-surface));
		box-shadow: var(--ui-shadow-overlay);
		color: var(--ui-fg);
		font: 600 0.75rem/1.3 var(--ui-font);
		pointer-events: none;
	}
	/* The current time: a line across today with a dot at its start. */
	.now {
		position: absolute;
		inset-inline: 0;
		z-index: 4;
		block-size: 2px;
		background: var(--ui-danger);
		pointer-events: none;
	}
	.now::before {
		content: '';
		position: absolute;
		inset-inline-start: -5px;
		inset-block-start: -4px;
		inline-size: 10px;
		block-size: 10px;
		border-radius: 50%;
		background: var(--ui-danger);
	}
	@media (prefers-reduced-motion: reduce) {
		.event {
			transition: none;
		}
		.dragging {
			transform: none;
		}
	}
</style>
