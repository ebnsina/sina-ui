import { flip } from 'svelte/animate';
import { cubicOut } from 'svelte/easing';
import { scale } from 'svelte/transition';

/** People who ask their system for less motion get none. */
export const reduced = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A duration, or 0 for reduced motion. */
export const ms = (n: number) => (reduced() ? 0 : n);

/** `animate:reflow`: list items glide to their new places as others come, go or move. */
export const reflow: typeof flip = (node, rects, { duration = 200, ...rest } = {}) =>
	flip(node, rects, { easing: cubicOut, ...rest, duration: ms(Number(duration)) });

/** `in:pop` / `out:pop`: an item joining or leaving a list grows in or shrinks away. */
export const pop: typeof scale = (node, { duration = 150, ...rest } = {}) =>
	scale(node, { start: 0.95, easing: cubicOut, ...rest, duration: ms(duration) });
