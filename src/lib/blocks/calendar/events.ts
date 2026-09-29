import type Icon from '#lib/ui/Icon.svelte';
import {
	CalendarDate,
	CalendarDateTime,
	toCalendarDateTime,
	type DateValue
} from '@internationalized/date';

export interface CalendarDef {
	id: string;
	name: string;
	/** Any CSS colour; the system's tokens by default. */
	color: string;
	/** A Hugeicons icon shown on its events, as on an Alert. */
	icon?: Parameters<typeof Icon>[1]['icon'];
}

export interface CalendarEvent {
	id: string;
	title: string;
	calendar: string;
	/** Local date-times; an all-day event runs from start's day through end's day. */
	start: CalendarDateTime;
	end: CalendarDateTime;
	allDay?: boolean;
}

export const minutesOf = (d: CalendarDateTime) => d.hour * 60 + d.minute;
export const dayOf = (d: DateValue) => new CalendarDate(d.year, d.month, d.day);

/** A time on a day, as minutes past its midnight (1440 is the next midnight). */
export const at = (day: CalendarDate, minutes: number) => toCalendarDateTime(day).add({ minutes });

/** Where the event sits on one day, in minutes past midnight, clipped to that day. */
export function span(e: CalendarEvent, day: CalendarDate) {
	return {
		start: dayOf(e.start).compare(day) < 0 ? 0 : minutesOf(e.start),
		end: dayOf(e.end).compare(day) > 0 ? 1440 : minutesOf(e.end)
	};
}

/** Whether the event shows on this day (all-day ones span every day from start to end). */
export function onDay(e: CalendarEvent, day: CalendarDate) {
	return dayOf(e.start).compare(day) <= 0 && dayOf(e.end).compare(day) >= 0;
}

/**
 * Lays out one day's timed events side by side where they overlap: each gets a column, and every
 * event in a cluster of overlaps shares the same width, as calendars do.
 */
export function layout(events: CalendarEvent[]) {
	const sorted = [...events].sort((a, b) => a.start.compare(b.start) || b.end.compare(a.end));
	const placed: { e: CalendarEvent; col: number; cols: number }[] = [];
	let cluster: typeof placed = [];
	let clusterEnd: CalendarDateTime | undefined;
	const close = () => {
		const cols = Math.max(0, ...cluster.map((p) => p.col)) + 1;
		for (const p of cluster) p.cols = cols;
		cluster = [];
	};
	for (const e of sorted) {
		if (clusterEnd && e.start.compare(clusterEnd) >= 0) close();
		// The first column whose last event has ended.
		let col = 0;
		while (cluster.some((p) => p.col === col && p.e.end.compare(e.start) > 0)) col++;
		const item = { e, col, cols: 1 };
		cluster.push(item);
		placed.push(item);
		clusterEnd = !clusterEnd || e.end.compare(clusterEnd) > 0 ? e.end : clusterEnd;
	}
	close();
	return placed;
}
