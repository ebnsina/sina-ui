<script lang="ts">
	import Chat from '#lib/ui/Chat.svelte';
	import type { ChatMessage } from '#lib/ui/chat.js';
	import { me, users, wait } from './data';

	// 500 messages, one an hour going back; 40 load at a time as you scroll up.
	const authors = ['thabit', 'hunayn', 'kindi', 'maryam'];
	const topics = [
		'the Conics',
		'the star table',
		'the glossary',
		'Galen’s anatomy',
		'the new paper',
		'the observatory'
	];
	const all: ChatMessage[] = Array.from({ length: 500 }, (_, i) => ({
		id: `h${i}`,
		author: authors[(i * 7) % 4],
		text: `Note ${i + 1} on ${topics[i % topics.length]}.`,
		at: Date.now() - (500 - i) * 3_600_000,
		status: authors[(i * 7) % 4] === me ? 'read' : undefined
	}));
	let messages = $state(all.slice(-40));

	async function older() {
		await wait(700);
		const first = all.findIndex((m) => m.id === messages[0]?.id);
		return all.slice(Math.max(0, first - 40), first);
	}
</script>

<div class="frame">
	<Chat bind:messages {users} {me} label="Library log" {older} send={() => wait(500)} />
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 30rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		overflow: hidden;
	}
</style>
