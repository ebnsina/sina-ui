import { describe, expect, it } from 'vitest';
import { clock } from './Video.svelte';

describe('clock', () => {
	it('shows minutes and seconds, hours only when needed', () => {
		expect(clock(0)).toBe('0:00');
		expect(clock(75.9)).toBe('1:15');
		expect(clock(3725)).toBe('1:02:05');
		expect(clock(NaN)).toBe('0:00');
		expect(clock(Infinity)).toBe('0:00');
	});
});
