<script lang="ts">
	import Chat from '#lib/ui/Chat.svelte';
	import { conversation, me, users, wait } from './data';

	let messages = $state(
		conversation([
			['kindi', 'Draft of the letter on the five essences is on the copying desk.'],
			[
				'thabit',
				'Read it last night. The part on time is the strongest.',
				{ reactions: { '👍': ['kindi'] } }
			],
			['kindi', 'Anyone have the Persian glossary? I need it for the cosmology terms.'],
			[
				'hunayn',
				'@Al-Kindi it’s in the west reading room, second shelf.',
				{ replyTo: 'm2', reactions: { '🙏': ['kindi'], '❤️': ['thabit', 'maryam'] } }
			],
			['maryam', 'Can we meet after the noon prayer to go through the diagrams?'],
			['thabit', 'Works for me.', { replyTo: 'm4', reactions: { '👍': ['maryam', 'hunayn'] } }]
		])
	);
</script>

<div class="frame">
	<Chat
		bind:messages
		{users}
		{me}
		label="Translators’ group"
		send={() => wait(500)}
		save={() => wait(300)}
	/>
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
