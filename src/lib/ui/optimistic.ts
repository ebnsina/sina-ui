/**
 * Shows a change at once, then saves it. If saving fails the change is put back and `false` is
 * returned, so the caller can say so.
 */
export async function optimistic(
	apply: () => void,
	save: (() => unknown) | undefined,
	revert: () => void
) {
	apply();
	try {
		await save?.();
		return true;
	} catch {
		revert();
		return false;
	}
}
