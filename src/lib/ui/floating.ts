import { reduced } from './motion';
import { spring } from './spring';

export type Side = 'top' | 'bottom' | 'left' | 'right';

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Positions a top-layer element (popover) beside its anchor. Prefers `side` and flips to the opposite
 * side when only that one fits; left/right drop below when neither fits. Above/below it aligns to the
 * anchor's start edge (or its end near the viewport edge; RTL mirrors both) or its centre; left/right
 * it centres vertically. Always stays 8px
 * inside the viewport. Sets transform-origin to the point facing the anchor so scale animations grow out
 * of it, and exposes that point as --anchor-x / --anchor-y plus data-side for arrows.
 * Returns the side used, or null once the anchor has scrolled off-screen.
 */
export function place(
	anchor: HTMLElement,
	el: HTMLElement,
	{
		side = 'bottom',
		align = 'start',
		gap = 6
	}: { side?: Side; align?: 'start' | 'center' | 'top'; gap?: number } = {}
): Side | null {
	const t = anchor.getBoundingClientRect();
	// Layout size, not getBoundingClientRect: an in-flight scale animation must not skew placement.
	const m = { width: el.offsetWidth, height: el.offsetHeight };
	const edge = 8;
	const vw = document.documentElement.clientWidth;
	const vh = innerHeight;
	if (t.bottom < 0 || t.top > vh || t.right < 0 || t.left > vw) return null;

	const room: Record<Side, number> = {
		top: t.top - gap - edge,
		bottom: vh - t.bottom - gap - edge,
		left: t.left - gap - edge,
		right: vw - t.right - gap - edge
	};
	const needed = side === 'top' || side === 'bottom' ? m.height : m.width;
	let s = needed > room[side] && room[opposite[side]] > room[side] ? opposite[side] : side;
	// Too wide for either side (a submenu on a phone): drop below its item, or above, rather than cover it.
	if ((s === 'left' || s === 'right') && m.width > room[s])
		s = room.bottom >= m.height || room.bottom >= room.top ? 'bottom' : 'top';
	const clamp = (n: number, max: number) => Math.min(Math.max(edge, n), max - edge);

	let x: number;
	let y: number;
	if (s === 'top' || s === 'bottom') {
		if (align === 'center') x = t.left + t.width / 2 - m.width / 2;
		else {
			const rtl = getComputedStyle(anchor).direction === 'rtl';
			const start = rtl ? t.right - m.width : t.left;
			const end = rtl ? t.left : t.right - m.width;
			const fits = (n: number) => n >= edge && n + m.width <= vw - edge;
			// Neither edge fits (a phone): centre on the anchor rather than pin to one side.
			x = fits(start) ? start : fits(end) ? end : t.left + t.width / 2 - m.width / 2;
		}
		y = s === 'top' ? t.top - gap - m.height : t.bottom + gap;
	} else {
		x = s === 'left' ? t.left - gap - m.width : t.right + gap;
		// top: its first row lines up with the anchor (a submenu beside its item); otherwise centred.
		y =
			align === 'top'
				? t.top - (parseFloat(getComputedStyle(el).paddingTop) || 0) - el.clientTop
				: t.top + t.height / 2 - m.height / 2;
	}
	x = clamp(x, vw - m.width);
	y = clamp(y, vh - m.height);
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;

	// Where the anchor's centre falls on the element: the scale origin, and where an arrow should point.
	const ax = Math.min(Math.max(0, t.left + t.width / 2 - x), m.width);
	const ay = Math.min(Math.max(0, t.top + t.height / 2 - y), m.height);
	const origin = {
		top: `${ax}px ${m.height}px`,
		bottom: `${ax}px 0`,
		left: `${m.width}px ${ay}px`,
		right: `0 ${ay}px`
	};
	el.style.transformOrigin = origin[s];
	el.style.setProperty('--anchor-x', `${ax}px`);
	el.style.setProperty('--anchor-y', `${ay}px`);
	el.dataset.side = s;
	return s;
}

type PlaceOptions = {
	side?: Side;
	align?: 'start' | 'center' | 'top';
	gap?: number;
	/** Grow out of the trigger's own shape (a container transform); false fades in beside it instead. */
	morph?: boolean;
};

const OPEN = spring(0.12);

/**
 * A reveal that starts as a small round blob where the trigger points from, and swells out to the
 * panel. Its corners stay generous while it grows, then settle to the panel's own.
 */
function morphFrom(a: HTMLElement, e: HTMLElement) {
	const t = a.getBoundingClientRect();
	const x = parseFloat(e.style.left);
	const y = parseFloat(e.style.top);
	const w = e.offsetWidth;
	const h = e.offsetHeight;
	const side = e.dataset.side ?? 'bottom';
	const blob = Math.min(32, w, h);
	const r = parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0;
	// Ends 40px beyond the panel, so its shadow isn't clipped; the panel's own corners take over there.
	const out = 40;
	const clamp = (n: number, max: number) => Math.min(Math.max(0, n), max);
	let top: number;
	let left: number;
	if (side === 'top' || side === 'bottom') {
		// Above or below: under the trigger's trailing end, where its chevron or icon sits.
		const rtl = getComputedStyle(a).direction === 'rtl';
		top = side === 'bottom' ? 0 : h - blob;
		left = clamp(rtl ? t.left - x : t.right - x - blob, w - blob);
	} else {
		// Beside it (a submenu): at the edge facing it, level with the trigger.
		left = side === 'right' ? 0 : w - blob;
		top = clamp(t.top + t.height / 2 - y - blob / 2, h - blob);
	}
	return {
		from: {
			clipPath: `inset(${top}px ${w - left - blob}px ${h - top - blob}px ${left}px round ${blob / 2}px)`,
			transform: 'none'
		},
		to: { clipPath: `inset(-${out}px round ${r + out}px)`, transform: 'none' }
	};
}

