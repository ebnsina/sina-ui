<script lang="ts">
	import AvatarGroup from '#lib/ui/AvatarGroup.svelte';

	const readers = [
		{ name: 'Ibn Sina' },
		{ name: 'Fatima al-Fihri' },
		{ name: 'Al-Khwarizmi' },
		{ name: 'Maryam al-Asturlabi' },
		{ name: 'Ibn al-Haytham' },
		{ name: 'Al-Biruni' },
		{ name: 'Lubna of Córdoba' }
	];
</script>

<AvatarGroup people={readers} label="7 readers" />
