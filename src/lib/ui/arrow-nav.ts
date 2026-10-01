/**
 * Where an arrow, Home or End key goes among `all`, as they're laid out on screen: ← → step through
 * them in order (swapped right to left), ↑ ↓ to the nearest in the row above or below. `null` for
 * any other key; `undefined` at an edge.
 */
export function arrowTarget(key: string, from: HTMLElement, all: HTMLElement[]) {
	const at = all.indexOf(from);
	const rtl = getComputedStyle(from).direction === 'rtl';
	if (key === 'ArrowRight' || key === 'ArrowLeft')
		return all[at + ((key === 'ArrowRight') !== rtl ? 1 : -1)];
	if (key === 'Home') return all[0];
	if (key === 'End') return all.at(-1);
	if (key !== 'ArrowDown' && key !== 'ArrowUp') return null;

	const down = key === 'ArrowDown';
	const r = from.getBoundingClientRect();
	const x = r.left + r.width / 2;
	let best: HTMLElement | undefined;
	let score = Infinity;
	for (const el of all) {
		const b = el.getBoundingClientRect();
		const dy = down ? b.top - r.bottom : r.top - b.bottom;
		if (dy < -2) continue;
		// The next row first, then the closest across it.
		const s = Math.round(dy) * 1e4 + Math.abs(b.left + b.width / 2 - x);
		if (s < score) {
			score = s;
			best = el;
		}
	}
	return best;
}
