<script lang="ts">
	import DataTable, { type Column } from '#lib/ui/DataTable.svelte';

	type Work = { title: string; author: string; written: number; loans: number };

	const works: Work[] = [
		{
			title: 'The Compendious Book on Calculation',
			author: 'Al-Khwārizmī',
			written: 820,
			loans: 1204
		},
		{ title: 'Book of Optics', author: 'Ibn al-Haytham', written: 1021, loans: 866 },
		{ title: 'The Canon of Medicine', author: 'Ibn Sīnā', written: 1025, loans: 2310 },
		{ title: 'Kitāb al-Taṣrīf', author: 'Al-Zahrāwī', written: 1000, loans: 547 },
		{ title: 'Tabula Rogeriana', author: 'Al-Idrīsī', written: 1154, loans: 391 },
		{
			title: 'Book of Ingenious Mechanical Devices',
			author: 'Al-Jazarī',
			written: 1206,
			loans: 978
		}
	];

	const nf = new Intl.NumberFormat();
	const columns: Column<Work>[] = [
		{ accessorKey: 'title', header: 'Title' },
		{ accessorKey: 'author', header: 'Author' },
		{ accessorKey: 'written', header: 'Written (CE)', meta: { align: 'end' } },
		{
			accessorKey: 'loans',
			header: 'Loans',
			cell: (c) => nf.format(c.getValue<number>()),
			meta: { align: 'end' }
		}
	];
</script>

<DataTable caption="Most borrowed works" data={works} {columns} />
