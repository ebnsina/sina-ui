/** A country's flag emoji from its ISO code: "BD" becomes 🇧🇩 (two regional-indicator letters). */
export const flag = (iso: string) =>
	String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

/** The region in a language tag ("en-GB" → "GB"), if it names one we know; otherwise the fallback. */
export function guessCountry(lang: string | undefined, known: readonly string[], fallback = 'US') {
	try {
		const region = lang ? new Intl.Locale(lang).maximize().region : undefined;
		return region && known.includes(region) ? region : fallback;
	} catch {
		return fallback;
	}
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Whether a country matches a search by name ("cote" finds Côte d'Ivoire), ISO code or calling code. */
export function matches(c: { iso: string; name: string; code: string }, query: string) {
	const q = fold(query.trim());
	if (!q) return true;
	if (/^\+?\d+$/.test(q)) return c.code.startsWith(q.replace('+', ''));
	return fold(c.name).includes(q) || c.iso.toLowerCase() === q;
}
