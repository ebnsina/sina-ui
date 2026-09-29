import { createContext } from 'svelte';

export type At = 'first' | 'last' | 'menu';

export interface MenubarEntry {
	button(): HTMLElement;
	menu(): HTMLElement | null;
	isOpen(): boolean;
	setOpen(open: boolean): void;
	/** Closes at once, no fade: the next menu is already opening. */
	closeNow(): void;
	show(at: At): void;
}

export const [getMenubar, setMenubar] = createContext<{
	register(entry: MenubarEntry): () => void;
	isTabStop(entry: MenubarEntry): boolean;
	anyOpen(): boolean;
	opened(entry: MenubarEntry): void;
	move(from: MenubarEntry, to: number | 'first' | 'last'): void;
}>();
