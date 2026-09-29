<script lang="ts">
	import Terminal from '#lib/blocks/chat/Terminal.svelte';
	// In your app: connection={fetchServerSentEvents('/api/agent')}, an endpoint with tools.
	import { demoAgent } from './demo-agent';
</script>

<Terminal connection={demoAgent} />
