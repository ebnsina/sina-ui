<script lang="ts">
	import VideoStudio from '#lib/blocks/media/VideoStudio.svelte';
	// In your app: connection={fetchServerSentEvents('/api/video')}.
	import { demoVideo } from './demo-media';
</script>

<VideoStudio fetcher={demoVideo} placeholder="Stars turning over the observatory at Maragheh" />
