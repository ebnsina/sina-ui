import { describe, expect, it } from 'vitest';
import { listTime, matches, sorted, titleOf, type Conversation } from './api';
import type { ChatMessage } from '../../ui/chat';

const now = Date.UTC(2026, 9, 1);
const m = (rest: Partial<ChatMessage>): ChatMessage => ({
	id: 'x',
	author: 'kindi',
	text: '',
	at: now - 3_600_000,
	...rest
});

describe('matches', () => {
	it('finds words in any order, ignoring case and accents', () => {
		expect(matches(m({ text: 'The Córdoba copy is ready' }), { text: 'ready cordoba' }, now)).toBe(
			true
		);
		expect(matches(m({ text: 'The Córdoba copy' }), { text: 'ready' }, now)).toBe(false);
	});
	it('filters by person, date, and what it has', () => {
		const pic = m({ attachments: [{ name: 'plate.png', size: 1, type: 'image/png', url: '' }] });
		expect(matches(pic, { text: 'plate', has: 'image' }, now)).toBe(true);
		expect(matches(pic, { text: '', has: 'file' }, now)).toBe(false);
		expect(matches(m({ text: 'see https://a.org' }), { text: '', has: 'link' }, now)).toBe(true);
		expect(matches(m({ text: 'hi' }), { text: 'hi', from: 'thabit' }, now)).toBe(false);
		expect(
			matches(m({ text: 'hi', at: now - 10 * 86_400_000 }), { text: 'hi', within: 7 }, now)
		).toBe(false);
	});
	it('never finds deleted messages', () => {
		expect(matches(m({ text: 'gone', deleted: true }), { text: 'gone' }, now)).toBe(false);
	});
});

const c = (id: string, rest: Partial<Conversation> = {}): Conversation => ({
	id,
	kind: 'direct',
	members: ['me', id],
	unread: 0,
	mentions: 0,
	...rest
});

it('sorts pinned first, then newest', () => {
	const list = [
		c('a', { last: { text: '', author: 'a', at: 3 } }),
		c('b', { pinned: true }),
		c('c', { last: { text: '', author: 'c', at: 5 } })
	];
	expect(sorted(list).map((x) => x.id)).toEqual(['b', 'c', 'a']);
});

it('names a direct conversation after the other person', () => {
	const users = new Map([['kindi', { id: 'kindi', name: 'Al-Kindi' }]]);
	expect(titleOf(c('kindi'), users, 'me')).toBe('Al-Kindi');
	expect(titleOf(c('g', { name: 'Observatory' }), users, 'me')).toBe('Observatory');
});

it('shows a time today, a weekday this week, then a date', () => {
	const now = new Date(2026, 9, 1, 15).getTime();
	expect(listTime(new Date(2026, 9, 1, 9, 5).getTime(), now)).toBe('9:05 AM');
	expect(listTime(new Date(2026, 8, 28, 9).getTime(), now)).toBe('Mon');
	expect(listTime(new Date(2026, 8, 20, 9).getTime(), now)).toBe('Sep 20');
});
