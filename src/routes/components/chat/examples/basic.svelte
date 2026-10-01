<script lang="ts">
	import Chat from '#lib/ui/Chat.svelte';
	import { conversation, me, users, wait } from './data';

	let messages = $state(
		conversation([
			['thabit', 'The Greek copy of the Conics arrived from Constantinople this morning.'],
			['hunayn', 'Finally! Is it the complete one?'],
			['thabit', 'Books one to seven. The eighth is still missing.'],
			['thabit', 'I’ll start on book five tonight.'],
			['hunayn', 'Keep the Greek terms in the margin, we’ll settle the Arabic ones together.'],
			['thabit', 'Agreed. Can you check my reading of the second proposition tomorrow?']
		])
	);
</script>

<div class="frame">
	<Chat bind:messages {users} {me} label="Chat with Thabit ibn Qurra" send={() => wait(600)} />
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 28rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		overflow: hidden;
	}
</style>
