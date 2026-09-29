<script lang="ts">
	import Assistant from '#lib/blocks/chat/Assistant.svelte';
	// In your app: connection={fetchServerSentEvents('/api/chat')}.
	import { demoConnection } from './demo-connection';
</script>

<Assistant
	connection={demoConnection}
	suggestions={[
		'What was the House of Wisdom?',
		'How did Ibn al-Haytham explain sight?',
		'Where does the word algebra come from?'
	]}
/>
