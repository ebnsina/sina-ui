<script lang="ts">
	import Table from '#lib/ui/Table.svelte';

	const loans = [
		{ work: 'The Canon of Medicine', volumes: 5, days: 40 },
		{ work: 'Book of Optics', volumes: 7, days: 30 },
		{ work: 'Al-Jabr', volumes: 1, days: 14 },
		{ work: 'Tabula Rogeriana', volumes: 70, days: 7 }
	];
	const n = new Intl.NumberFormat('en');
	const total = loans.reduce((sum, l) => sum + l.volumes, 0);
</script>

<Table caption="Your loans">
	<thead>
		<tr>
			<th scope="col">Work</th>
			<th scope="col" class="num">Volumes</th>
			<th scope="col" class="num">Days left</th>
		</tr>
	</thead>
	<tbody>
		{#each loans as l (l.work)}
			<tr>
				<th scope="row">{l.work}</th>
				<td class="num">{n.format(l.volumes)}</td>
				<td class="num">{n.format(l.days)}</td>
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<th scope="row">Total</th>
			<td class="num">{n.format(total)}</td>
			<td></td>
		</tr>
	</tfoot>
</Table>
