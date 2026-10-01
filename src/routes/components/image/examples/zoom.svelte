<script lang="ts">
	import Image from '#lib/ui/Image.svelte';
</script>

<div class="demo">
	<Image
		src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/A_Library_in_Golden_Islamic_Age.jpg/960px-A_Library_in_Golden_Islamic_Age.jpg"
		zoom="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/A_Library_in_Golden_Islamic_Age.jpg/1280px-A_Library_in_Golden_Islamic_Age.jpg"
		alt="Scholars reading in a library in Basra, books stacked on shelves behind them"
		width={960}
		height={1280}
		ratio="1"
		placeholder="#c9b48a"
	/>
</div>

<style>
	.demo {
		inline-size: min(18rem, 100%);
	}
</style>
