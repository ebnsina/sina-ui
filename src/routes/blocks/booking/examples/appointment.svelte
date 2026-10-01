<script lang="ts">
	import Appointment from '#lib/blocks/booking/Appointment.svelte';
</script>

<Appointment
	place="The bimaristan of al-Nuri, Damascus"
	hours={{ timeZone: 'Asia/Damascus', open: 8, close: 14, days: [0, 1, 2, 3, 4, 6] }}
	services={[
		{
			id: 'eyes',
			name: 'Eye examination',
			description: 'Sight, eyelids and a look at the lens.',
			minutes: 30,
			price: 4_000
		},
		{
			id: 'consult',
			name: 'General consultation',
			description: 'Talk it through with a physician.',
			minutes: 30,
			price: 3_500
		},
		{
			id: 'bath',
			name: 'Bath and massage',
			description: 'The hammam, then an hour with the masseur.',
			minutes: 90,
			price: 6_500
		}
	]}
	providers={[
		{ id: 'ammar', name: 'Ammar al-Mawsili', role: 'Eye physician' },
		{ id: 'ibn-nafis', name: 'Ibn al-Nafis', role: 'Physician' },
		{ id: 'rufaida', name: 'Rufaida al-Aslamia', role: 'Nurse and masseur' }
	]}
/>
