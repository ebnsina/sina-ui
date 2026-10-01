<script lang="ts">
	import Slider from '#lib/ui/Slider.svelte';

	let size = $state(18);
</script>

<!-- A fixed box, so the slider stays put while the text grows under it. -->
<div class="demo">
	<Slider label="Reading size" min={12} max={32} bind:value={size} format={(v) => `${v}px`} />
	<p style:font-size="{size}px">The House of Wisdom</p>
</div>

<style>
	.demo {
		display: grid;
		gap: 0.75rem;
		inline-size: 20rem;
		max-inline-size: 100%;
	}
	p {
		min-block-size: 5rem;
		margin: 0;
		line-height: 2.5rem;
	}
</style>
