import { describe, expect, it } from 'vitest';
import { CalendarDate, toCalendarDate } from '@internationalized/date';
import { ics, startTimes, stayPrice, type Hours } from './booking';

// Baghdad is UTC+3 all year; Monday to Friday, 9:00 to 17:00.
const baghdad: Hours = { timeZone: 'Asia/Baghdad', open: 9, close: 17, days: [1, 2, 3, 4, 5] };
const time = (z: { hour: number; minute: number }) =>
	`${z.hour}:${String(z.minute).padStart(2, '0')}`;

describe('startTimes', () => {
	it('lists the working day in the place’s own zone', () => {
		const t = startTimes(new CalendarDate(2026, 10, 7), 'Asia/Baghdad', baghdad, 60);
		expect(t.map(time)).toEqual([
			'9:00',
			'10:00',
			'11:00',
			'12:00',
			'13:00',
			'14:00',
			'15:00',
			'16:00'
		]);
	});

	it('shifts into the visitor’s zone', () => {
		// New York is UTC-4 in October: 9:00 in Baghdad is 2:00 there.
		const t = startTimes(new CalendarDate(2026, 10, 7), 'America/New_York', baghdad, 60);
		expect(time(t[0])).toBe('2:00');
		expect(time(t.at(-1)!)).toBe('9:00');
	});

	it('can hold two working days on one visitor day, and only that day', () => {
		// Kiritimati is UTC+14: Baghdad's Tuesday afternoon and Wednesday morning share a date there.
		const day = new CalendarDate(2026, 10, 7);
		const t = startTimes(day, 'Pacific/Kiritimati', baghdad, 60);
		expect(t.every((z) => toCalendarDate(z).compare(day) === 0)).toBe(true);
		expect(t.map(time)).toEqual([
			'0:00',
			'1:00',
			'2:00',
			'3:00',
			'20:00',
			'21:00',
			'22:00',
			'23:00'
		]);
	});

	it('skips closed days and keeps the last start early enough to finish', () => {
		expect(startTimes(new CalendarDate(2026, 10, 10), 'Asia/Baghdad', baghdad, 30)).toEqual([]);
		const t = startTimes(new CalendarDate(2026, 10, 7), 'Asia/Baghdad', baghdad, 30, 60);
		expect(time(t.at(-1)!)).toBe('16:00');
	});
});

describe('stayPrice', () => {
	it('counts nights and taxes in cents', () => {
		expect(
			stayPrice(new CalendarDate(2026, 10, 30), new CalendarDate(2026, 11, 2), 14_000, 0.12)
		).toEqual({ nights: 3, subtotal: 42_000, taxes: 5_040, total: 47_040 });
		expect(
			stayPrice(new CalendarDate(2026, 10, 2), new CalendarDate(2026, 10, 2), 14_000, 0.12).total
		).toBe(0);
	});
});

describe('ics', () => {
	it('writes the event in UTC and escapes text', () => {
		const [start] = startTimes(new CalendarDate(2026, 10, 7), 'Asia/Baghdad', baghdad, 30);
		const file = ics({ title: 'Tour; reading room, west wing', start, minutes: 30 });
		expect(file).toContain('DTSTART:20261007T060000Z');
		expect(file).toContain('DTEND:20261007T063000Z');
		expect(file).toContain('SUMMARY:Tour\\; reading room\\, west wing');
	});
});
