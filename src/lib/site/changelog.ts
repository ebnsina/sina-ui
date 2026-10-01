import { nav, type PageId } from './nav';

// What each release contains, for people using Sina UI: newest first, in plain words.
export type Entry = { text: string; href?: PageId };
export type Release = {
	title: string;
	/** ISO date it shipped; none while it's still coming. */
	date?: string;
	summary: string;
	groups: { title: string; items: Entry[] }[];
};

// 1.0 is everything on the site, so its lists come straight from the navigation and never drift.
const sections = nav
	// Pro is sold separately and keeps its own notes.
	.filter((s) => s.title !== 'Getting started' && s.title !== 'Pro')
	.map((s) => ({ title: s.title, items: s.items.map((i) => ({ text: i.title, href: i.href })) }));

export const releases: Release[] = [
	{
		title: '1.0',
		summary: 'The first release: every component, widget and block on this site.',
		groups: [
			{
				title: 'Foundations',
				items: [
					{
						text: 'Theme with a few CSS variables: accent, corners, type and motion',
						href: '/theming'
					},
					{ text: 'Light and dark, following the reader’s system or their choice' },
					{ text: 'Right-to-left languages mirror throughout' },
					{ text: 'Full keyboard use and screen reader support in every component' },
					{ text: 'Fits the smallest phones (320px wide) without scrolling sideways' },
					{ text: 'Motion built in, and calmer when the reader asks for reduced motion' },
					{ text: 'Add components with one command, npx sinaui add, and own the code' },
					{
						text: 'Docs for AI assistants: llms.txt, the full docs in one file, and an agent skill'
					}
				]
			},
			...sections
		]
	}
];
