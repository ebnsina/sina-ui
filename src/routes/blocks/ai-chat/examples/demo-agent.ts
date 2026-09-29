import type { StreamChunk } from '@tanstack/ai';
import type { ConnectConnectionAdapter } from '@tanstack/ai-svelte';

// A stand-in for an agent endpoint: it thinks, calls a couple of tools, then answers, streamed as
// the same events a real agent run sends. Tool results carry a one-line `summary` to show.
type Step = { tool: string; args: Record<string, string>; result: Record<string, unknown> };
const scripts: [RegExp, { thought: string; steps: Step[]; answer: string }][] = [
	[
		/optic|haytham|light|sight/i,
		{
			thought: 'They want the source on vision. Search the catalogue, then check the manuscript.',
			steps: [
				{
					tool: 'search_catalogue',
					args: { query: 'Ibn al-Haytham optics' },
					result: { summary: 'Found 3 manuscripts', ids: ['MS-1021', 'MS-1043', 'MS-1270'] }
				},
				{
					tool: 'read_manuscript',
					args: { id: 'MS-1021' },
					result: { summary: 'Read 7 chapters (Kitab al-Manazir, Cairo, c. 1021)' }
				}
			],
			answer:
				'Kitab al-Manazir (MS-1021) argues that sight works by light entering the eye from objects, not rays leaving it.\n\nChapter 3 describes the dark-room experiments he used to test this.'
		}
	],
	[
		/algebra|khwarizmi|jabr/i,
		{
			thought: 'Find the treatise and its date.',
			steps: [
				{
					tool: 'search_catalogue',
					args: { query: 'al-Khwarizmi al-jabr' },
					result: { summary: 'Found 1 manuscript', ids: ['MS-0820'] }
				}
			],
			answer:
				'MS-0820 is al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala, written in Baghdad around 820. "Al-jabr" is where the word algebra comes from.'
		}
	]
];
const fallback = {
	thought: 'Nothing specific asked. Show what the shelves cover.',
	steps: [
		{
			tool: 'list_shelves',
			args: {},
			result: { summary: '3 shelves: optics, algebra, astronomy' }
		}
	],
	answer:
		"I can search the catalogue and read manuscripts. Try asking about Ibn al-Haytham's optics or al-Khwarizmi's algebra."
};

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((done, fail) => {
		const t = setTimeout(done, ms);
		signal?.addEventListener(
			'abort',
			() => (clearTimeout(t), fail(new DOMException('Stopped', 'AbortError')))
		);
	});

export const demoAgent: ConnectConnectionAdapter = {
	async *connect(messages, _data, signal) {
		const last = messages.at(-1) as { parts?: unknown; content?: unknown } | undefined;
		const parts = (Array.isArray(last?.parts) ? last.parts : []) as {
			type: string;
			content?: string;
		}[];
		const asked =
			typeof last?.content === 'string'
				? last.content
				: parts.map((p) => (p.type === 'text' ? p.content : '')).join(' ');
		const script = scripts.find(([re]) => re.test(asked))?.[1] ?? fallback;
		const runId = crypto.randomUUID();
		const threadId = 'demo';
		const messageId = crypto.randomUUID();
		const chunk = (c: Record<string, unknown>) => c as unknown as StreamChunk;

		yield chunk({ type: 'RUN_STARTED', threadId, runId });
		for (const word of script.thought.split(/(?<=\s)/)) {
			await wait(30, signal);
			yield chunk({ type: 'REASONING_MESSAGE_CONTENT', messageId, delta: word });
		}
		for (const step of script.steps) {
			const toolCallId = crypto.randomUUID();
			yield chunk({
				type: 'TOOL_CALL_START',
				toolCallId,
				toolCallName: step.tool,
				parentMessageId: messageId
			});
			yield chunk({ type: 'TOOL_CALL_ARGS', toolCallId, delta: JSON.stringify(step.args) });
			yield chunk({ type: 'TOOL_CALL_END', toolCallId, input: step.args });
			await wait(900, signal); // the tool running
			yield chunk({
				type: 'TOOL_CALL_RESULT',
				toolCallId,
				messageId: crypto.randomUUID(),
				content: JSON.stringify(step.result)
			});
		}
		yield chunk({ type: 'TEXT_MESSAGE_START', messageId, role: 'assistant' });
		for (const word of script.answer.split(/(?<=\s)/)) {
			await wait(20 + Math.random() * 35, signal);
			yield chunk({ type: 'TEXT_MESSAGE_CONTENT', messageId, delta: word });
		}
		yield chunk({ type: 'TEXT_MESSAGE_END', messageId });
		yield chunk({ type: 'RUN_FINISHED', threadId, runId, finishReason: 'stop' });
	}
};
