<script lang="ts">
	import Chat from '#lib/blocks/chat/Chat.svelte';
	// In your app: import { fetchServerSentEvents } from '@tanstack/ai-svelte';
	// and pass connection={fetchServerSentEvents('/api/chat')}.
	import { demoConnection } from './demo-connection';
</script>

<Chat
	connection={demoConnection}
	title="Ask the librarian"
	suggestions={[
		'What was the House of Wisdom?',
		'How did Ibn al-Haytham explain sight?',
		'Where does the word algebra come from?'
	]}
/>
