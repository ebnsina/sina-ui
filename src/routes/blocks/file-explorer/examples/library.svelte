<script lang="ts">
	import { asset } from '$app/paths';
	import FileExplorer, { type ExplorerItem } from '#lib/blocks/file-explorer/FileExplorer.svelte';
	import type { Send } from '#lib/ui/uploads.svelte.js';

	const day = (n: number) => new Date(Date.UTC(2026, 8, 29 - n)).toISOString();
	let items = $state<ExplorerItem[]>([
		{ id: 'ms', name: 'Manuscripts', folder: true, parent: null, modified: day(1), starred: true },
		{
			id: 'stars',
			name: 'Star tables',
			folder: true,
			parent: null,
			modified: day(4),
			color: '#3b82f6'
		},
		{
			id: 'tr',
			name: 'Translations',
			folder: true,
			parent: null,
			modified: day(6),
			color: '#f59e0b'
		},
		{
			id: 'letters',
			name: 'Letters',
			folder: true,
			parent: null,
			modified: day(9),
			color: '#f43f5e'
		},
		{
			id: 'greek',
			name: 'From Greek',
			folder: true,
			parent: 'tr',
			modified: day(7),
			color: '#f59e0b'
		},
		{
			id: 'f1',
			name: 'Book of Optics.pdf',
			parent: 'ms',
			kind: 'pdf',
			size: 24_600_000,
			modified: day(1)
		},
		{
			id: 'f2',
			name: 'Canon of Medicine, vol 1.pdf',
			parent: 'ms',
			kind: 'pdf',
			size: 88_200_000,
			modified: day(3)
		},
		{
			id: 'f3',
			name: 'Folio 12r.jpg',
			parent: 'ms',
			kind: 'image',
			size: 4_800_000,
			thumbnail: asset('demo/star-tile.svg'),
			modified: day(2)
		},
		{
			id: 'f4',
			name: 'Zij al-Sindhind.xlsx',
			parent: 'stars',
			kind: 'sheet',
			size: 312_000,
			modified: day(4),
			starred: true
		},
		{ id: 'f5', name: 'altitude.ts', parent: 'stars', kind: 'code', size: 2_400, modified: day(5) },
		{
			id: 'f6',
			name: 'Euclid, book 7.docx',
			parent: 'greek',
			kind: 'doc',
			size: 540_000,
			modified: day(7)
		},
		{
			id: 'f7',
			name: 'Recitation, al-Fatiha.mp3',
			parent: null,
			kind: 'audio',
			size: 6_100_000,
			modified: day(0)
		},
		{
			id: 'f8',
			name: 'Observatory night.mp4',
			parent: null,
			kind: 'video',
			size: 210_000_000,
			modified: day(2)
		},
		{
			id: 'f9',
			name: 'Reading list.docx',
			parent: null,
			kind: 'doc',
			size: 88_000,
			modified: day(8),
			starred: true
		},
		{
			id: 'sufi',
			name: 'Book of Fixed Stars',
			folder: true,
			parent: 'stars',
			modified: day(3),
			color: '#6366f1'
		},
		// Al-Sufi's catalogue, one file per star: a folder big enough to draw a page at a time.
		...Array.from({ length: 1018 }, (_, n) => ({
			id: `star-${n + 1}`,
			name: `Star ${String(n + 1).padStart(4, '0')}.json`,
			parent: 'sufi',
			kind: 'code' as const,
			size: 1_200 + ((n * 37) % 900),
			modified: day(3 + (n % 20))
		})),
		{
			id: 'f10',
			name: 'Letter to al-Kindi.docx',
			parent: 'letters',
			kind: 'doc',
			size: 64_000,
			modified: day(10)
		}
	]);

	// Stands in for a real upload: progress over about two seconds.
	const send: Send = (file, { onprogress, signal }) =>
		new Promise((resolve, reject) => {
			let p = 0;
			const timer = setInterval(() => {
				onprogress((p += 0.05 + Math.random() * 0.1));
				if (p >= 1) (clearInterval(timer), resolve());
			}, 150);
			signal.addEventListener('abort', () => (clearInterval(timer), reject(signal.reason)));
		});
</script>

<FileExplorer bind:items {send} />
