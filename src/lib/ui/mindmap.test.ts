import { describe, expect, it } from 'vitest';
import {
	countBelow,
	layout,
	reparent,
	remove,
	addChild,
	toOutline,
	toJSON,
	type MindNode,
	type Placed
} from './mindmap';

const leaf = (id: string): MindNode => ({ id, label: id });
const branch = (id: string, n: number): MindNode => ({
	id,
	label: id,
	children: Array.from({ length: n }, (_, i) => leaf(`${id}${i}`))
});
const map: MindNode = {
	id: 'root',
	label: 'House of Wisdom',
	children: [branch('a', 4), branch('b', 1), branch('c', 2), branch('d', 3)]
};
const size = (id: string) => ({ w: 100, h: id === 'root' ? 48 : 30 });

const overlaps = (a: Placed, b: Placed) =>
	Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;

describe('mind map layout', () => {
	it('splits first-level branches into two sides of similar height', () => {
		const out = layout(map, size);
		const side = (id: string) => out.get(id)!.side;
		expect([side('a'), side('b')]).toEqual([1, 1]);
		expect([side('c'), side('d')]).toEqual([-1, -1]);
	});

	it('keeps every branch on its side when one is closed', () => {
		const closed = {
			...map,
			children: [{ ...branch('a', 4), collapsed: true }, ...map.children!.slice(1)]
		};
		const out = layout(closed, size);
		expect(['a', 'b', 'c', 'd'].map((id) => out.get(id)!.side)).toEqual([1, 1, -1, -1]);
	});

	it('puts everything on the right when asked', () => {
		const out = layout(map, size, 'right');
		expect([...out.values()].filter((p) => p.depth > 0).every((p) => p.side === 1)).toBe(true);
	});

	it('never overlaps two nodes and keeps siblings in order with a gap', () => {
		const all = [...layout(map, size).values()];
		for (const a of all) for (const b of all) if (a !== b) expect(overlaps(a, b)).toBe(false);
		const kids = map.children![0].children!.map((c) => layout(map, size).get(c.id)!);
		for (let i = 1; i < kids.length; i++)
			expect(kids[i].y - kids[i - 1].y).toBeGreaterThanOrEqual(30);
	});

	it('uses measured heights: a tall node pushes its siblings apart', () => {
		const tall = (id: string) => ({ w: 100, h: id === 'a1' ? 90 : 30 });
		const out = layout(map, tall);
		expect(out.get('a2')!.y - out.get('a1')!.y).toBeGreaterThanOrEqual(60);
	});

	it('hides what is under a collapsed node but still counts it', () => {
		const closed = { ...map, children: [{ ...branch('a', 4), collapsed: true }] };
		const out = layout(closed, size);
		expect(out.has('a0')).toBe(false);
		expect(countBelow(closed)).toBe(5);
	});
});

describe('mind map edits', () => {
	it('refuses to move a branch into itself', () => {
		expect(reparent(map, 'a', 'a2')).toBeNull();
		expect(reparent(map, 'a', 'a')).toBeNull();
		expect(reparent(map, 'root', 'b')).toBeNull();
	});

	it('moves a branch under another node without touching the original', () => {
		const next = reparent(map, 'b', 'a0')!;
		expect(next.children!.map((c) => c.id)).toEqual(['a', 'c', 'd']);
		expect(next.children![0].children![0].children![0].id).toBe('b');
		expect(map.children!.length).toBe(4);
	});

	it('adds and removes', () => {
		const next = addChild(map, 'b', leaf('new'), 0);
		expect(next.children![1].children!.map((c) => c.id)).toEqual(['new', 'b0']);
		expect(remove(next, 'b').children!.map((c) => c.id)).toEqual(['a', 'c', 'd']);
	});

	it('exports an outline and JSON', () => {
		const small: MindNode = {
			id: 'r',
			label: 'Root',
			children: [{ id: 'x', label: 'X', children: [leaf('y')] }]
		};
		expect(toOutline(small)).toBe('- Root\n  - X\n    - y');
		expect(JSON.parse(toJSON(small))).toEqual(small);
	});
});
