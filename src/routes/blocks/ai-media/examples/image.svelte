<script lang="ts">
	import ImageStudio from '#lib/blocks/media/ImageStudio.svelte';
	// In your app: connection={fetchServerSentEvents('/api/image')}.
	import { demoImages } from './demo-media';
</script>

<ImageStudio fetcher={demoImages} placeholder="A tiled courtyard floor in Isfahan, morning light" />
