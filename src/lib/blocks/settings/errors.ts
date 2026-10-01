// Your API throws an Error with a `code`; people read one of these instead of raw server text.
const messages: Record<string, string> = {
	network: 'Couldn’t reach the server. Check your connection and try again.',
	username_taken: 'That username is taken. Try another.',
	wrong_password: 'That isn’t your current password.',
	invalid_code: 'That code didn’t work. Check the app and try the newest code.',
	too_large: 'That photo is too large. Choose one under 2 MB.',
	not_image: 'That file isn’t an image. Choose a JPEG, PNG or WebP.'
};

/** A plain sentence for anything thrown by a save. */
export function messageOf(error: unknown): string {
	const code = (error as { code?: string } | null)?.code;
	return (code && messages[code]) || 'Something went wrong. Try again.';
}
