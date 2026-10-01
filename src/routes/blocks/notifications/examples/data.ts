import type { Notification } from '#lib/blocks/notifications/Inbox.svelte';

const min = 60_000;
const hour = 60 * min;
const day = 24 * hour;

// Demo activity from Bayt al-Hikma; in your app, load it from your API.
export const sample = (): Notification[] => [
	{
		id: 'n1',
		actor: { name: 'Hunayn ibn Ishaq' },
		text: 'finished copying Galen’s On the Pulse.',
		at: Date.now() - 4 * min
	},
	{
		id: 'n2',
		actor: { name: 'Thābit ibn Qurra' },
		text: 'mentioned you: “Can you check the star table in folio 12?”',
		at: Date.now() - 38 * min,
		mention: true
	},
	{
		id: 'n3',
		actor: { name: 'The loans desk' },
		text: 'reminds you the Canon of Medicine is due back on Thursday.',
		at: Date.now() - 3 * hour,
		read: true
	},
	{
		id: 'n4',
		actor: { name: 'Lubna of Córdoba' },
		text: 'added three pages to Euclid’s Elements, book 7.',
		at: Date.now() - day - 2 * hour,
		read: true
	},
	{
		id: 'n5',
		actor: { name: 'Al-Kindi' },
		text: 'mentioned you in the notes on optics.',
		at: Date.now() - day - 5 * hour,
		mention: true
	},
	{
		id: 'n6',
		actor: { name: 'Banu Musa' },
		text: 'shared the drawings for the self-trimming lamp.',
		at: Date.now() - 4 * day,
		read: true
	}
];

const arrivals: Omit<Notification, 'id' | 'at'>[] = [
	{ actor: { name: 'Al-Khwarizmi' }, text: 'replied to your question on completing the square.' },
	{ actor: { name: 'Fatima al-Fihri' }, text: 'invited you to a reading circle in Fez.' },
	{
		actor: { name: 'Ibn al-Haytham' },
		text: 'mentioned you: “Your lens notes were right.”',
		mention: true
	}
];
let next = 0;
export const arrival = (): Notification => ({
	...arrivals[next++ % arrivals.length],
	id: `new-${Date.now()}`,
	at: Date.now()
});

export const older = (): Notification[] => [
	{
		id: `old-${Date.now()}`,
		actor: { name: 'The copyists’ room' },
		text: 'has a desk free on Saturday mornings.',
		at: Date.now() - 9 * day,
		read: true
	},
	{
		id: `old2-${Date.now()}`,
		actor: { name: 'Al-Razi' },
		text: 'returned the Book of Medicine early.',
		at: Date.now() - 12 * day,
		read: true
	}
];
