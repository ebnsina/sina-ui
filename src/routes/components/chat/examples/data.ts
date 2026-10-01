import type { ChatMessage, ChatUser } from '#lib/ui/chat.js';

export const me = 'hunayn';
export const users: ChatUser[] = [
	{ id: 'hunayn', name: 'Hunayn ibn Ishaq', online: true },
	{ id: 'thabit', name: 'Thabit ibn Qurra', online: true },
	{ id: 'kindi', name: 'Al-Kindi' },
	{ id: 'maryam', name: 'Maryam al-Asturlabi', online: true }
];

const minute = 60_000;
/** A conversation spread over yesterday and today, ending a few minutes ago. */
export function conversation(
	lines: [author: string, text: string, extra?: Partial<ChatMessage>][]
) {
	const end = Date.now() - 3 * minute;
	return lines.map(([author, text, extra], i): ChatMessage => {
		const back = lines.length - 1 - i;
		// The first third happened yesterday; the rest a minute or two apart.
		const at =
			back > (lines.length * 2) / 3 ? end - 86_400_000 - back * 2 * minute : end - back * 90_000;
		return { id: `m${i}`, author, text, at, status: author === me ? 'read' : undefined, ...extra };
	});
}

export const wait = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
