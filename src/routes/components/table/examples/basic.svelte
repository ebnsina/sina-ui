<script lang="ts">
	import Table from '#lib/ui/Table.svelte';

	const scholars = [
		{ name: 'Al-Khwarizmi', field: 'Mathematics', city: 'Baghdad', died: 850 },
		{ name: 'Al-Kindi', field: 'Philosophy', city: 'Baghdad', died: 873 },
		{ name: 'Al-Razi', field: 'Medicine', city: 'Rayy', died: 925 },
		{ name: 'Ibn al-Haytham', field: 'Optics', city: 'Cairo', died: 1040 },
		{ name: 'Al-Biruni', field: 'Astronomy', city: 'Ghazni', died: 1048 }
	];
	const year = new Intl.NumberFormat('en', { useGrouping: false });
</script>

<Table caption="Scholars of the Golden Age">
	<thead>
		<tr>
			<th scope="col">Name</th>
			<th scope="col">Known for</th>
			<th scope="col">Worked in</th>
			<th scope="col" class="num">Died (CE)</th>
		</tr>
	</thead>
	<tbody>
		{#each scholars as s (s.name)}
			<tr>
				<th scope="row">{s.name}</th>
				<td>{s.field}</td>
				<td>{s.city}</td>
				<td class="num">{year.format(s.died)}</td>
			</tr>
		{/each}
	</tbody>
</Table>
