<script lang="ts">
	import Combobox from '#lib/ui/Combobox.svelte';

	let scholar = $state('ibn-sina');
	const scholars = [
		{ value: 'khwarizmi', label: 'Al-Khwārizmī', description: 'Algebra · Baghdad' },
		{ value: 'kindi', label: 'Al-Kindī', description: 'Philosophy · Baghdad' },
		{ value: 'razi', label: 'Al-Rāzī', description: 'Medicine · Rayy' },
		{ value: 'ibn-sina', label: 'Ibn Sīnā', description: 'Medicine · Bukhara' },
		{ value: 'haytham', label: 'Ibn al-Haytham', description: 'Optics · Cairo' },
		{ value: 'biruni', label: 'Al-Bīrūnī', description: 'Astronomy · Ghazni' },
		{ value: 'zahrawi', label: 'Al-Zahrāwī', description: 'Surgery · Córdoba' },
		{ value: 'khayyam', label: 'Omar Khayyām', description: 'Mathematics · Nīshāpūr' },
		{ value: 'idrisi', label: 'Al-Idrīsī', description: 'Geography · Palermo' },
		{
			value: 'ibn-battuta',
			label: 'Ibn Baṭṭūṭa',
			description: 'Away on a journey',
			disabled: true
		}
	];
</script>

<Combobox
	label="Scholar"
	options={scholars}
	bind:value={scholar}
	hint="Try “sina” or “haytham”: accents don't matter."
/>
