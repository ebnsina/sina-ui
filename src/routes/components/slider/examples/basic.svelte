<script lang="ts">
	import Slider from '#lib/ui/Slider.svelte';

	let size = $state(18);
</script>

<Slider label="Reading size" min={12} max={32} bind:value={size} format={(v) => `${v}px`} />
<p style:font-size="{size}px" style:margin="0">The House of Wisdom</p>
