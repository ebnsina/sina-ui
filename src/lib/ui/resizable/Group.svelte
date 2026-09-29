<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import { setGroup, type PanelDef } from './context';
	import { load, save as store } from '../stored';

	interface Props {
		orientation?: 'horizontal' | 'vertical';
		/** Remember the layout in this browser under this key. */
		persist?: string;
		/** Resizable.Panel, with a Resizable.Handle between each pair. */
		children: Snippet;
		class?: string;
	}

	let { orientation = 'horizontal', persist, children, class: className }: Props = $props();

	let panels = $state.raw<PanelDef[]>([]);
	let sizes = $state<Record<string, number>>({});
	// Where a collapsed panel was, so Enter can put it back.
	const before: Record<string, number> = {};
	const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

	/** The starting layout: given sizes, and the rest shared evenly. */
	function defaults() {
		const given = panels.reduce((sum, p) => sum + (p.defaultSize ?? 0), 0);
		const rest = panels.filter((p) => p.defaultSize === undefined).length;
		return Object.fromEntries(
			panels.map((p) => [p.id, p.defaultSize ?? (rest ? (100 - given) / rest : 0)])
		);
	}

	function save() {
		if (persist)
			store(
				persist,
				panels.map((p) => sizes[p.id])
			);
	}

	onMount(() => {
		const saved = persist && load<number[] | null>(persist, null);
		if (Array.isArray(saved) && saved.length === panels.length)
			panels.forEach((p, i) => (sizes[p.id] = saved[i]));
	});

	setGroup({
		get orientation() {
			return orientation;
		},
		register: (panel) =>
			untrack(() => {
				panels = [...panels, panel];
				Object.assign(sizes, defaults());
				return () => {
					panels = panels.filter((p) => p !== panel);
					delete sizes[panel.id];
				};
			}),
		size: (id) => sizes[id] ?? 0,
		panel: (id) => panels.find((p) => p.id === id),
		move(a, b, delta, snap = false) {
			const pa = panels.find((p) => p.id === a);
			const pb = panels.find((p) => p.id === b);
			if (!pa || !pb) return;
			const total = sizes[a] + sizes[b];
			let next = clamp(sizes[a] + delta, 0, total);
			// Dragged well under its minimum, a collapsible panel snaps shut; otherwise it stops there.
			next = snap && pa.collapsible && next < pa.min / 2 ? 0 : clamp(next, pa.min, pa.max);
			next = total - clamp(total - next, pb.min, pb.max);
			if (next !== 0 && next < pa.min) return;
			sizes[a] = next;
			sizes[b] = total - next;
			save();
		},
		toggle(a, b) {
			const pa = panels.find((p) => p.id === a);
			if (!pa?.collapsible) return;
			const total = sizes[a] + sizes[b];
			if (sizes[a] > 0) {
				before[a] = sizes[a];
				sizes[a] = 0;
				sizes[b] = total;
			} else {
				const back = before[a] ?? defaults()[a];
				sizes[a] = back;
				sizes[b] = total - back;
			}
			save();
		},
		reset(a, b) {
			const d = defaults();
			const total = sizes[a] + sizes[b];
			sizes[a] = (d[a] / (d[a] + d[b])) * total;
			sizes[b] = total - sizes[a];
			save();
		}
	});
</script>

<div class={['group', orientation, className]} data-orientation={orientation}>
	{@render children()}
</div>

<style>
	.group {
		display: flex;
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		overflow: hidden;
	}
	.vertical {
		flex-direction: column;
	}
</style>
