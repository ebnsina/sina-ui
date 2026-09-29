<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getLocalTimeZone,
		parseDateTime,
		startOfWeek,
		today,
		toCalendarDateTime
	} from '@internationalized/date';
	import { BookOpen01Icon, Mosque01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
	import CalendarApp from '#lib/blocks/calendar/CalendarApp.svelte';
	import type { CalendarDef, CalendarEvent } from '#lib/blocks/calendar/events.js';

	const calendars: CalendarDef[] = [
		{ id: 'lectures', name: 'Lectures', color: 'var(--ui-accent)', icon: BookOpen01Icon },
		{ id: 'study', name: 'Study', color: 'light-dark(#0369a1, #38bdf8)', icon: PencilEdit01Icon },
		{ id: 'prayer', name: 'Prayer', color: 'var(--ui-warning)', icon: Mosque01Icon }
	];

	// This week's timetable, so the demo always has something to show.
	const monday = startOfWeek(today(getLocalTimeZone()), 'en-GB');
	const ev = (day: number, h: number, m: number, mins: number, title: string, calendar: string) => {
		const start = toCalendarDateTime(monday.add({ days: day })).add({ hours: h, minutes: m });
		return {
			id: `${day}-${h}-${m}-${calendar}`,
			title,
			calendar,
			start,
			end: start.add({ minutes: mins })
		};
	};
	const sample = (): CalendarEvent[] => [
		ev(0, 9, 0, 90, 'Optics with Ibn al-Haytham', 'lectures'),
		ev(0, 10, 0, 60, 'Read the Book of Optics', 'study'),
		ev(1, 11, 0, 60, "Al-Khwarizmi's al-jabr", 'lectures'),
		ev(1, 14, 30, 120, 'Copying manuscripts', 'study'),
		ev(2, 9, 30, 60, 'Canon of Medicine', 'lectures'),
		ev(3, 20, 0, 90, 'Night at the observatory', 'lectures'),
		ev(4, 12, 30, 45, "Jumu'ah prayer", 'prayer'),
		ev(4, 15, 0, 60, 'Translation circle', 'study'),
		{ ...ev(5, 0, 0, 0, 'Visit the House of Wisdom', 'study'), allDay: true }
	];

	// Remembered in this browser, so your edits are still here after a reload.
	const KEY = 'sinaui-calendar';
	let events = $state<CalendarEvent[]>(sample());
	let loaded = false;
	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
			if (Array.isArray(saved))
				events = saved.map((e) => ({
					...e,
					start: parseDateTime(e.start),
					end: parseDateTime(e.end)
				}));
		} catch {}
		loaded = true;
	});
	$effect(() => {
		const json = JSON.stringify(
			events.map((e) => ({ ...e, start: e.start.toString(), end: e.end.toString() }))
		);
		if (!loaded) return;
		try {
			localStorage.setItem(KEY, json);
		} catch {}
	});
</script>

<CalendarApp bind:events {calendars} />
