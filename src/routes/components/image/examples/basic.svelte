<script lang="ts">
	import Image from '#lib/ui/Image.svelte';
</script>

<div class="demo">
	<Image
		src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/A_Library_in_Golden_Islamic_Age.jpg/960px-A_Library_in_Golden_Islamic_Age.jpg"
		alt="Scholars reading in a library in Basra, books stacked on shelves behind them"
		width={960}
		height={1280}
		ratio="4 / 3"
		placeholder="#c9b48a"
		caption="A library in Basra, from al-Wasiti's Maqamat of al-Hariri, 1237."
	/>
</div>

<style>
	.demo {
		inline-size: min(28rem, 100%);
	}
</style>
