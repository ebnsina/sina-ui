import { describe, expect, it } from 'vitest';
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { layout, onDay, type CalendarEvent } from './events';

const ev = (id: string, h1: number, m1: number, h2: number, m2: number): CalendarEvent => ({
	id,
	title: id,
	calendar: 'x',
	start: new CalendarDateTime(2026, 9, 29, h1, m1),
	end: new CalendarDateTime(2026, 9, 29, h2, m2)
});

describe('calendar layout', () => {
	it('gives overlapping events their own columns, sharing the width', () => {
		const out = layout([ev('a', 9, 0, 10, 30), ev('b', 9, 30, 11, 0), ev('c', 12, 0, 13, 0)]);
		const by = Object.fromEntries(out.map((p) => [p.e.id, p]));
		expect([by.a.col, by.b.col]).toEqual([0, 1]);
		expect([by.a.cols, by.b.cols]).toEqual([2, 2]);
		// Separate from the cluster: full width again.
		expect([by.c.col, by.c.cols]).toEqual([0, 1]);
	});
	it('reuses a column once its event has ended', () => {
		const out = layout([ev('a', 9, 0, 10, 0), ev('b', 9, 0, 12, 0), ev('c', 10, 0, 11, 0)]);
		const by = Object.fromEntries(out.map((p) => [p.e.id, p]));
		expect(by.b.col).toBe(0);
		expect(new Set([by.a.col, by.c.col])).toEqual(new Set([1]));
		expect(by.a.cols).toBe(2);
	});
	it('counts a multi-day event on each of its days', () => {
		const e = { ...ev('a', 9, 0, 10, 0), end: new CalendarDateTime(2026, 10, 1, 10, 0) };
		expect(onDay(e, new CalendarDate(2026, 9, 30))).toBe(true);
		expect(onDay(e, new CalendarDate(2026, 10, 2))).toBe(false);
	});
});
