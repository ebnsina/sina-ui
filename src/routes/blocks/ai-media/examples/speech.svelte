<script lang="ts">
	import SpeechStudio from '#lib/blocks/media/SpeechStudio.svelte';
	// In your app: connection={fetchServerSentEvents('/api/speech')}.
	import { demoSpeech } from './demo-media';
</script>

<SpeechStudio
	fetcher={demoSpeech}
	text="Knowledge is a tree whose roots are in study and whose fruit is in practice."
/>
