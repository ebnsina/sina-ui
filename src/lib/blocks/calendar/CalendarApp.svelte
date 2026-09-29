<script lang="ts">
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import {
		CalendarDate,
		CalendarDateTime,
		DateFormatter,
		Time,
		endOfWeek,
		getLocalTimeZone,
		startOfWeek,
		today
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Calendar from '#lib/ui/Calendar.svelte';
	import Checkbox from '#lib/ui/Checkbox.svelte';
	import DatePicker from '#lib/ui/DatePicker.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Switch from '#lib/ui/Switch.svelte';
	import TimeRangeField, { type TimeRange } from '#lib/ui/TimeRangeField.svelte';
	import { at, dayOf, minutesOf, type CalendarDef, type CalendarEvent } from './events';
	import Agenda from './Agenda.svelte';
	import MonthGrid from './MonthGrid.svelte';
	import TimeGrid from './TimeGrid.svelte';

	interface Props {
		events: CalendarEvent[];
		calendars: CalendarDef[];
		/** Week by default, or Day where there isn't room for seven columns. */
		view?: 'month' | 'week' | 'day';
		/** The day in view; today by default. */
		date?: CalendarDate;
		locale?: string;
		class?: string;
	}

	let {
		events = $bindable(),
		calendars,
		view = $bindable(),
		date = $bindable(today(getLocalTimeZone())),
		locale = 'en',
		class: className
	}: Props = $props();

	const formId = $props.id();
	// Narrow, seven columns are too thin to tap: start on one day, as phone calendars do.
	onMount(() => (view ??= app.clientWidth < 640 ? 'day' : 'week'));
	let app = $state<HTMLElement>()!;
	// Under 40rem wide, week reads as a list and month as a grid of dots with the chosen day below.
	let width = $state(0);
	const narrow = $derived(width > 0 && width < 640);
	let hidden = $state<string[]>([]);
	const visible = $derived(events.filter((e) => !hidden.includes(e.calendar)));
	const days = $derived(
		view === 'day'
			? [date]
			: Array.from({ length: 7 }, (_, i) => startOfWeek(date, locale).add({ days: i }))
	);

	const utc = (opts: Intl.DateTimeFormatOptions) =>
		new DateFormatter(locale, { ...opts, timeZone: 'UTC' });
	const heading = $derived.by(() => {
		const d = date.toDate('UTC');
		if (view === 'month') return utc({ month: 'long', year: 'numeric' }).format(d);
		if (view === 'day')
			return utc(
				narrow
					? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
					: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
			).format(d);
		return utc({ month: 'short', day: 'numeric', year: 'numeric' }).formatRange(
			startOfWeek(date, locale).toDate('UTC'),
			endOfWeek(date, locale).toDate('UTC')
		);
	});
	const unit = $derived(view === 'month' ? 'month' : view === 'week' ? 'week' : 'day');
	// Paging slides the new range in from the side it came from.
	let dir = $state(0);
	function page(by: number) {
		dir = by;
		date = date.add(view === 'month' ? { months: by } : { days: view === 'week' ? 7 * by : by });
	}
	function goTo(day: CalendarDate, v = view) {
		dir = day.compare(date);
		date = day;
		view = v;
	}

	// The event being edited: a copy, so Cancel leaves the calendar untouched.
	type Draft = {
		id?: string;
		title: string;
		calendar: string;
		day: CalendarDate;
		allDay: boolean;
		time: TimeRange;
	};
	let draft = $state<Draft>();
	let open = $state(false);
	let titleError = $state('');
	const toTime = (d: CalendarDateTime) => new Time(d.hour, d.minute);

	function create(start: CalendarDateTime, end: CalendarDateTime, allDay = false) {
		const endTime = dayOf(end).compare(dayOf(start)) > 0 ? new Time(23, 59) : toTime(end);
		edit({
			title: '',
			calendar: calendars.find((c) => !hidden.includes(c.id))?.id ?? calendars[0].id,
			day: dayOf(start),
			allDay,
			time: allDay
				? { start: new Time(9), end: new Time(10) }
				: { start: toTime(start), end: endTime }
		});
	}
	function edit(d: Draft) {
		draft = d;
		titleError = '';
		open = true;
	}
	function openEvent(e: CalendarEvent) {
		edit({
			id: e.id,
			title: e.title,
			calendar: e.calendar,
			day: dayOf(e.start),
			allDay: !!e.allDay,
			time: { start: toTime(e.start), end: toTime(e.end) }
		});
	}
	function newEvent() {
		const start = view === 'month' ? 9 * 60 : Math.min(22 * 60, (new Date().getHours() + 1) * 60);
		create(at(date, start), at(date, start + 60));
	}

	const minutes = (t: Time) => t.hour * 60 + t.minute;
	function save(ev: SubmitEvent) {
		ev.preventDefault();
		if (!draft) return;
		const title = draft.title.trim();
		if (!title) {
			titleError = 'Give the event a name.';
			return;
		}
		if (!draft.allDay && minutes(draft.time.end) <= minutes(draft.time.start)) return;
		const e: CalendarEvent = {
			id: draft.id ?? crypto.randomUUID(),
			title,
			calendar: draft.calendar,
			allDay: draft.allDay || undefined,
			start: at(draft.day, draft.allDay ? 0 : minutes(draft.time.start)),
			end: at(draft.day, draft.allDay ? 0 : minutes(draft.time.end))
		};
		events = draft.id ? events.map((x) => (x.id === e.id ? e : x)) : [...events, e];
		// Show a new event even if its calendar was hidden.
		hidden = hidden.filter((id) => id !== e.calendar);
		announce(`${title} ${draft.id ? 'saved' : 'added'}`);
		open = false;
	}
	function remove() {
		if (!draft?.id) return;
		const { id, title } = draft;
		events = events.filter((e) => e.id !== id);
		announce(`${title} deleted`);
		open = false;
	}
	function move(e: CalendarEvent) {
		events = events.map((x) => (x.id === e.id ? e : x));
		const when = utc({ weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(
			e.start.toDate('UTC')
		);
		announce(`${e.title} moved to ${when}`);
	}
</script>

<section bind:this={app} bind:clientWidth={width} class={['app', className]} aria-label="Calendar">
	<div class="layout">
		<aside class="side" {@attach scrollEdges} data-fade>
			<Button onclick={newEvent}><Icon icon={Add01Icon} size={16} /> New event</Button>
			<Calendar label="Go to date" value={date} onchange={(d) => goTo(d)} fill />
			<fieldset class="calendars">
				<legend>My calendars</legend>
				{#each calendars as c (c.id)}
					<span class="cal" style:--c={c.color}>
						<Checkbox
							checked={!hidden.includes(c.id)}
							onchange={(ev) =>
								(hidden = ev.currentTarget.checked
									? hidden.filter((id) => id !== c.id)
									: [...hidden, c.id])}>{c.name}</Checkbox
						>
					</span>
				{/each}
			</fieldset>
		</aside>

		<div class="main">
			<header>
				<Button variant="secondary" size="sm" onclick={() => goTo(today(getLocalTimeZone()))}
					>Today</Button
				>
				<div class="paging">
					<Button
						variant="ghost"
						size="sm"
						square
						aria-label="Previous {unit}"
						onclick={() => page(-1)}
					>
						<Icon icon={ArrowLeft01Icon} size={16} />
					</Button>
					<Button variant="ghost" size="sm" square aria-label="Next {unit}" onclick={() => page(1)}>
						<Icon icon={ArrowRight01Icon} size={16} />
					</Button>
				</div>
				<h2 aria-live="polite">{heading}</h2>
				<Button class="new-compact" size="sm" square aria-label="New event" onclick={newEvent}>
					<Icon icon={Add01Icon} size={16} />
				</Button>
				<Segmented
					label="View"
					hideLabel
					bind:value={() => view, (v) => (view = v as typeof view)}
					options={[
						{ value: 'day', label: 'Day' },
						{ value: 'week', label: 'Week' },
						{ value: 'month', label: 'Month' }
					]}
				/>
			</header>
			{#key `${view}:${view === 'month' ? `${date.year}-${date.month}` : days[0].toString()}`}
				<div class="range" style:--from="{Math.sign(dir) * 1.5}rem">
					{#if view === 'month' && narrow}
						<div class="month-narrow">
							<MonthGrid
								month={date}
								events={visible}
								{calendars}
								{locale}
								onopen={openEvent}
								oncreate={create}
								onday={(d) => (date = d)}
								compact
								selected={date}
							/>
							<Agenda days={[date]} events={visible} {calendars} {locale} onopen={openEvent} />
						</div>
					{:else if view === 'week' && narrow}
						<Agenda {days} events={visible} {calendars} {locale} onopen={openEvent} />
					{:else if view === 'month'}
						<MonthGrid
							month={date}
							events={visible}
							{calendars}
							{locale}
							onopen={openEvent}
							oncreate={create}
							onday={(d) => goTo(d, 'day')}
						/>
					{:else}
						<TimeGrid
							{days}
							events={visible}
							{calendars}
							{locale}
							onopen={openEvent}
							oncreate={create}
							onmove={move}
							onday={(d) => goTo(d, 'day')}
						/>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</section>

<Dialog bind:open title={draft?.id ? 'Edit event' : 'New event'}>
	{#if draft}
		<!-- Rebuilt for each event, so every field starts from that event's values. -->
		{#key draft}
			<form id={formId} class="form" onsubmit={save}>
				<Input
					label="Title"
					bind:value={draft.title}
					error={titleError}
					oninput={() => (titleError = '')}
					placeholder="Lecture on optics"
					autocomplete="off"
				/>
				<DatePicker label="Date" bind:value={draft.day} {locale} />
				<Switch bind:checked={draft.allDay}>All day</Switch>
				{#if !draft.allDay}
					<TimeRangeField
						label="Time"
						bind:value={draft.time}
						{locale}
						minuteStep={5}
						listStep={15}
					/>
				{/if}
				<Segmented
					label="Calendar"
					bind:value={draft.calendar}
					options={calendars.map((c) => ({ value: c.id, label: c.name }))}
				/>
			</form>
		{/key}
	{/if}
	{#snippet footer()}
		{#if draft?.id}
			<Button variant="danger" class="delete" onclick={remove}>Delete</Button>
		{/if}
		<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
		<Button type="submit" form={formId}>Save</Button>
	{/snippet}
</Dialog>

<style>
	/* Concentric corners: 1.75rem card = 1.25rem of padding + the system's 0.5rem. */
	.app {
		container: calendar / inline-size;
		inline-size: 100%;
	}
	.layout {
		display: grid;
		grid-template-columns: 16rem minmax(0, 1fr);
		gap: 1rem;
		block-size: 44rem;
		max-block-size: 90dvh;
		padding: 1.25rem;
		box-sizing: border-box;
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
	}
	.side {
		display: grid;
		align-content: start;
		gap: 1.25rem;
		min-block-size: 0;
		overflow-y: auto;
	}
	.side > :global(.btn) {
		justify-self: start;
	}
	.calendars {
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		border: 0;
	}
	/* Each calendar's box in its own colour (via a wrapper, so var(--ui-accent) itself works). */
	.cal :global(.checkbox) {
		--ui-accent: var(--c);
	}
	legend {
		margin-block-end: 0.5rem;
		padding: 0;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.main {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 0.75rem;
		min-inline-size: 0;
		min-block-size: 0;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.paging {
		display: flex;
	}
	h2 {
		flex: 1;
		min-inline-size: 0;
		margin-block: 0;
		margin-inline: 0.25rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	header :global(.new-compact) {
		display: none;
	}
	.range:dir(rtl) {
		--dir: -1;
	}
	.range {
		display: grid;
		min-block-size: 0;
		animation: range-in 320ms var(--ui-ease-out);
	}
	.range > :global(*) {
		min-block-size: 0;
	}
	@keyframes range-in {
		from {
			opacity: 0;
			/* Next comes from the reading end: the right, or the left right to left. */
			transform: translateX(calc(var(--from) * var(--dir, 1)));
		}
	}
	.form {
		display: grid;
		gap: 1rem;
	}
	:global(.btn.delete) {
		margin-inline-end: auto;
	}
	/* Narrow: the sidebar goes, the header keeps a compact New event button. */
	@container calendar (width < 60rem) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
			padding: 1rem;
		}
		.side {
			display: none;
		}
		header :global(.new-compact) {
			display: inline-flex;
		}
	}
	.month-narrow {
		display: grid;
		align-content: start;
		gap: 1rem;
		min-block-size: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	/* Phone: the date with paging and New event on one line; Today and a full-width view switch below. */
	@container calendar (width < 40rem) {
		.layout {
			padding: 0.75rem;
			border-radius: 1.25rem;
		}
		h2 {
			order: -3;
			flex: 1 0 calc(100% - 10rem);
			margin-inline: 0;
			white-space: normal;
		}
		.paging {
			order: -2;
		}
		header :global(.new-compact) {
			order: -1;
		}
		header :global(.segmented) {
			flex: 1;
		}
		header :global(.segmented .track) {
			display: flex;
		}
		header :global(.segmented .segment) {
			flex: 1;
		}
	}
	/* The smallest phones: title and New event, then paging and Today, then the view switch. */
	@container calendar (width < 22rem) {
		h2 {
			flex-basis: calc(100% - 3.5rem);
		}
		header :global(.new-compact) {
			order: -2;
		}
		.paging {
			order: -1;
		}
		header :global(.segmented) {
			flex-basis: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.range {
			animation: none;
		}
	}
</style>
