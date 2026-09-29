<script lang="ts">
	import {
		Book02Icon,
		BookOpen01Icon,
		Location01Icon,
		Moon02Icon,
		Search01Icon,
		Share08Icon,
		Sun03Icon
	} from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import CommandPalette, { type Command } from '#lib/ui/CommandPalette.svelte';

	let open = $state(false);
	let last = $state<string>();
	const did = (what: string) => () => (last = what);

	const commands: Command[] = [
		{
			id: 'borrow',
			label: 'Borrow a manuscript',
			group: 'Library',
			icon: BookOpen01Icon,
			shortcut: ['B'],
			onselect: did('Borrow a manuscript')
		},
		{
			id: 'return',
			label: 'Return a manuscript',
			group: 'Library',
			icon: Book02Icon,
			onselect: did('Return a manuscript')
		},
		{
			id: 'search',
			label: 'Search the catalogue',
			group: 'Library',
			icon: Search01Icon,
			keywords: ['find', 'look up'],
			shortcut: ['/'],
			onselect: did('Search the catalogue')
		},
		{
			id: 'share',
			label: 'Copy link to this page',
			group: 'Library',
			icon: Share08Icon,
			keywords: ['share', 'url'],
			onselect: did('Copy link')
		},
		{
			id: 'baghdad',
			label: 'Bayt al-Ḥikma, Baghdad',
			group: 'Go to',
			icon: Location01Icon,
			keywords: ['house of wisdom', 'iraq'],
			onselect: did('Go to Baghdad')
		},
		{
			id: 'fez',
			label: 'Al-Qarawiyyīn, Fez',
			group: 'Go to',
			icon: Location01Icon,
			keywords: ['morocco'],
			onselect: did('Go to Fez')
		},
		{
			id: 'cordoba',
			label: 'Library of Córdoba',
			group: 'Go to',
			icon: Location01Icon,
			keywords: ['andalus', 'spain'],
			onselect: did('Go to Córdoba')
		},
		{
			id: 'dark',
			label: 'Dark theme',
			group: 'Theme',
			icon: Moon02Icon,
			keywords: ['night', 'appearance'],
			onselect: did('Dark theme')
		},
		{
			id: 'light',
			label: 'Light theme',
			group: 'Theme',
			icon: Sun03Icon,
			keywords: ['day', 'appearance'],
			onselect: did('Light theme')
		}
	];
</script>

<div class="row">
	<Button variant="secondary" onclick={() => (open = true)}>Open command palette</Button>
	<p>{last ? `Last command: ${last}` : 'Try “qara”, “cordoba” or “share”.'}</p>
</div>
<!-- This site's own search already answers ⌘K, so this example opens from its button. -->
<CommandPalette {commands} bind:open shortcut={false} />

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	.row p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
