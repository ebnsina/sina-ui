<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Chat from '#lib/ui/Chat.svelte';
	import { conversation, me, users, wait } from './data';

	let messages = $state(
		conversation([
			['kindi', 'I’m in the reading room until sunset if anyone needs the glossary.'],
			['hunayn', 'Thanks! Ask me anything about the Galen translation.']
		])
	);
	let typing = $state<string[]>([]);
	let unread = $state<string>();
	// Pending demo replies, cancelled if the example goes away.
	const timers: ReturnType<typeof setTimeout>[] = [];
	const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
	onMount(() => () => timers.forEach(clearTimeout));

	const replies = [
		'Good question. Let me check the Syriac copy first.',
		'In the margin of folio 12 there’s a note about exactly that.',
		'I agree. We should ask Thabit, he read it twice.',
		'Send me the passage and I’ll compare it tonight.'
	];
	let turn = 0;

	// Someone else writes: typing first, then the message.
	function incoming(author: string, text: string) {
		typing = [...typing, author];
		later(() => {
			typing = typing.filter((t) => t !== author);
			messages = [...messages, { id: crypto.randomUUID(), author, text, at: Date.now() }];
		}, 1600);
	}

	async function send() {
		await wait(500);
		later(() => incoming('kindi', replies[turn++ % replies.length]), 600);
	}
</script>

<div class="demo">
	<div class="frame">
		<Chat bind:messages {users} {me} {typing} {unread} label="Chat with Al-Kindi" {send} />
	</div>
	<Button
		variant="secondary"
		onclick={() =>
			incoming('thabit', 'Did anyone see the new paper from Samarkand? It’s much smoother.')}
	>
		Thabit writes in
	</Button>
</div>

<style>
	.demo {
		display: grid;
		justify-items: start;
		gap: 1rem;
		inline-size: 100%;
	}
	.frame {
		inline-size: 100%;
		block-size: 26rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		overflow: hidden;
	}
</style>
