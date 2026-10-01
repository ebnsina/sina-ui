import { describe, expect, it } from 'vitest';
import { atBottom, dayLabel, fileSize, pieces, rows, unreadCount, type ChatMessage } from './chat';

const at = (y: number, mo: number, d: number, h = 12, mi = 0) =>
	new Date(y, mo - 1, d, h, mi).getTime();
const now = at(2026, 10, 1, 15);
const msg = (
	id: string,
	author: string,
	t: number,
	rest: Partial<ChatMessage> = {}
): ChatMessage => ({
	id,
	author,
	text: id,
	at: t,
	...rest
});

describe('dayLabel', () => {
	it('says Today, Yesterday, a weekday, then a date', () => {
		expect(dayLabel(at(2026, 10, 1, 1), now)).toBe('Today');
		expect(dayLabel(at(2026, 9, 30, 23), now)).toBe('Yesterday');
		expect(dayLabel(at(2026, 9, 27), now)).toBe('Sunday');
		expect(dayLabel(at(2026, 9, 3), now)).toBe('Sep 3');
		expect(dayLabel(at(2025, 9, 3), now)).toBe('Sep 3, 2025');
	});
});

describe('rows', () => {
	const list = [
		msg('a', 'kindi', at(2026, 9, 30, 10, 0)),
		msg('b', 'kindi', at(2026, 9, 30, 10, 2)),
		msg('c', 'kindi', at(2026, 9, 30, 10, 30)),
		msg('d', 'me', at(2026, 10, 1, 9)),
		msg('e', 'kindi', at(2026, 10, 1, 9, 1)),
		msg('f', 'kindi', at(2026, 10, 1, 9, 2))
	];
	const r = rows(list, 'f', now);
	const m = (id: string) =>
		r.find((x) => x.kind === 'message' && x.key === id) as Extract<
			(typeof r)[number],
			{ kind: 'message' }
		>;

	it('separates days', () => {
		expect(r.filter((x) => x.kind === 'day').map((x) => x.kind === 'day' && x.label)).toEqual([
			'Yesterday',
			'Today'
		]);
	});
	it('groups one person within a few minutes', () => {
		expect([m('a').first, m('a').last, m('b').first, m('b').last]).toEqual([
			true,
			false,
			false,
			true
		]);
		expect(m('c').first).toBe(true);
	});
	it('breaks a group at the unread divider', () => {
		expect(m('e').last).toBe(true);
		expect(m('f').first).toBe(true);
		expect(r.findIndex((x) => x.kind === 'unread')).toBe(r.findIndex((x) => x.key === 'f') - 1);
	});
});

it('counts unread from others only', () => {
	const list = [
		msg('a', 'x', 1),
		msg('b', 'me', 2),
		msg('c', 'x', 3),
		msg('d', 'x', 4, { deleted: true })
	];
	expect(unreadCount(list, 'a', 'me')).toBe(1);
	expect(unreadCount(list, undefined, 'me')).toBe(2);
});

describe('pieces', () => {
	const users = [
		{ id: 'h', name: 'Hunayn ibn Ishaq' },
		{ id: 'hu', name: 'Hunayn' }
	];
	it('finds links and the longest matching mention', () => {
		expect(pieces('Ask @Hunayn ibn Ishaq: see https://example.org/a_b.', users)).toEqual([
			{ kind: 'text', text: 'Ask ' },
			{ kind: 'mention', text: '@Hunayn ibn Ishaq', id: 'h' },
			{ kind: 'text', text: ': see ' },
			{ kind: 'link', text: 'https://example.org/a_b', href: 'https://example.org/a_b' },
			{ kind: 'text', text: '.' }
		]);
	});
	it('leaves markup and other schemes as text', () => {
		expect(pieces('<b>hi</b> javascript:alert(1)')).toEqual([
			{ kind: 'text', text: '<b>hi</b> javascript:alert(1)' }
		]);
	});
});

it('sticks within reach of the bottom only', () => {
	expect(atBottom({ scrollHeight: 1000, clientHeight: 400, scrollTop: 560 })).toBe(true);
	expect(atBottom({ scrollHeight: 1000, clientHeight: 400, scrollTop: 300 })).toBe(false);
});

it('formats file sizes', () => {
	expect(fileSize(820)).toBe('820 B');
	expect(fileSize(14_540)).toBe('14.2 KB');
	expect(fileSize(3_250_000)).toBe('3.1 MB');
});
