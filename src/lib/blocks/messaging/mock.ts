// An in-memory backend for trying the block: a short delay on every call, failNext() to see the
// error states, and people who type back. Replace it with your own MessagingApi.
import type { ChatMessage, ChatUser } from '../../ui/chat';
import { ApiError, matches, type Conversation, type Live, type MessagingApi } from './api';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** A short, soft tone as a WAV file, standing in for a recorded voice message. */
function voice(seconds = 3) {
	const rate = 8000;
	const n = rate * seconds;
	const bytes = new Uint8Array(44 + n);
	const view = new DataView(bytes.buffer);
	const text = (at: number, s: string) =>
		[...s].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)));
	text(0, 'RIFF');
	view.setUint32(4, 36 + n, true);
	text(8, 'WAVEfmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, rate, true);
	view.setUint32(28, rate, true);
	view.setUint16(32, 1, true);
	view.setUint16(34, 8, true);
	text(36, 'data');
	view.setUint32(40, n, true);
	for (let i = 0; i < n; i++) {
		const t = i / rate;
		// A low hum that rises and falls like speech.
		const level = 0.35 * Math.abs(Math.sin(t * 3.1)) * (0.6 + 0.4 * Math.sin(t * 7.3));
		bytes[44 + i] = 128 + Math.round(127 * level * Math.sin(2 * Math.PI * 180 * t));
	}
	let raw = '';
	bytes.forEach((b) => (raw += String.fromCharCode(b)));
	return `data:audio/wav;base64,${btoa(raw)}`;
}

