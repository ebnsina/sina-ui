<script lang="ts">
	import DataTable, { type Column } from '#lib/ui/DataTable.svelte';

	type Scholar = { name: string; field: string; city: string; born: number };

	// Birth years are approximate for most; "c." is left out so the column sorts as numbers.
	const scholars: Scholar[] = [
		{ name: 'Jābir ibn Ḥayyān', field: 'Alchemy', city: 'Kūfa', born: 721 },
		{ name: 'Al-Khwārizmī', field: 'Mathematics', city: 'Baghdad', born: 780 },
		{ name: 'Al-Kindī', field: 'Philosophy', city: 'Baghdad', born: 801 },
		{ name: 'Thābit ibn Qurra', field: 'Mathematics', city: 'Baghdad', born: 826 },
		{ name: 'Al-Rāzī', field: 'Medicine', city: 'Rayy', born: 865 },
		{ name: 'Al-Fārābī', field: 'Philosophy', city: 'Baghdad', born: 872 },
		{ name: 'Al-Zahrāwī', field: 'Surgery', city: 'Córdoba', born: 936 },
		{ name: 'Ibn al-Haytham', field: 'Optics', city: 'Cairo', born: 965 },
		{ name: 'Al-Bīrūnī', field: 'Astronomy', city: 'Ghazni', born: 973 },
		{ name: 'Ibn Sīnā', field: 'Medicine', city: 'Bukhara', born: 980 },
		{ name: 'Omar Khayyām', field: 'Mathematics', city: 'Nīshāpūr', born: 1048 },
		{ name: 'Al-Idrīsī', field: 'Geography', city: 'Palermo', born: 1100 },
		{ name: 'Ibn Rushd', field: 'Philosophy', city: 'Córdoba', born: 1126 },
		{ name: 'Al-Jazarī', field: 'Engineering', city: 'Diyarbakır', born: 1136 },
		{ name: 'Naṣīr al-Dīn al-Ṭūsī', field: 'Astronomy', city: 'Marāgha', born: 1201 },
		{ name: 'Ibn al-Nafīs', field: 'Medicine', city: 'Cairo', born: 1213 }
	];

	const columns: Column<Scholar>[] = [
		{ accessorKey: 'name', header: 'Scholar' },
		{ accessorKey: 'field', header: 'Field' },
		{ accessorKey: 'city', header: 'City' },
		{ accessorKey: 'born', header: 'Born (CE)', meta: { align: 'end' } }
	];
</script>

<DataTable
	caption="Scholars of the Golden Age"
	hideCaption
	searchLabel="Search scholars"
	data={scholars}
	{columns}
	pageSize={8}
/>
