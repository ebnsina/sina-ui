// What the messaging block needs from a backend. mock.ts is an in-memory one for trying it out;
// write the same interface over your server (REST, WebSocket, Matrix…) and pass that instead.
import type { ChatMessage, ChatUser } from '../../ui/chat';

export type Conversation = {
	id: string;
	/** direct: two people. group: a few people, named. channel: a named topic anyone can follow. */
	kind: 'direct' | 'group' | 'channel';
	/** Groups and channels; a direct conversation is named after the other person. */
	name?: string;
	topic?: string;
	/** User ids, you included. */
	members: string[];
	pinned?: boolean;
	muted?: boolean;
	archived?: boolean;
	unread: number;
	/** Unread messages that mention you. */
	mentions: number;
	last?: { text: string; author: string; at: number };
};

export type SearchQuery = {
	text: string;
	/** A user id. */
	from?: string;
	has?: 'file' | 'image' | 'link';
	/** Only the last this many days. */
	within?: number;
	/** One conversation's id. */
	in?: string;
};

export type Hit = { conversation: string; message: ChatMessage };

export type Live =
	| { type: 'message'; conversation: string; message: ChatMessage; parent?: string }
	| { type: 'typing'; conversation: string; user: string; typing: boolean }
	| { type: 'update'; conversation: string; id: string; change: Partial<ChatMessage> };

export interface MessagingApi {
	/** Your user id. */
	me: string;
	users(): Promise<ChatUser[]>;
	conversations(): Promise<Conversation[]>;
	/** The 30 messages before `before` (or the latest), oldest first. */
	messages(conversation: string, before?: string): Promise<ChatMessage[]>;
	/** A thread's replies, oldest first. */
	thread(conversation: string, parent: string): Promise<ChatMessage[]>;
	send(
		conversation: string,
		message: ChatMessage,
		files: File[],
		parent?: string
	): Promise<Partial<ChatMessage>>;
	save(conversation: string, message: ChatMessage): Promise<void>;
	/** Deletes a message for you only. */
	hide(conversation: string, id: string): Promise<void>;
	update(
		conversation: string,
		change: Partial<Pick<Conversation, 'pinned' | 'muted' | 'archived'>>
	): Promise<void>;
	/** You've seen everything up to this message. */
	read(conversation: string, id: string): Promise<void>;
	/** One other person: a direct conversation (the existing one if there is). More: a named group. */
	create(members: string[], name?: string): Promise<Conversation>;
	search(query: SearchQuery): Promise<Hit[]>;
	/** New messages, typing and receipts as they happen. Returns a function that stops listening. */
	listen(on: (event: Live) => void): () => void;
}

export type ApiErrorCode = 'offline' | 'not_found' | 'forbidden' | 'invalid' | 'unknown';
export class ApiError extends Error {
	constructor(public code: ApiErrorCode) {
		super(code);
	}
}
/** What to tell people, by error code: plain language, never the server's own text. */
export const messageOf = (e: unknown) =>
	({
		offline: 'You seem to be offline. Check your connection and try again.',
		not_found: 'That conversation no longer exists.',
		forbidden: 'You’re not a member of that conversation.',
		invalid: 'Something in that wasn’t right. Check it and try again.',
		unknown: 'Something went wrong on our side. Try again in a moment.'
	})[e instanceof ApiError ? e.code : 'unknown'];

const DAY = 86_400_000;
/** Whether a message fits a search: words in any order, case and accents ignored. */
export function matches(m: ChatMessage, q: SearchQuery, now = Date.now()) {
	if (m.deleted) return false;
	if (q.from && m.author !== q.from) return false;
	if (q.within && now - m.at > q.within * DAY) return false;
	if (q.has === 'image' && !m.attachments?.some((a) => a.type.startsWith('image/'))) return false;
	if (q.has === 'file' && !m.attachments?.some((a) => !a.type.startsWith('image/'))) return false;
	if (q.has === 'link' && !/https?:\/\//.test(m.text)) return false;
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const text = fold(`${m.text} ${m.attachments?.map((a) => a.name).join(' ') ?? ''}`);
	return fold(q.text)
		.split(/\s+/)
		.filter(Boolean)
		.every((w) => text.includes(w));
}

/** Pinned first, then the most recent. */
export const sorted = (list: Conversation[]) =>
	[...list].sort(
		(a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.last?.at ?? 0) - (a.last?.at ?? 0)
	);

const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
/** The time beside a conversation: "3:15 PM" today, "Tue" this week, then "Sep 3". */
export function listTime(t: number, now = Date.now()) {
	const days = (new Date(now).setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / DAY;
	return days < 1 ? clock.format(t) : days < 7 ? weekday.format(t) : date.format(t);
}

/** A conversation's name: its own, or the other person's. */
export function titleOf(c: Conversation, users: Map<string, ChatUser>, me: string) {
	if (c.name) return c.name;
	const other = c.members.find((id) => id !== me);
	return (other && users.get(other)?.name) ?? 'Just you';
}
