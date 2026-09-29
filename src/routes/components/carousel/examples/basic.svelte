<script lang="ts">
	import Carousel from '#lib/ui/Carousel.svelte';

	const treasures = [
		{ title: 'The Canon of Medicine', by: 'Ibn Sīnā', year: 1025, hue: 160 },
		{ title: 'Book of Optics', by: 'Ibn al-Haytham', year: 1021, hue: 200 },
		{ title: 'Al-Jabr', by: 'Al-Khwārizmī', year: 820, hue: 30 },
		{ title: 'Tabula Rogeriana', by: 'Al-Idrīsī', year: 1154, hue: 280 },
		{ title: 'Book of Ingenious Devices', by: 'Al-Jazarī', year: 1206, hue: 340 }
	];
</script>

<div class="wrap">
	<Carousel label="Treasures of the House of Wisdom" slides={treasures}>
		{#snippet slide(t)}
			<article class="card" style:--hue={t.hue}>
				<span class="year">{t.year}</span>
				<h4>{t.title}</h4>
				<p>{t.by}</p>
				<a href="#basic">View manuscript</a>
			</article>
		{/snippet}
	</Carousel>
</div>

<style>
	.wrap {
		inline-size: min(100%, 30rem);
	}
	.card {
		display: grid;
		align-content: end;
		gap: 0.125rem;
		aspect-ratio: 16 / 10;
		padding: 1.25rem;
		box-sizing: border-box;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: linear-gradient(
			145deg,
			hsl(var(--hue) 45% 38%),
			hsl(calc(var(--hue) + 40) 50% 24%)
		);
		color: #fff;
	}
	.year {
		font-variant-numeric: tabular-nums;
		opacity: 0.8;
	}
	h4 {
		margin: 0;
		font-size: 1.25rem;
	}
	p {
		margin: 0 0 0.5rem;
		opacity: 0.85;
	}
	a {
		color: #fff;
		font-weight: 500;
	}
</style>
