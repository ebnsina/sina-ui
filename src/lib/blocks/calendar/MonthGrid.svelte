<script lang="ts">
	import {
		CalendarDate,
		CalendarDateTime,
		DateFormatter,
		getLocalTimeZone,
		isSameDay,
		isSameMonth,
		startOfMonth,
		startOfWeek,
		today
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { at, onDay, type CalendarDef, type CalendarEvent } from './events';

	interface Props {
		month: CalendarDate;
		events: CalendarEvent[];
		calendars: CalendarDef[];
		locale: string;
		onopen: (e: CalendarEvent) => void;
		oncreate: (start: CalendarDateTime, end: CalendarDateTime, allDay?: boolean) => void;
		onday: (day: CalendarDate) => void;
	}

	let { month, events, calendars, locale, onopen, oncreate, onday }: Props = $props();

	const SHOWN = 3;
	const calOf = (e: CalendarEvent) => calendars.find((c) => c.id === e.calendar);
	const color = (e: CalendarEvent) => calOf(e)?.color;
	const utc = (opts: Intl.DateTimeFormatOptions) =>
		new DateFormatter(locale, { ...opts, timeZone: 'UTC' });
	const weekday = $derived(utc({ weekday: 'short' }));
	const time = $derived(utc({ hour: 'numeric', minute: '2-digit' }));
	const longDay = $derived(utc({ weekday: 'long', month: 'long', day: 'numeric' }));

	let mounted = $state(false);
	onMount(() => (mounted = true));
	const todayDate = $derived(mounted ? today(getLocalTimeZone()) : undefined);

	// Always six weeks, so the grid never changes height from one month to the next.
	const first = $derived(startOfWeek(startOfMonth(month), locale));
	const cells = $derived(Array.from({ length: 42 }, (_, i) => first.add({ days: i })));
	const dayEvents = (day: CalendarDate) =>
		events
			.filter((e) => onDay(e, day))
			.sort((a, b) => Number(!a.allDay) - Number(!b.allDay) || a.start.compare(b.start));
</script>

<div class="month">
	<div class="names" aria-hidden="true">
		{#each cells.slice(0, 7) as d (d.toString())}
			<span>{weekday.format(d.toDate('UTC'))}</span>
		{/each}
	</div>
	<div class="cells">
		{#each cells as day (day.toString())}
			{@const list = dayEvents(day)}
			<!-- Pointer only: pressing an empty part of a day adds an all-day event; keyboard users
			     have the New event button. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div
				class={['cell', !isSameMonth(day, month) && 'outside']}
				onclick={(ev) => ev.target === ev.currentTarget && oncreate(at(day, 0), at(day, 0), true)}
			>
				<button
					type="button"
					class={['num', todayDate && isSameDay(day, todayDate) && 'today']}
					aria-label="{longDay.format(day.toDate('UTC'))}, {list.length} events"
					onclick={() => onday(day)}>{day.day}</button
				>
				{#each list.slice(0, list.length > SHOWN ? SHOWN - 1 : SHOWN) as e (e.id)}
					<button
						type="button"
						class={['item', e.allDay && 'all-day']}
						style:--c={color(e)}
						onclick={() => onopen(e)}
					>
						{#if e.allDay && calOf(e)?.icon}<Icon
								icon={calOf(e)!.icon!}
								size={13}
							/>{/if}{#if !e.allDay}<span class="dot"></span><span class="time"
								>{time.format(e.start.toDate('UTC'))}</span
							>{/if}
						<span class="title">{e.title}</span>
					</button>
				{/each}
				{#if list.length > SHOWN}
					{@const n = list.length - SHOWN + 1}
					<button type="button" class="more" onclick={() => onday(day)}>
						{n} more
						<span class="sr-only">events</span>
					</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.month {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-block-size: 0;
	}
	.names,
	.cells {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}
	.names span {
		padding: 0.5rem;
		color: var(--ui-muted);
		font: 500 0.75rem/1.2 var(--ui-font);
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.cells {
		grid-template-rows: repeat(6, minmax(6.25rem, 1fr));
		box-shadow: inset 0 1px var(--ui-line);
	}
	.cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-inline-size: 0;
		padding: 0.25rem;
		box-shadow:
			inset -1px 0 var(--ui-line),
			inset 0 -1px var(--ui-line);
		cursor: cell;
	}
	.cell:nth-child(7n) {
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.outside .num,
	.outside .item {
		opacity: 0.5;
	}
	.num {
		align-self: center;
		display: grid;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--ui-fg);
		font: 500 0.8125rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: background var(--ui-dur) var(--ui-ease-out);
	}
	.num:hover {
		background: var(--ui-hover);
	}
	.num.today {
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.item,
	.more {
		display: flex;
		align-items: center;
		gap: 0.3125rem;
		min-inline-size: 0;
		padding: 0.125rem 0.375rem;
		border: 0;
		border-radius: calc(var(--ui-radius) - 2px);
		background: none;
		color: var(--ui-fg);
		font: 0.75rem/1.3 var(--ui-font);
		text-align: start;
		cursor: pointer;
		transition: background var(--ui-dur) var(--ui-ease-out);
	}
	.item:hover,
	.more:hover {
		background: var(--ui-subtle);
	}
	/* All-day events as a tint of their calendar, like an Alert. */
	.all-day {
		background: color-mix(in srgb, var(--c) 14%, transparent);
		font-weight: 600;
	}
	.all-day:hover {
		background: color-mix(in srgb, var(--c) 22%, transparent);
	}
	.all-day :global(svg) {
		flex: none;
		color: var(--c);
	}
	.dot {
		flex: none;
		inline-size: 0.5rem;
		block-size: 0.5rem;
		border-radius: 50%;
		background: var(--c);
	}
	.time {
		flex: none;
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.more {
		color: var(--ui-muted);
		font-weight: 500;
	}
	:is(.num, .item, .more):focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: calc(var(--ui-ring-offset) * -1);
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
