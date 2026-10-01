<script lang="ts">
	import Table from '#lib/blocks/booking/Table.svelte';
</script>

<Table
	name="Bab Touma kitchen, Damascus"
	phone="+963 11 555 0142"
	hours={{ timeZone: 'Asia/Damascus', open: 12, close: 23, days: [0, 1, 2, 3, 4, 6] }}
	areas={[
		{
			value: 'hall',
			label: 'Dining hall',
			description: 'Under the painted ceiling, near the kitchen.',
			seats: 8
		},
		{
			value: 'courtyard',
			label: 'Courtyard',
			description: 'Around the fountain, under the lemon trees.',
			seats: 6
		},
		{
			value: 'iwan',
			label: 'Iwan',
			description: 'The raised alcove, cushions and low tables.',
			seats: 4
		}
	]}
/>
