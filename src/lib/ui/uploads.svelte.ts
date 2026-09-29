export type UploadStatus = 'uploading' | 'done' | 'failed' | 'canceled';

export interface Upload {
	id: number;
	file: File;
	/** 0 to 1. */
	progress: number;
	status: UploadStatus;
	/** Plain-language reason, shown when it failed. */
	error?: string;
}

/** Sends one file; report progress (0–1) and stop when the signal aborts. */
export type Send = (
	file: File,
	options: { onprogress: (fraction: number) => void; signal: AbortSignal }
) => Promise<void>;

/** Throw this from send with wording people should see; any other error shows a generic message. */
export class UploadError extends Error {}

/**
 * A queue of uploads with progress, cancel, retry and remove. Every file starts as soon as it's
 * added; the list is reactive state for UploadList and UploadTray to show.
 */
export function createUploads(send: Send) {
	const items = $state<Upload[]>([]);
	const controllers = new Map<number, AbortController>();
	let nextId = 0;

	async function start(upload: Upload) {
		const controller = new AbortController();
		controllers.set(upload.id, controller);
		Object.assign(upload, { status: 'uploading', progress: 0, error: undefined });
		try {
			await send(upload.file, {
				onprogress: (p) => (upload.progress = Math.min(1, Math.max(0, p))),
				signal: controller.signal
			});
			Object.assign(upload, { status: 'done', progress: 1 });
		} catch (e) {
			if (controller.signal.aborted) upload.status = 'canceled';
			else {
				upload.status = 'failed';
				// Never the raw server error: that's for logs, not people.
				upload.error =
					e instanceof UploadError
						? e.message
						: "Couldn't upload. Check your connection and try again.";
			}
		} finally {
			controllers.delete(upload.id);
		}
	}

	const find = (id: number) => items.find((u) => u.id === id);

	return {
		get items() {
			return items;
		},
		/** Uploads still running. */
		get active() {
			return items.filter((u) => u.status === 'uploading').length;
		},
		/** Overall progress of everything that isn't canceled, 0 to 1. */
		get progress() {
			const counted = items.filter((u) => u.status !== 'canceled');
			const total = counted.reduce((sum, u) => sum + u.file.size, 0);
			return total ? counted.reduce((sum, u) => sum + u.progress * u.file.size, 0) / total : 0;
		},
		add(files: Iterable<File>) {
			for (const file of files) {
				items.push({ id: nextId++, file, progress: 0, status: 'uploading' });
				// The pushed object is now reactive state; start from that proxy, not the plain object.
				start(items[items.length - 1]);
			}
		},
		cancel: (id: number) => controllers.get(id)?.abort(),
		retry(id: number) {
			const upload = find(id);
			if (upload && upload.status !== 'uploading') start(upload);
		},
		remove(id: number) {
			controllers.get(id)?.abort();
			const at = items.findIndex((u) => u.id === id);
			if (at >= 0) items.splice(at, 1);
		},
		/** Removes everything that has finished, failed or been canceled. */
		clear() {
			for (let i = items.length - 1; i >= 0; i--)
				if (items[i].status !== 'uploading') items.splice(i, 1);
		}
	};
}

export type Uploads = ReturnType<typeof createUploads>;

/**
 * A ready-made send: POSTs the file as form data. XMLHttpRequest, not fetch, because it's the one
 * that reports upload progress in every browser.
 */
export function xhrSend(url: string, field = 'file'): Send {
	return (file, { onprogress, signal }) =>
		new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const body = new FormData();
			body.append(field, file);
			xhr.upload.onprogress = (e) => e.lengthComputable && onprogress(e.loaded / e.total);
			xhr.onload = () =>
				xhr.status >= 200 && xhr.status < 300
					? resolve()
					: reject(new Error(`Upload failed with status ${xhr.status}`));
			xhr.onerror = () => reject(new Error('Network error'));
			signal.addEventListener('abort', () => {
				xhr.abort();
				reject(new DOMException('Canceled', 'AbortError'));
			});
			xhr.open('POST', url);
			xhr.send(body);
		});
}
