<script lang="ts">
	import MentionInput, { type Person } from '#lib/ui/MentionInput.svelte';

	const scholars: Person[] = [
		{ id: 'ibn-sina', name: 'Ibn Sina', detail: 'Physician, Bukhara' },
		{ id: 'khwarizmi', name: 'Al-Khwarizmi', detail: 'Mathematician, Baghdad' },
		{ id: 'biruni', name: 'Al-Biruni', detail: 'Astronomer, Ghazni' },
		{ id: 'haytham', name: 'Ibn al-Haytham', detail: 'Optics, Cairo' },
		{ id: 'fihri', name: 'Fatima al-Fihri', detail: 'Founder, Fez' },
		{ id: 'maryam', name: 'Maryam al-Asturlabi', detail: 'Astrolabe maker, Aleppo' }
	];
	let text = $state('');
	let mentioned = $state<string[]>([]);
</script>

<div class="demo">
	<MentionInput
		label="Note for the reading room"
		people={scholars}
		bind:value={text}
		bind:mentions={mentioned}
		placeholder="Type @ to mention someone"
	/>
	<p class="out" role="status">
		{mentioned.length
			? `Will notify: ${mentioned.map((id) => scholars.find((s) => s.id === id)?.name).join(', ')}`
			: 'No one mentioned yet'}
	</p>
</div>

<style>
	.demo {
		inline-size: min(28rem, 100%);
	}
	.out {
		margin: 0.5rem 0 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
</style>
