import { describe, expect, it } from 'vitest';
import { flag, guessCountry, matches } from './phone';

describe('phone helpers', () => {
	it('builds a flag from an ISO code', () => {
		expect(flag('BD')).toBe('🇧🇩');
		expect(flag('tr')).toBe('🇹🇷');
	});
	it('guesses the country from the language tag, with a fallback', () => {
		const known = ['BD', 'GB', 'US', 'MY'];
		expect(guessCountry('en-GB', known)).toBe('GB');
		expect(guessCountry('bn', known)).toBe('BD');
		expect(guessCountry('xx-ZZ', known)).toBe('US');
		expect(guessCountry(undefined, known, 'MY')).toBe('MY');
	});
	it('matches by name, ISO code or calling code', () => {
		const bd = { iso: 'BD', name: 'Bangladesh', code: '880' };
		const ci = { iso: 'CI', name: 'Côte d’Ivoire', code: '225' };
		expect(matches(bd, 'bangla')).toBe(true);
		expect(matches(bd, 'bd')).toBe(true);
		expect(matches(bd, '+88')).toBe(true);
		expect(matches(bd, '44')).toBe(false);
		expect(matches(ci, 'cote')).toBe(true);
		expect(matches(bd, '  ')).toBe(true);
	});
});
