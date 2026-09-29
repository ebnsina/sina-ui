import { UploadError, type Send } from '#lib/ui/uploads.svelte.js';

/**
 * Stands in for your server in these examples: uploads at an uneven pace, and any file with
 * "damaged" in its name fails. In an app, use xhrSend('/your/upload/url').
 */
export const pretendSend: Send = (file, { onprogress, signal }) =>
	new Promise((resolve, reject) => {
		let done = 0;
		const timer = setInterval(() => {
			done = Math.min(1, done + 0.04 + Math.random() * 0.12);
			onprogress(done);
			if (file.name.includes('damaged') && done > 0.55) {
				clearInterval(timer);
				reject(new UploadError('The server couldn’t read this file. Try another copy.'));
			} else if (done >= 1) {
				clearInterval(timer);
				resolve();
			}
		}, 180);
		signal.addEventListener('abort', () => {
			clearInterval(timer);
			reject(new DOMException('Canceled', 'AbortError'));
		});
	});
