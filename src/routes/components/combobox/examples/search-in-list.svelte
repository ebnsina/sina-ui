<script lang="ts">
	import CustomSelect from '#lib/ui/CustomSelect.svelte';

	const scholars = [
		['Abbas ibn Firnas', 'Flight, Córdoba'],
		['Al-Battani', 'Astronomy, Raqqa'],
		['Al-Biruni', 'Astronomy, Ghazni'],
		['Al-Farabi', 'Philosophy, Baghdad'],
		['Al-Idrisi', 'Geography, Palermo'],
		['Al-Jazari', 'Engineering, Diyarbakır'],
		['Al-Khwarizmi', 'Mathematics, Baghdad'],
		['Al-Kindi', 'Philosophy, Baghdad'],
		['Al-Razi', 'Medicine, Rayy'],
		['Al-Zahrawi', 'Surgery, Córdoba'],
		['Banu Musa', 'Mechanics, Baghdad'],
		['Fatima al-Fihri', 'Founded al-Qarawiyyin, Fez'],
		['Ibn al-Haytham', 'Optics, Cairo'],
		['Ibn Battuta', 'Travel, Tangier'],
		['Ibn Khaldun', 'History, Tunis'],
		['Ibn Rushd', 'Philosophy, Córdoba'],
		['Ibn Sina', 'Medicine, Bukhara'],
		['Maryam al-Ijliya', 'Astrolabes, Aleppo'],
		['Nasir al-Din al-Tusi', 'Astronomy, Maragheh'],
		['Omar Khayyam', 'Mathematics, Nishapur'],
		['Sutayta al-Mahamali', 'Mathematics, Baghdad'],
		['Thabit ibn Qurra', 'Mathematics, Baghdad']
	].map(([label, description]) => ({
		value: label.toLowerCase().replace(/\W+/g, '-'),
		label,
		description
	}));
	let mentor = $state('');
</script>

<CustomSelect
	label="Mentor"
	options={scholars}
	bind:value={mentor}
	placeholder="Choose a scholar"
	searchable
	searchLabel="Search scholars"
	empty="No scholar by that name"
/>
