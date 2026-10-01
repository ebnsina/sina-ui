<script lang="ts">
	import { BoatIcon, CamelIcon, HorseIcon } from '@hugeicons/core-free-icons';
	import RadioCards, { type RadioCard } from '#lib/ui/RadioCards.svelte';

	const routes: RadioCard[] = [
		{
			value: 'caravan',
			label: 'By caravan',
			description: 'Baghdad to Damascus, 30 days',
			detail: '4 dinars',
			icon: CamelIcon
		},
		{
			value: 'post',
			label: 'By the barid post',
			description: 'Relay riders, 8 days',
			detail: '15 dinars',
			icon: HorseIcon
		},
		{
			value: 'river',
			label: 'Down the Tigris',
			description: 'To Basra only, 6 days',
			detail: '6 dinars',
			icon: BoatIcon
		}
	];
	let route = $state('caravan');
</script>

<div class="demo">
	<RadioCards legend="Send the manuscript" options={routes} bind:value={route} layout="list" />
</div>

<style>
	.demo {
		inline-size: min(30rem, 100%);
	}
</style>