/**
 * Shows and hides a top-layer element beside its anchor: grows out of it (transform + opacity only, so it
 * stays smooth on a busy page), follows scroll/resize, and calls onDismiss for an outside press or when the
 * anchor leaves the screen. Closing plays the opening backwards, faster; reopening mid-close turns it around.
 */
export function anchored(
	anchor: () => HTMLElement,
	el: () => HTMLElement,
	onDismiss: () => void,
	options: PlaceOptions = {}
) {
	let anim: Animation | undefined;
	let contentAnims: Animation[] = [];
	let closing = false;
	let stop: (() => void) | undefined;

	return {
		/** Returns the side it opened on. */
		open(): Side {
			const a = anchor();
			const e = el();
			const reopening = anim?.playState === 'running' && closing;
			if (!e.matches(':popover-open')) e.showPopover();
			const side = place(a, e, options) ?? options.side ?? 'bottom';
			const reduce = reduced();
			if (reopening && anim) {
				// Turned around mid-close: it heads back out from wherever it is.
				anim.onfinish = null;
				anim.reverse();
				for (const c of contentAnims) c.reverse();
				closing = false;
			} else {
				anim?.cancel();
				for (const c of contentAnims) c.cancel();
				contentAnims = [];
				closing = false;
				if (reduce) {
					anim = e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'both' });
				} else if (options.morph !== false) {
					// Swells out of the corner by the trigger on a spring; the contents come into focus a beat later.
					const { from, to } = morphFrom(a, e);
					anim = e.animate(
						[
							{ ...from, opacity: 0 },
							{ opacity: 1, offset: 0.15 },
							{ ...to, opacity: 1 }
						],
						{ duration: 520, easing: OPEN, fill: 'both' }
					);
					contentAnims = [...e.children].map((c) =>
						c.animate(
							[
								{ opacity: 0, filter: 'blur(4px)' },
								{ opacity: 1, filter: 'blur(0)' }
							],
							{
								duration: 260,
								delay: 90,
								easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
								fill: 'both'
							}
						)
					);
				} else {
					// A 4px drift toward the anchor says where it came from.
					const drift = {
						top: 'translateY(4px)',
						bottom: 'translateY(-4px)',
						left: 'translateX(4px)',
						right: 'translateX(-4px)'
					}[side];
					anim = e.animate(
						[
							{ opacity: 0, transform: `${drift} scale(0.96)`, filter: 'blur(4px)' },
							{ opacity: 1, transform: 'none', filter: 'blur(0)' }
						],
						{ duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' }
					);
				}
			}

			stop?.();
			// Dismissed by a press that starts AND ends outside (React Aria's useInteractOutside): a touch
			// that turns into a scroll ends in pointercancel, not click, so scrolling the page never closes it.
			let pressedOutside = false;
			const down = (ev: PointerEvent) => {
				const t = ev.target as Node;
				pressedOutside = !e.contains(t) && !a.contains(t);
			};
			const outside = () => {
				if (!pressedOutside) return;
				pressedOutside = false;
				onDismiss();
				// Pressing empty page moved focus to <body>: put keyboard users back on the trigger.
				const f = document.activeElement;
				if (!f || f === document.body || e.contains(f)) a.focus({ preventScroll: true });
			};
			const follow = () => place(a, e, options) ?? onDismiss();
			document.addEventListener('pointerdown', down, true);
			document.addEventListener('click', outside, true);
			addEventListener('resize', follow);
			addEventListener('scroll', follow, true);
			// Content that changes size while open (a filtered list) is re-placed: above, it stays against the anchor.
			// Only re-places: it also fires once on observing, which must never close what just opened.
			const resized = new ResizeObserver(() => place(a, e, options));
			resized.observe(e);
			stop = () => {
				resized.disconnect();
				document.removeEventListener('pointerdown', down, true);
				document.removeEventListener('click', outside, true);
				removeEventListener('resize', follow);
				removeEventListener('scroll', follow, true);
			};
			return side;
		},
		/** instant: gone at once, no fade (a menu bar swapping one menu for the next). */
		close(instant = false) {
			stop?.();
			stop = undefined;
			const e = el();
			if (!e.matches(':popover-open')) return;
			if (instant || !anim) {
				anim?.cancel();
				for (const c of contentAnims) c.cancel();
				e.hidePopover();
				return;
			}
			// Mid-open: back the way it came. Settled: a quick, bounceless shrink into the trigger
			// (the spring's overshoot, played backwards, would wobble on the way out).
			closing = true;
			const hide = () => {
				closing = false;
				e.hidePopover();
			};
			if (anim.playState === 'running') {
				anim.onfinish = hide;
				anim.reverse();
				anim.updatePlaybackRate(-1.6);
			} else {
				const done = (anim.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
				anim.cancel();
				anim = e.animate(
					[...done].reverse().map(({ offset, computedOffset, ...k }) => k),
					{
						duration: 200,
						easing: 'cubic-bezier(0.4, 0, 1, 1)',
						fill: 'both'
					}
				);
				anim.onfinish = hide;
			}
			for (const c of contentAnims) {
				c.reverse();
				c.updatePlaybackRate(-2.5);
			}
		},
		/** Unmounting mid-close: cancel, so the finish callback never touches a removed element. */
		destroy() {
			stop?.();
			anim?.cancel();
		}
	};
}
