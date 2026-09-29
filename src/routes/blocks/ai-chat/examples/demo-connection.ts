import type { StreamChunk } from '@tanstack/ai';
import type { ConnectConnectionAdapter } from '@tanstack/ai-svelte';

// A stand-in for /api/chat so the demo runs without a key: scripted replies, streamed word by word
// as the same events the real endpoint sends.
const replies: [RegExp, string][] = [
	[
		/wisdom|bayt|baghdad/i,
		"The House of Wisdom was the great library and translation centre of Abbasid Baghdad, flourishing in the 9th century.\n\nScholars there translated Greek, Persian and Indian works into Arabic, and went on to add their own: al-Khwarizmi's algebra among them."
	],
	[
		/optic|haytham|light/i,
		"Ibn al-Haytham's Book of Optics, finished around 1021 in Cairo, argued that we see because light travels from objects into the eye.\n\nHe tested his ideas by experiment, which is why he's often called an early champion of the scientific method."
	],
	[
		/algebra|khwarizmi|jabr/i,
		'Al-Khwarizmi wrote al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala in Baghdad around 820. "Al-jabr" gave algebra its name, and his own name gave us the word "algorithm".'
	]
];
const fallback =
	"That's outside what I have on the shelves in this demo. Try asking about the House of Wisdom, Ibn al-Haytham's optics, or al-Khwarizmi's algebra.";

const list = (items: string[]) => new Intl.ListFormat('en', { type: 'conjunction' }).format(items);

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((done, fail) => {
		const t = setTimeout(done, ms);
		signal?.addEventListener(
			'abort',
			() => (clearTimeout(t), fail(new DOMException('Stopped', 'AbortError')))
		);
	});

export const demoConnection: ConnectConnectionAdapter = {
	async *connect(messages, _data, signal) {
		// Messages arrive as UI messages (parts) or model messages (content): read either.
		const last = messages.at(-1) as { parts?: unknown; content?: unknown } | undefined;
		const parts = (
			Array.isArray(last?.parts) ? last.parts : Array.isArray(last?.content) ? last.content : []
		) as { type: string; content?: string }[];
		const asked =
			typeof last?.content === 'string'
				? last.content
				: parts.map((p) => (p.type === 'text' ? p.content : '')).join(' ');
		const kinds = [...new Set(parts.map((p) => p.type).filter((t) => t !== 'text'))];
		const reply = kinds.length
			? `Thanks, your ${list(kinds.map((k) => (k === 'document' ? 'PDF' : k)))} arrived.\n\nThis demo can't look inside files. Connected to a model that reads them, this reply would describe what's in it, and you could ask about it.`
			: (replies.find(([re]) => re.test(asked))?.[1] ?? fallback);
		const runId = crypto.randomUUID();
		const threadId = 'demo';
		const messageId = crypto.randomUUID();

		yield { type: 'RUN_STARTED', threadId, runId } as StreamChunk;
		await wait(600, signal); // thinking
		yield { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant' } as StreamChunk;
		for (const word of reply.split(/(?<=\s)/)) {
			await wait(25 + Math.random() * 45, signal);
			yield { type: 'TEXT_MESSAGE_CONTENT', messageId, delta: word } as StreamChunk;
		}
		yield { type: 'TEXT_MESSAGE_END', messageId } as StreamChunk;
		yield { type: 'RUN_FINISHED', threadId, runId, finishReason: 'stop' } as StreamChunk;
	}
};
