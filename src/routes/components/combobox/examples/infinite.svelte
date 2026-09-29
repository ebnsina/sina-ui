<script lang="ts">
	import { QueryClient, createInfiniteQuery } from '@tanstack/svelte-query';
	import Combobox from '#lib/ui/Combobox.svelte';

	// Stands in for your API: 10,000 catalogue entries, searched on the "server", 40 to a page.
	const subjects = [
		'Optics',
		'Algebra',
		'Medicine',
		'Astronomy',
		'Geography',
		'Poetry',
		'Logic',
		'Music'
	];
	const cities = [
		'Baghdad',
		'Cairo',
		'Córdoba',
		'Fez',
		'Damascus',
		'Bukhara',
		'Samarkand',
		'Isfahan'
	];
	const catalogue = Array.from({ length: 10_000 }, (_, i) => ({
		value: `ms-${i + 1}`,
		label: `${subjects[i % 8]}, ${cities[Math.floor(i / 8) % 8]} copy ${Math.floor(i / 64) + 1}`,
		description: `Shelf ${(i % 400) + 1}`
	}));
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	async function fetchPage(search: string, page: number) {
		await new Promise((r) => setTimeout(r, 350));
		const q = fold(search.trim());
		const hits = q ? catalogue.filter((m) => fold(m.label).includes(q)) : catalogue;
		const next = (page + 1) * 40 < hits.length ? page + 1 : undefined;
		return { items: hits.slice(page * 40, page * 40 + 40), next };
	}

	const client = new QueryClient();
	let search = $state('');
	let timer: ReturnType<typeof setTimeout>;
	// A short pause after typing, so a word is one request rather than one per letter.
	const onsearch = (q: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => (search = q), 200);
	};

	const query = createInfiniteQuery(
		() => ({
			queryKey: ['catalogue', search],
			queryFn: ({ pageParam }) => fetchPage(search, pageParam),
			initialPageParam: 0,
			getNextPageParam: (last) => last.next
		}),
		() => client
	);
	const options = $derived(query.data?.pages.flatMap((p) => p.items) ?? []);
	let manuscript = $state('');
</script>

<Combobox
	label="Manuscript"
	placeholder="Search the catalogue"
	hint="10,000 entries, loaded 40 at a time as you scroll."
	{options}
	bind:value={manuscript}
	{onsearch}
	onloadmore={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
	loading={query.isFetching}
/>
