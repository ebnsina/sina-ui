import type { Home01Icon } from '@hugeicons/core-free-icons';

export type MindNode = {
	id: string;
	label: string;
	children?: MindNode[];
	collapsed?: boolean;
	color?: string;
	/** Any icon from @hugeicons/core-free-icons. */
	icon?: typeof Home01Icon;
	note?: string;
};

export type Size = { w: number; h: number };
export type Placed = {
	node: MindNode;
	parent?: string;
	/** Center of the node, in map units; the root sits at 0, 0. */
	x: number;
	y: number;
	w: number;
	h: number;
	depth: number;
	/** -1 left of the root, 1 right, 0 the root itself. */
	side: -1 | 0 | 1;
	/** Which first-level branch it belongs to (its color); -1 for the root. */
	branch: number;
};

const GAP_X = 56;
const GAP_Y = 14;

/** Children that are drawn: none while a node is collapsed. */
export const shownChildren = (n: MindNode) => (n.collapsed ? [] : (n.children ?? []));

/** Everything below a node, collapsed or not (for the "+N" on a closed branch). */
export const countBelow = (n: MindNode): number =>
	(n.children ?? []).reduce((sum, c) => sum + 1 + countBelow(c), 0);

/**
 * Lays the map out: the root in the middle, first-level branches split left and right so the two
 * sides hold about as many topics (or all to the right), each subtree stacked by its measured
 * height so siblings' subtrees never overlap.
 */
export function layout(
	root: MindNode,
	size: (id: string) => Size,
	sides: 'both' | 'right' = 'both'
): Map<string, Placed> {
	const height = new Map<string, number>();
	const measure = (n: MindNode): number => {
		const kids = shownChildren(n);
		const own = size(n.id).h;
		const stack = kids.reduce((s, c) => s + measure(c), 0) + GAP_Y * Math.max(0, kids.length - 1);
		const h = Math.max(own, stack);
		height.set(n.id, h);
		return h;
	};
	measure(root);

	const out = new Map<string, Placed>();
	const r = size(root.id);
	out.set(root.id, { node: root, x: 0, y: 0, ...r, depth: 0, side: 0, branch: -1 });

	const place = (
		kids: MindNode[],
		parent: Placed,
		side: -1 | 1,
		branchOf: (i: number) => number
	) => {
		const total =
			kids.reduce((s, c) => s + height.get(c.id)!, 0) + GAP_Y * Math.max(0, kids.length - 1);
		let top = parent.y - total / 2;
		kids.forEach((c, i) => {
			const h = height.get(c.id)!;
			const s = size(c.id);
			const p: Placed = {
				node: c,
				parent: parent.node.id,
				x: parent.x + side * (parent.w / 2 + GAP_X + s.w / 2),
				y: top + h / 2,
				...s,
				depth: parent.depth + 1,
				side,
				branch: branchOf(i)
			};
			out.set(c.id, p);
			place(shownChildren(c), p, side, () => p.branch);
			top += h + GAP_Y;
		});
	};

	const first = shownChildren(root);
	// Split by everything in each branch, closed or not, so closing one never flips a branch's side.
	let split = first.length;
	if (sides === 'both' && first.length > 1) {
		const hs = first.map((c) => 1 + countBelow(c));
		const all = hs.reduce((a, b) => a + b, 0);
		let best = Infinity;
		let acc = 0;
		for (let k = 1; k < hs.length; k++) {
			acc += hs[k - 1];
			const diff = Math.abs(acc - (all - acc));
			if (diff < best) {
				best = diff;
				split = k;
			}
		}
	}
	const rootPlaced = out.get(root.id)!;
	place(first.slice(0, split), rootPlaced, 1, (i) => i);
	place(first.slice(split), rootPlaced, -1, (i) => split + i);
	return out;
}

/** A smooth curve from a parent's edge to a child's edge. */
export function edge(from: Placed, to: Placed) {
	const x1 = from.x + to.side * (from.w / 2);
	const x2 = to.x - to.side * (to.w / 2);
	const mx = (x1 + x2) / 2;
	return `M${x1} ${from.y} C${mx} ${from.y} ${mx} ${to.y} ${x2} ${to.y}`;
}

export function find(root: MindNode, id: string): MindNode | undefined {
	if (root.id === id) return root;
	for (const c of root.children ?? []) {
		const hit = find(c, id);
		if (hit) return hit;
	}
}

export function parentOf(root: MindNode, id: string): MindNode | undefined {
	for (const c of root.children ?? []) {
		if (c.id === id) return root;
		const hit = parentOf(c, id);
		if (hit) return hit;
	}
}

/** Whether `id` is `ancestor` itself or somewhere below it. */
export const within = (ancestor: MindNode, id: string): boolean => !!find(ancestor, id);

// Edits return a new tree (the old one is kept for undo).
const map = (n: MindNode, fn: (n: MindNode) => MindNode): MindNode => {
	const m = fn(n);
	return m.children ? { ...m, children: m.children.map((c) => map(c, fn)) } : m;
};

export const update = (root: MindNode, id: string, patch: Partial<MindNode>) =>
	map(root, (n) => (n.id === id ? { ...n, ...patch } : n));

export const addChild = (root: MindNode, parentId: string, child: MindNode, at?: number) =>
	map(root, (n) => {
		if (n.id !== parentId) return n;
		const kids = [...(n.children ?? [])];
		kids.splice(at ?? kids.length, 0, child);
		return { ...n, collapsed: false, children: kids };
	});

export const remove = (root: MindNode, id: string) =>
	map(root, (n) =>
		n.children?.some((c) => c.id === id)
			? { ...n, children: n.children.filter((c) => c.id !== id) }
			: n
	);

/** Moves a branch under another node; refused (null) when the target is inside the branch. */
export function reparent(root: MindNode, id: string, to: string): MindNode | null {
	const branch = find(root, id);
	if (!branch || id === root.id || within(branch, to)) return null;
	return addChild(remove(root, id), to, branch);
}

/** The map as indented text, for copying into notes. */
export const toOutline = (n: MindNode, depth = 0): string =>
	[
		`${'  '.repeat(depth)}- ${n.label}`,
		...(n.children ?? []).map((c) => toOutline(c, depth + 1))
	].join('\n');

export const toJSON = (n: MindNode) =>
	JSON.stringify(n, (k, v) => (k === 'icon' ? undefined : v), 2);
