<script lang="ts">
	import ImageCompare from '#lib/ui/ImageCompare.svelte';

	const src =
		'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/A_Library_in_Golden_Islamic_Age.jpg/960px-A_Library_in_Golden_Islamic_Age.jpg';
</script>

<div class="demo">
	<ImageCompare beforeLabel="Grayscale" afterLabel="Color" ratio="3 / 4">
		{#snippet before()}<img {src} alt="" style:filter="grayscale(1)" />{/snippet}
		{#snippet after()}<img {src} alt="" />{/snippet}
	</ImageCompare>
	<p>A library in Basra, from al-Wasiti's Maqamat of al-Hariri, 1237.</p>
</div>

<style>
	.demo {
		inline-size: min(22rem, 100%);
	}
	p {
		margin: 0.5rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
