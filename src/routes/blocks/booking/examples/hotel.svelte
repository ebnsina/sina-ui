<script lang="ts">
	import Hotel from '#lib/blocks/booking/Hotel.svelte';
</script>

<Hotel
	name="Dar al-Zahra guesthouse, Córdoba"
	taxRate={0.1}
	rooms={[
		{
			id: 'garden',
			name: 'Garden room',
			description: 'A double bed and a door onto the orange-tree courtyard.',
			rate: 9_500,
			sleeps: 2
		},
		{
			id: 'library',
			name: 'Library suite',
			description: 'A bedroom, a sitting room lined with books, and a daybed.',
			rate: 16_000,
			sleeps: 3
		},
		{
			id: 'family',
			name: 'Family rooms',
			description: 'Two connecting rooms around a small fountain.',
			rate: 21_000,
			sleeps: 5
		}
	]}
/>
