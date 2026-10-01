import {
	getDayOfWeek,
	toCalendarDate,
	toCalendarDateTime,
	toTimeZone,
	toZoned,
	type CalendarDate,
	type ZonedDateTime
} from '@internationalized/date';

/** When a place takes bookings, in its own time zone. Days: 0 is Sunday. */
export interface Hours {
	timeZone: string;
	/** Hours of the day as decimals: 9.5 is 9:30. */
	open: number;
	close: number;
	days: number[];
}

export interface Slot {
	/** The start as an absolute ISO time: stable across time zones. */
	id: string;
	label: string;
	taken?: boolean;
}

/**
 * Every start time that falls on `date` as seen in `timeZone`, from a place open `hours` in its own
 * zone. A visitor's day can hold the end of one working day and the start of the next.
 */
export function startTimes(
	date: CalendarDate,
	timeZone: string,
	hours: Hours,
	every: number,
	length = every
): ZonedDateTime[] {
	const out: ZonedDateTime[] = [];
	for (const day of [date.subtract({ days: 1 }), date, date.add({ days: 1 })]) {
		if (!hours.days.includes(getDayOfWeek(day, 'en-US'))) continue;
		const midnight = toCalendarDateTime(day);
		for (let m = hours.open * 60; m + length <= hours.close * 60; m += every) {
			const local = toTimeZone(toZoned(midnight.add({ minutes: m }), hours.timeZone), timeZone);
			if (toCalendarDate(local).compare(date) === 0) out.push(local);
		}
	}
	return out.sort((a, b) => a.compare(b));
}

/** The first day after `from` that passes `ok`, looking up to `limit` days ahead. */
export function nextDay(from: CalendarDate, ok: (date: CalendarDate) => boolean, limit = 90) {
	for (let i = 1; i <= limit; i++) {
		const d = from.add({ days: i });
		if (ok(d)) return d;
	}
}

/** Nights between two dates, and what they cost. Amounts in cents, so the sums stay exact. */
export function stayPrice(start: CalendarDate, end: CalendarDate, rate: number, taxRate: number) {
	const nights = Math.max(0, Math.round((+end.toDate('UTC') - +start.toDate('UTC')) / 86_400_000));
	const subtotal = nights * rate;
	const taxes = Math.round(subtotal * taxRate);
	return { nights, subtotal, taxes, total: subtotal + taxes };
}

/** A short code people can read out over the phone: no 0/O or 1/I. */
export function reference() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	return Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => chars[n % chars.length]).join(
		''
	);
}

const icsText = (s: string) => s.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
const icsTime = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d+/, '');

/** An .ics file calendars can import: one event, in absolute (UTC) time. */
export function ics(event: {
	title: string;
	start: ZonedDateTime;
	minutes: number;
	location?: string;
	description?: string;
}) {
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Sina UI//Booking//EN',
		'BEGIN:VEVENT',
		`UID:${crypto.randomUUID()}`,
		`DTSTAMP:${icsTime(new Date().toISOString())}`,
		`DTSTART:${icsTime(event.start.toAbsoluteString())}`,
		`DTEND:${icsTime(event.start.add({ minutes: event.minutes }).toAbsoluteString())}`,
		`SUMMARY:${icsText(event.title)}`,
		event.location && `LOCATION:${icsText(event.location)}`,
		event.description && `DESCRIPTION:${icsText(event.description)}`,
		'END:VEVENT',
		'END:VCALENDAR'
	]
		.filter(Boolean)
		.join('\r\n');
}

/** Saves text as a file the browser downloads. */
export function download(name: string, text: string, type = 'text/calendar') {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([text], { type }));
	a.download = name;
	a.click();
	URL.revokeObjectURL(a.href);
}

// ── The demo's availability: replace with calls to your booking service ──────────────────────────
// Deterministic, so the same time is always free or taken; some days are fully booked.
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
export const fullyBooked = (date: CalendarDate) => hash(date.toString()) % 6 === 0;
export const taken = (id: string, salt = '') => hash(id + salt) % 4 === 0;
/** Rooms of one kind still free for a stay: 0 to 3. */
export const roomsLeft = (id: string, salt: string) => hash(id + salt) % 4;

let failing = false;
/** The next load fails, to show the error state. */
export const failNext = () => (failing = true);

/** Answers after a network-like pause; throws when `failNext()` was called. */
export async function later<T>(value: () => T, delay = 500 + Math.random() * 400): Promise<T> {
	await new Promise((done) => setTimeout(done, delay));
	if (failing) {
		failing = false;
		throw new Error('unavailable');
	}
	return value();
}