// An eight-pointed star, standing in for a photo of the engraved plate.
const plate = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#c9b48a"/><g fill="none" stroke="#5b4a2a" stroke-width="2.5"><circle cx="50" cy="50" r="38"/><path d="M50 14 61 39 86 50 61 61 50 86 39 61 14 50 39 39Z"/><path d="M50 14 61 39 86 50 61 61 50 86 39 61 14 50 39 39Z" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="6"/></g></svg>'
)}`;

export const people: ChatUser[] = [
	{ id: 'hunayn', name: 'Hunayn ibn Ishaq', online: true },
	{ id: 'thabit', name: 'Thabit ibn Qurra', online: true },
	{ id: 'kindi', name: 'Al-Kindi', lastSeen: Date.now() - 2 * HOUR },
	{ id: 'maryam', name: 'Maryam al-Asturlabi', online: true },
	{ id: 'biruni', name: 'Al-Biruni', lastSeen: Date.now() - 26 * HOUR },
	{ id: 'fatima', name: 'Fatima al-Fihri', lastSeen: Date.now() - 9 * MIN },
	{ id: 'musa', name: 'Muhammad ibn Musa', online: true }
];

type Store = {
	conversations: Conversation[];
	messages: Map<string, ChatMessage[]>;
	threads: Map<string, ChatMessage[]>;
};

function seed(): Store {
	const now = Date.now();
	let n = 0;
	const msg = (
		author: string,
		text: string,
		ago: number,
		rest: Partial<ChatMessage> = {}
	): ChatMessage => ({
		id: `s${n++}`,
		author,
		text,
		at: now - ago,
		status: author === 'hunayn' ? 'read' : undefined,
		...rest
	});

	// #translation: a long history, so older pages load as you scroll.
	const topics = [
		'the Conics',
		'Galen’s anatomy',
		'the Syriac glossary',
		'Euclid’s Elements',
		'the Almagest',
		'Dioscorides'
	];
	const who = ['thabit', 'kindi', 'musa', 'hunayn', 'maryam'];
	const translation: ChatMessage[] = Array.from({ length: 70 }, (_, i) =>
		msg(
			who[(i * 3) % who.length],
			`Finished the draft of chapter ${(i % 12) + 1} of ${topics[i % topics.length]}. Notes are in the margin.`,
			(75 - i) * 5 * HOUR
		)
	);
	const glossary = msg(
		'kindi',
		'Proposal: one shared glossary for every translator, so a Greek term always becomes the same Arabic word. Thoughts in the thread.',
		3 * HOUR,
		{ replies: 3, pinned: true, reactions: { '👍': ['thabit', 'musa'], '🎉': ['maryam'] } }
	);
	translation.push(
		glossary,
		msg(
			'musa',
			'The new paper from Samarkand arrived. Much smoother for fine diagrams. More here: https://en.wikipedia.org/wiki/History_of_paper',
			2 * HOUR,
			{
				preview: {
					url: 'https://en.wikipedia.org/wiki/History_of_paper',
					site: 'Wikipedia',
					title: 'History of paper',
					description:
						'Papermaking spread from China to Samarkand and Baghdad in the 8th century, replacing papyrus and parchment for books.'
				}
			}
		),
		msg('thabit', 'Copy of the Conics, book five, for anyone checking my figures.', 50 * MIN, {
			attachments: [
				{
					name: 'conics-book-5-notes.txt',
					size: 64,
					type: 'text/plain',
					url: `data:text/plain,${encodeURIComponent('Conics, book five\nProposition 8: check the Greek\n')}`
				}
			]
		}),
		msg('hunayn', 'Thank you. @Thabit ibn Qurra I’ll read it tonight.', 40 * MIN, {
			reactions: { '🙏': ['thabit'] }
		}),
		msg(
			'maryam',
			'@Hunayn ibn Ishaq can you check the Greek on folio 12 before we copy it?',
			12 * MIN
		)
	);
	const threads = new Map<string, ChatMessage[]>([
		[
			glossary.id,
			[
				msg('thabit', 'Yes, please. I keep finding three words for “ratio”.', 2.8 * HOUR),
				msg('musa', 'I can start the list from the mathematics side.', 2.5 * HOUR),
				msg('hunayn', 'And I’ll add the medical terms from Galen.', 2 * HOUR, { status: 'read' })
			]
		]
	]);

	const thabit = [
		msg('thabit', 'Are you coming to the reading tonight?', DAY + 3 * HOUR),
		msg('hunayn', 'Yes, after sunset. Save me a seat near the lamps.', DAY + 2.9 * HOUR),
		msg('thabit', 'Done. Bring the Syriac copy if you can.', DAY + 2.8 * HOUR, {
			reactions: { '👍': ['hunayn'] }
		}),
		msg('hunayn', 'The Syriac copy is at the binder’s, I’ll bring my notes instead.', 5 * HOUR, {
			edited: true,
			editedAt: now - 4.9 * HOUR,
			history: [{ text: 'The Syriac copy is at the binder', at: now - 5 * HOUR }]
		}),
		msg('thabit', 'Good. One more thing about book five.', 20 * MIN),
		msg('thabit', 'Proposition 8 doesn’t match the Greek. Can you look?', 19 * MIN)
	];

	const observatoryCrew = [
		msg(
			'maryam',
			'Measurements from last night, as a voice note. I was too cold to type.',
			7 * HOUR,
			{
				attachments: [{ name: 'voice-message.wav', size: 24_044, type: 'audio/wav', url: voice() }]
			}
		),
		msg('biruni', 'Ha! I’ll write them up. The eclipse table needs them by Friday.', 6.5 * HOUR),
		msg('hunayn', 'I can bring a lamp and a blanket next time.', 6 * HOUR, {
			status: 'read',
			readBy: ['maryam', 'biruni']
		}),
		msg('maryam', 'The new plate, engraved this morning.', 3 * HOUR, {
			attachments: [
				{
					name: 'baghdad-plate.svg',
					size: 1_204,
					type: 'image/svg+xml',
					url: plate,
					width: 1,
					height: 1
				}
			]
		}),
		msg('hunayn', 'It’s beautiful. Can you engrave the Qibla line on the back?', 2 * HOUR, {
			status: 'read',
			readBy: ['maryam']
		})
	];

	const observatory = [
		msg(
			'biruni',
			'Clear skies expected tonight. Observations start after the evening prayer.',
			2 * DAY
		),
		msg('maryam', 'Bringing the new astrolabe.', 2 * DAY - HOUR),
		msg(
			'biruni',
			'@Hunayn ibn Ishaq could you translate the Ptolemy note pinned in #translation for the visitors?',
			30 * MIN
		)
	];

	const fatima = [
		msg('fatima', 'The library in Fez has room for your copies, whenever they’re ready.', 9 * DAY),
		msg('hunayn', 'Thank you! I’ll send the first ten by the next caravan.', 9 * DAY - HOUR, {
			status: 'read'
		})
	];

	const messages = new Map([
		['translation', translation],
		['thabit', thabit],
		['crew', observatoryCrew],
		['observatory', observatory],
		['fatima', fatima],
		['biruni', []]
	]);
	const last = (id: string) => {
		const m = messages.get(id)?.at(-1);
		return m && { text: m.text || 'Sent an attachment', author: m.author, at: m.at };
	};
	const conversations: Conversation[] = [
		{
			id: 'translation',
			kind: 'channel',
			name: 'translation',
			topic: 'Greek and Syriac into Arabic',
			members: ['hunayn', 'thabit', 'kindi', 'musa', 'maryam'],
			pinned: true,
			unread: 2,
			mentions: 1,
			last: last('translation')
		},
		{
			id: 'thabit',
			kind: 'direct',
			members: ['hunayn', 'thabit'],
			unread: 2,
			mentions: 0,
			last: last('thabit')
		},
		{
			id: 'crew',
			kind: 'group',
			name: 'Observatory crew',
			members: ['hunayn', 'maryam', 'biruni'],
			unread: 0,
			mentions: 0,
			last: last('crew')
		},
		{
			id: 'observatory',
			kind: 'channel',
			name: 'observatory',
			topic: 'Nights at the Shammasiyya observatory',
			members: ['hunayn', 'biruni', 'maryam', 'musa'],
			muted: true,
			unread: 3,
			mentions: 1,
			last: last('observatory')
		},
		{ id: 'biruni', kind: 'direct', members: ['hunayn', 'biruni'], unread: 0, mentions: 0 },
		{
			id: 'fatima',
			kind: 'direct',
			members: ['hunayn', 'fatima'],
			archived: true,
			unread: 0,
			mentions: 0,
			last: last('fatima')
		}
	];
	return { conversations, messages, threads };
}

const answers = [
	'Let me check the Greek and get back to you.',
	'Good point. I’ll add it to the glossary.',
	'Agreed. Shall we meet after the noon prayer?',
	'I have the copy here, sending the page now.',
	'That matches what I found in the Syriac.'
];

/** A ready-to-use demo backend. Pass `empty` for a new workspace with no conversations yet. */
export function createMock({ empty = false, delay = 450 } = {}) {
	const store: Store = empty
		? { conversations: [], messages: new Map(), threads: new Map() }
		: seed();
	const me = 'hunayn';
	const listeners = new Set<(e: Live) => void>();
	const timers = new Set<ReturnType<typeof setTimeout>>();
	let fail = false;
	let turn = 0;

	const later = (fn: () => void, ms: number) => {
		const t = setTimeout(() => {
			timers.delete(t);
			fn();
		}, ms);
		timers.add(t);
	};
	const emit = (e: Live) => {
		// Receipts are kept here too, so a conversation opened later shows them.
		if (e.type === 'update') {
			const m = [
				...(store.messages.get(e.conversation) ?? []),
				...[...store.threads.values()].flat()
			].find((x) => x.id === e.id);
			if (m) Object.assign(m, e.change);
		}
		listeners.forEach((on) => on(e));
	};
	const wait = <T>(value: () => T, ms = delay) =>
		new Promise<T>((done, reject) =>
			later(() => {
				if (fail) {
					fail = false;
					reject(new ApiError('offline'));
				} else done(value());
			}, ms)
		);
	const conversation = (id: string) => {
		const c = store.conversations.find((x) => x.id === id);
		if (!c) throw new ApiError('not_found');
		return c;
	};
	const list = (id: string) => store.messages.get(id) ?? store.messages.set(id, []).get(id)!;
	// A JSON copy, not structuredClone: what the app hands in can be a reactive proxy.
	const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

	// Someone answers what you said: typing first, then the message; receipts along the way.
	function answer(id: string, message: ChatMessage, parent?: string) {
		const c = conversation(id);
		const others = c.members.filter((m) => m !== me);
		const replier = others[turn % others.length];
		later(
			() =>
				emit({ type: 'update', conversation: id, id: message.id, change: { status: 'delivered' } }),
			900
		);
		later(
			() =>
				emit({
					type: 'update',
					conversation: id,
					id: message.id,
					change: { status: 'read', readBy: c.kind === 'direct' ? undefined : others.slice(0, 2) }
				}),
			2200
		);
		if (!replier || c.muted) return;
		later(() => emit({ type: 'typing', conversation: id, user: replier, typing: true }), 2600);
		later(() => {
			emit({ type: 'typing', conversation: id, user: replier, typing: false });
			const reply: ChatMessage = {
				id: `r${Date.now()}`,
				author: replier,
				text: answers[turn++ % answers.length],
				at: Date.now()
			};
			(parent ? store.threads.get(parent) : list(id))?.push(reply);
			if (!parent) c.last = { text: reply.text, author: replier, at: reply.at };
			emit({ type: 'message', conversation: id, message: clone(reply), parent });
		}, 4600);
	}

	const api: MessagingApi & { failNext(): void; stop(): void } = {
		me,
		users: () => wait(() => clone(people)),
		conversations: () => wait(() => clone(store.conversations)),
		messages: (id, before) =>
			wait(() => {
				const all = list(conversation(id).id);
				const end = before ? all.findIndex((m) => m.id === before) : all.length;
				return clone(all.slice(Math.max(0, end - 30), end));
			}),
		thread: (id, parent) => wait(() => clone(store.threads.get(parent) ?? [])),
		send: (id, message, _files, parent) =>
			wait(() => {
				const c = conversation(id);
				const saved = { ...message, status: 'sent' as const };
				if (parent) {
					const replies = store.threads.get(parent) ?? store.threads.set(parent, []).get(parent)!;
					replies.push(saved);
					const p = list(id).find((m) => m.id === parent);
					if (p) p.replies = replies.length;
				} else {
					list(id).push(saved);
					c.last = { text: message.text || 'Sent an attachment', author: me, at: message.at };
				}
				answer(id, message, parent);
				return { status: 'sent' };
			}, 600),
		save: (id, message) =>
			wait(() => {
				const all = list(id);
				const at = all.findIndex((m) => m.id === message.id);
				if (at >= 0) all[at] = clone(message);
			}),
		hide: (id, messageId) =>
			wait(() => {
				store.messages.set(
					id,
					list(id).filter((m) => m.id !== messageId)
				);
			}),
		update: (id, change) => wait(() => void Object.assign(conversation(id), change)),
		read: (id) =>
			wait(() => {
				const c = conversation(id);
				c.unread = 0;
				c.mentions = 0;
			}, 50),
		create: (members, name) =>
			wait(() => {
				const all = [me, ...members.filter((m) => m !== me)];
				if (all.length === 2) {
					const existing = store.conversations.find(
						(c) => c.kind === 'direct' && c.members.includes(all[1])
					);
					if (existing) return clone({ ...existing, archived: false });
				} else if (!name?.trim()) throw new ApiError('invalid');
				const c: Conversation = {
					id: `c${Date.now()}`,
					kind: all.length === 2 ? 'direct' : 'group',
					name: all.length === 2 ? undefined : name!.trim(),
					members: all,
					unread: 0,
					mentions: 0
				};
				store.conversations.push(c);
				store.messages.set(c.id, []);
				return clone(c);
			}),
		search: (q) =>
			wait(() =>
				[...store.messages]
					.filter(([id]) => !q.in || id === q.in)
					.flatMap(([conversation, all]) =>
						all
							.filter((m) => matches(m, q))
							.map((message) => ({ conversation, message: clone(message) }))
					)
					.sort((a, b) => b.message.at - a.message.at)
					.slice(0, 50)
			),
		listen(on) {
			listeners.add(on);
			return () => listeners.delete(on);
		},
		/** The next call fails, as if offline. */
		failNext: () => (fail = true),
		/** Stops every pending timer. */
		stop: () => {
			timers.forEach(clearTimeout);
			timers.clear();
			listeners.clear();
		}
	};
	return api;
}
