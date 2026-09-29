<script lang="ts">
	import Card from '#lib/ui/Card.svelte';

	const scholars = [
		{ name: 'Al-Khwarizmi', work: 'Algebra and algorithms, Baghdad', href: '#linked' },
		{
			name: 'Ibn al-Haytham',
			work: 'Optics and the scientific method, Cairo',
			href: '#linked'
		},
		{ name: 'Fatima al-Fihri', work: 'Founded al-Qarawiyyin, Fez', href: '#linked' }
	];
</script>

<!-- The whole card is one link, named by its title. -->
<div class="grid">
	{#each scholars as s (s.name)}
		<Card title={s.name} description={s.work} href={s.href} />
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 1rem;
		inline-size: 100%;
	}
</style>
