import { SvelteSet } from 'svelte/reactivity';

type Modifiers = { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean };

/**
 * Choosing items as file managers do: click picks one, ⌘/Ctrl-click adds or removes one, Shift-click
 * picks the run from the last one clicked. `list` gives every item in on-screen order.
 */
export function createSelection<T>(list: () => T[], key: (item: T) => string) {
	const ids = new SvelteSet<string>();
	let anchor: string | undefined;

	return {
		has: (item: T) => ids.has(key(item)),
		get size() {
			return ids.size;
		},
		/** The chosen items, in list order. */
		get items() {
			return list().filter((i) => ids.has(key(i)));
		},
		/** A click or key on `item`, with the event's modifier keys. */
		choose(item: T, { shiftKey, metaKey, ctrlKey }: Modifiers = {}) {
			const all = list().map(key);
			const a = anchor === undefined ? -1 : all.indexOf(anchor);
			const b = all.indexOf(key(item));
			const add = metaKey || ctrlKey;
			if (shiftKey && a >= 0 && b >= 0) {
				if (!add) ids.clear();
				for (const id of all.slice(Math.min(a, b), Math.max(a, b) + 1)) ids.add(id);
				return;
			}
			if (!add) ids.clear();
			if (add && ids.has(key(item))) ids.delete(key(item));
			else ids.add(key(item));
			anchor = key(item);
		},
		toggle(item: T) {
			const id = key(item);
			if (ids.has(id)) ids.delete(id);
			else ids.add(id);
			anchor = id;
		},
		all() {
			for (const i of list()) ids.add(key(i));
		},
		clear() {
			ids.clear();
		}
	};
}

export type Selection<T> = ReturnType<typeof createSelection<T>>;
