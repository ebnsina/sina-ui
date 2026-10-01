<script lang="ts">
	import RadioCards, { type RadioCard } from '#lib/ui/RadioCards.svelte';

	const plans: RadioCard[] = [
		{ value: 'reader', label: 'Reader', description: 'Two loans at a time', detail: 'Free' },
		{
			value: 'scholar',
			label: 'Scholar',
			description: 'Ten loans and a copying desk',
			detail: '12 dinars'
		},
		{
			value: 'circle',
			label: 'Study circle',
			description: 'Eight members, one room',
			detail: '40 dinars'
		},
		{
			value: 'patron',
			label: 'Patron',
			description: 'Your name on a shelf',
			detail: '100 dinars',
			disabled: true,
			reason: 'Opens again after Ramadan'
		}
	];
	let plan = $state('scholar');
</script>

<div class="demo">
	<RadioCards legend="Membership" options={plans} bind:value={plan} name="plan" />
</div>

<style>
	.demo {
		inline-size: min(40rem, 100%);
	}
</style>
