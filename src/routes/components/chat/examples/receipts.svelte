<script lang="ts">
	import { onMount } from 'svelte';
	import Chat from '#lib/ui/Chat.svelte';
	import Switch from '#lib/ui/Switch.svelte';
	import type { ChatMessage } from '#lib/ui/chat.js';
	import { conversation, me, users, wait } from './data';

	let failNext = $state(false);
	let messages = $state(
		conversation([
			['maryam', 'The new astrolabe plate is ready for Baghdad’s latitude.'],
			['hunayn', 'Wonderful. Send the measurements when you can.', { status: 'read' }],
			['maryam', 'Tonight, after I check them against the star table.'],
			['hunayn', 'Also, could you engrave the Qibla line on the back?', { status: 'delivered' }]
		])
	);

	// Pending receipts, cancelled if the example goes away.
	const timers: ReturnType<typeof setTimeout>[] = [];
	onMount(() => () => timers.forEach(clearTimeout));
	const mark = (id: string, status: ChatMessage['status'], ms: number) =>
		timers.push(
			setTimeout(() => (messages = messages.map((x) => (x.id === id ? { ...x, status } : x))), ms)
		);

	// Sent, then delivered, then read, like a real service reporting back.
	async function send(m: ChatMessage) {
		await wait(700);
		if (failNext) {
			failNext = false;
			throw new Error('offline');
		}
		mark(m.id, 'delivered', 1200);
		mark(m.id, 'read', 3000);
	}
</script>

<div class="demo">
	<Switch bind:checked={failNext}>Fail the next send</Switch>
	<div class="frame">
		<Chat bind:messages {users} {me} label="Chat with Maryam al-Asturlabi" {send} />
	</div>
</div>

<style>
	.demo {
		display: grid;
		gap: 1rem;
		inline-size: 100%;
	}
	.frame {
		block-size: 26rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		overflow: hidden;
	}
</style>
