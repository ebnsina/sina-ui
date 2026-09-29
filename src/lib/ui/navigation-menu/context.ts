import { createContext } from 'svelte';

export const [getNavMenu, setNavMenu] = createContext<{
	/** The open panel's item, or undefined. */
	readonly open: string | undefined;
	/** Which way the panel content slides in: from the side of the item left behind. */
	readonly from: -1 | 0 | 1;
	openNow(id: string): void;
	openSoon(id: string): void;
	toggle(id: string): void;
	close(focusTrigger?: boolean): void;
}>();
