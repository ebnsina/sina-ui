import { createContext } from 'svelte';

export interface PanelDef {
	id: string;
	/** Percent of the group; the rest is shared between panels without one. */
	defaultSize?: number;
	min: number;
	max: number;
	collapsible: boolean;
}

export const [getGroup, setGroup] = createContext<{
	readonly orientation: 'horizontal' | 'vertical';
	register(panel: PanelDef): () => void;
	size(id: string): number;
	panel(id: string): PanelDef | undefined;
	/** Moves the boundary between two neighbouring panels by delta percent; snap lets a drag shut a panel. */
	move(before: string, after: string, delta: number, snap?: boolean): void;
	/** Collapses the panel, or restores it to where it was. */
	toggle(before: string, after: string): void;
	reset(before: string, after: string): void;
}>();
