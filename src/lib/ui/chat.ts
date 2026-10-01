// The pure parts of Chat: grouping, day labels, unread counts and how message text is read.

export type ChatUser = {
	id: string;
	name: string;
	avatar?: string;
	online?: boolean;
	/** When they were last online, in ms since the epoch. */
	lastSeen?: number;
};

export type ChatAttachment = {
	name: string;
	/** Bytes. */
	size: number;
	/** A MIME type: image/* shows a thumbnail, anything else a file row. */
	type: string;
	url: string;
	width?: number;
	height?: number;
};

export type ChatMessage = {
	id: string;
	/** A user id. */
	author: string;
	text: string;
	/** Sent at, in ms since the epoch. */
	at: number;
	/** Your own messages only: where delivery has got to. */
	status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
	edited?: boolean;
	/** When the current text was written, if it's been edited. */
	editedAt?: number;
	deleted?: boolean;
	/** The id of the message this one answers. */
	replyTo?: string;
	/** Emoji → the ids of who reacted with it. */
	reactions?: Record<string, string[]>;
	attachments?: ChatAttachment[];
	/** Replies in its thread. */
	replies?: number;
	/** Your own messages in a group: the ids of who has read it. */
	readBy?: string[];
	/** Earlier versions, oldest first, when it's been edited. */
	history?: { text: string; at: number }[];
	pinned?: boolean;
	/** Saved for later, by you. */
	saved?: boolean;
	forwarded?: boolean;
	/** A card for the first link in the text. */
	preview?: { url: string; title: string; description?: string; image?: string; site?: string };
};

export type ChatRow =
	| { kind: 'day'; key: string; label: string; date: string }
	| { kind: 'unread'; key: string }
	| { kind: 'message'; key: string; message: ChatMessage; first: boolean; last: boolean };

/** Consecutive messages from one person this close together share one name and avatar. */
export const GROUP_GAP = 5 * 60_000;

const dayKey = (t: number) => {
	const d = new Date(t);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "Today", "Yesterday", a weekday within the week, then a date ("Sep 3", or "Sep 3, 2025" last year). */
export function dayLabel(t: number, now = Date.now()) {
	const startOf = (x: number) => new Date(new Date(x).toDateString()).getTime();
	const days = Math.round((startOf(now) - startOf(t)) / 86_400_000);
	if (days === 0) return 'Today';
	if (days === 1) return 'Yesterday';
	if (days > 1 && days < 7) return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(t);
	const sameYear = new Date(t).getFullYear() === new Date(now).getFullYear();
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: sameYear ? undefined : 'numeric'
	}).format(t);
}

/** Messages in display order with day separators, an unread divider, and where each group starts and ends. */
export function rows(messages: ChatMessage[], unreadFrom?: string, now = Date.now()): ChatRow[] {
	const out: ChatRow[] = [];
	let lastDay = '';
	messages.forEach((m, i) => {
		const day = dayKey(m.at);
		const newDay = day !== lastDay;
		if (newDay) {
			out.push({ kind: 'day', key: `day-${day}`, label: dayLabel(m.at, now), date: day });
			lastDay = day;
		}
		const unread = m.id === unreadFrom;
		if (unread) out.push({ kind: 'unread', key: 'unread' });
		const prev = messages[i - 1];
		const next = messages[i + 1];
		const joins = (a?: ChatMessage, b?: ChatMessage) =>
			!!a &&
			!!b &&
			a.author === b.author &&
			b.at - a.at < GROUP_GAP &&
			dayKey(a.at) === dayKey(b.at);
		out.push({
			kind: 'message',
			key: m.id,
			message: m,
			first: newDay || unread || !joins(prev, m),
			last: !joins(m, next) || next?.id === unreadFrom
		});
	});
	return out;
}

/** Messages after the last one you've read that someone else wrote. */
export function unreadCount(messages: ChatMessage[], lastRead: string | undefined, me: string) {
	const from = lastRead ? messages.findIndex((m) => m.id === lastRead) + 1 : 0;
	return messages.slice(from).filter((m) => m.author !== me && !m.deleted).length;
}

export type Piece = { kind: 'text' | 'link' | 'mention'; text: string; href?: string; id?: string };

// Captured, so split() alternates text and links.
const URL_RE = /(\bhttps?:\/\/[^\s<>"]+[^\s<>"'.,:;!?)\]])/;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits message text into plain text, links and @mentions, to render as nodes: user text is never
 * treated as HTML. Only http(s) addresses become links.
 */
export function pieces(text: string, users: ChatUser[] = []): Piece[] {
	const names = [...users].sort((a, b) => b.name.length - a.name.length);
	const mention = names.length
		? new RegExp(`@(${names.map((u) => escape(u.name)).join('|')})`, 'g')
		: undefined;
	const out: Piece[] = [];
	const push = (p: Piece) => {
		const last = out.at(-1);
		if (p.kind === 'text' && last?.kind === 'text') last.text += p.text;
		else if (p.text) out.push(p);
	};
	for (const [i, part] of text.split(URL_RE).entries()) {
		if (i % 2) {
			push({ kind: 'link', text: part, href: part });
			continue;
		}
		if (!mention) {
			push({ kind: 'text', text: part });
			continue;
		}
		let at = 0;
		for (const m of part.matchAll(mention)) {
			push({ kind: 'text', text: part.slice(at, m.index) });
			const user = names.find((u) => u.name === m[1]);
			push({ kind: 'mention', text: m[0], id: user?.id });
			at = m.index! + m[0].length;
		}
		push({ kind: 'text', text: part.slice(at) });
	}
	return out;
}

/** Within this many px of the bottom counts as "at the bottom": new messages keep it there. */
export const STICK = 80;
export const atBottom = (el: { scrollHeight: number; scrollTop: number; clientHeight: number }) =>
	el.scrollHeight - el.scrollTop - el.clientHeight < STICK;

const size = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
/** "820 B", "14.2 KB", "3.1 MB". */
export function fileSize(bytes: number) {
	const units = ['B', 'KB', 'MB', 'GB'];
	let n = bytes;
	let u = 0;
	while (n >= 1024 && u < units.length - 1) {
		n /= 1024;
		u++;
	}
	return `${size.format(n)} ${units[u]}`;
}
