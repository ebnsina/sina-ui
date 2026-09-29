<script lang="ts">
	import Transcriber from '#lib/blocks/media/Transcriber.svelte';
	// In your app: connection={fetchServerSentEvents('/api/transcribe')}.
	import { demoTranscribe } from './demo-media';
</script>

<Transcriber fetcher={demoTranscribe} />
