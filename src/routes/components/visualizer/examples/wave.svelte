<script lang="ts">
	import Visualizer from '#lib/ui/Visualizer.svelte';

	let audio = $state<HTMLAudioElement>();
</script>

<div class="demo">
	<Visualizer source={audio} variant="wave" />
	<audio
		bind:this={audio}
		controls
		crossorigin="anonymous"
		preload="metadata"
		src="https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0c/Taxim_Hicaz_%28c._1928%29.ogg/Taxim_Hicaz_%28c._1928%29.ogg.mp3"
	></audio>
</div>

<style>
	.demo {
		display: grid;
		gap: 0.75rem;
		inline-size: 100%;
		max-inline-size: 28rem;
	}
	audio {
		inline-size: 100%;
	}
</style>
