<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { setMenubar, type MenubarEntry } from './context';

	interface Props {
		/** Names the bar ("Manuscript editor"). */
		label: string;
		/** Menubar.Menu for each menu, in order. */
		children: Snippet;
		class?: string;
	}

	let { label, children, class: className }: Props = $props();

	let bar: HTMLDivElement;
	// .raw: entries are compared by identity, which a deep proxy would break.
	let entries = $state.raw<MenubarEntry[]>([]);
	// The one menu name in the tab order (roving tabindex): the whole bar is a single Tab stop.
	let current = $state.raw<MenubarEntry>();

	const ordered = () =>
		[...entries].sort((a, b) =>
			a.button().compareDocumentPosition(b.button()) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);

	/** Moves along the bar; if a menu was open, the new one opens too, as in a desktop app. */
	function move(from: MenubarEntry, to: number | 'first' | 'last') {
		const list = ordered();
		const i = list.indexOf(from);
		const next =
			to === 'first'
				? list[0]
				: to === 'last'
					? list.at(-1)!
					: list[(i + to + list.length) % list.length];
		const wasOpen = from.isOpen();
		if (wasOpen) from.closeNow();
		current = next;
		next.button().focus();
		if (wasOpen) next.show('first');
	}

	setMenubar({
		// Untracked: called from each menu's effect, it must not make that effect depend on the list.
		register: (entry) =>
			untrack(() => {
				entries = [...entries, entry];
				current ??= entry;
				return () =>
					untrack(() => {
						entries = entries.filter((e) => e !== entry);
						if (current === entry) current = entries[0];
					});
			}),
		isTabStop: (entry) => current === entry,
		anyOpen: () => entries.some((e) => e.isOpen()),
		// One menu open at a time. Untracked, or the menu that just closed would re-run this and win.
		opened: (entry) =>
			untrack(() => {
				current = entry;
				for (const e of entries) if (e !== entry && e.isOpen()) e.closeNow();
			}),
		move
	});

	const direction = (e: KeyboardEvent) => {
		const rtl = getComputedStyle(bar).direction === 'rtl';
		return (e.key === 'ArrowRight') !== rtl ? 1 : -1;
	};
</script>

<!-- Keys from inside an open menu bubble here: Left and Right move to the neighboring menu. -->
<div
	bind:this={bar}
	role="menubar"
	tabindex="-1"
	aria-label={label}
	class={['menubar', className]}
	onkeydown={(e) => {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		const target = e.target as Node;
		const inMenu = entries.find((x) => x.menu()?.contains(target));
		const onName = entries.find((x) => x.button() === target);
		const from = inMenu ?? onName;
		if (!from) return;
		e.preventDefault();
		if (inMenu) {
			// Moving from inside a menu always opens the next one.
			inMenu.closeNow();
			const list = ordered();
			const next = list[(list.indexOf(inMenu) + direction(e) + list.length) % list.length];
			current = next;
			next.button().focus();
			next.show('first');
		} else move(from, direction(e));
	}}
>
	{@render children()}
</div>

<style>
	.menubar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		inline-size: fit-content;
		max-inline-size: 100%;
		padding: 0.25rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
</style>
