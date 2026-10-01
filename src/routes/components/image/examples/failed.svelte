<script lang="ts">
	import Image from '#lib/ui/Image.svelte';
</script>

<div class="demo">
	<Image
		src="https://example.invalid/kitab-al-hiyal.jpg"
		alt="A page from the Book of Ingenious Devices"
		ratio="4 / 3"
	/>
</div>

<style>
	.demo {
		inline-size: min(20rem, 100%);
	}
</style>
