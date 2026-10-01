import type { ImageGenerationResult, TranscriptionResult, TTSResult } from '@tanstack/ai';
import type {
	ImageGenerateInput,
	SpeechGenerateInput,
	TranscriptionGenerateInput,
	VideoGenerateInput,
	VideoGenerateResult
} from '@tanstack/ai-svelte';

// Stand-ins for the endpoints so the demos run without a key. Each takes as long as a real
// request might and honors Stop. Images and video are geometric star patterns drawn from the
// prompt; the voice is a short melody, since only a real model can speak.

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((done, fail) => {
		const t = setTimeout(done, ms);
		signal?.addEventListener(
			'abort',
			() => (clearTimeout(t), fail(new DOMException('Stopped', 'AbortError')))
		);
	});

// The same prompt always gives the same colors.
function hues(text: string) {
	let h = 0;
	for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 360;
	return [h, (h + 40) % 360, (h + 180) % 360];
}

// An eight-pointed star: two squares, one turned 45°.
function star(cx: number, cy: number, r: number) {
	const pts: string[] = [];
	for (let i = 0; i < 16; i++) {
		const a = (Math.PI / 8) * i;
		const d = i % 2 ? r * 0.72 : r;
		pts.push(`${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`);
	}
	return pts.join(' ');
}

function pattern(prompt: string, w: number, h: number, seed: number) {
	// Each image in a set gets its own palette.
	const [a, b, c] = hues(prompt).map((x) => (x + seed * 67) % 360);
	const cell = 120;
	let tiles = '';
	for (let y = 0; y <= h + cell; y += cell)
		for (let x = 0; x <= w + cell; x += cell) {
			tiles += `<polygon points="${star(x, y, 52)}" fill="hsl(${b} 55% 42%)"/>`;
			tiles += `<polygon points="${star(x, y, 26)}" fill="hsl(${c} 60% 86%)"/>`;
			tiles += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="12" fill="hsl(${c} 45% 70%)"/>`;
		}
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="hsl(${a} 45% 22%)"/>${tiles}</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function demoImages(
	input: ImageGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<ImageGenerationResult> {
	await wait(1800, o?.signal);
	const [w, h] = (input.size ?? '1024x1024').split('x').map((n) => Number(n) / 2);
	const prompt = String(input.prompt);
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		images: Array.from({ length: input.numberOfImages ?? 1 }, (_, i) => ({
			url: pattern(prompt, w, h, i)
		}))
	};
}

// A plucked-string melody (Karplus–Strong), longer for longer text, as a WAV.
function melody(seconds: number) {
	const rate = 22050;
	const samples = new Float32Array(Math.floor(rate * seconds));
	const notes = [293.66, 329.63, 349.23, 392, 440, 392, 349.23, 329.63];
	const step = Math.floor(rate * 0.35);
	for (let n = 0; n * step < samples.length; n++) {
		const period = Math.round(rate / notes[n % notes.length]);
		const buf = Float32Array.from({ length: period }, () => Math.random() * 2 - 1);
		for (let i = 0; i < rate * 1.2 && n * step + i < samples.length; i++) {
			const j = i % period;
			buf[j] = 0.996 * 0.5 * (buf[j] + buf[(j + 1) % period]);
			samples[n * step + i] += buf[j] * 0.3;
		}
	}
	const data = new DataView(new ArrayBuffer(44 + samples.length * 2));
	const text = (at: number, s: string) =>
		[...s].forEach((c, i) => data.setUint8(at + i, c.charCodeAt(0)));
	text(0, 'RIFF');
	data.setUint32(4, 36 + samples.length * 2, true);
	text(8, 'WAVEfmt ');
	data.setUint32(16, 16, true);
	data.setUint16(20, 1, true);
	data.setUint16(22, 1, true);
	data.setUint32(24, rate, true);
	data.setUint32(28, rate * 2, true);
	data.setUint16(32, 2, true);
	data.setUint16(34, 16, true);
	text(36, 'data');
	data.setUint32(40, samples.length * 2, true);
	samples.forEach((v, i) => data.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true));
	let binary = '';
	const bytes = new Uint8Array(data.buffer);
	for (let i = 0; i < bytes.length; i += 0x8000)
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(binary);
}

export async function demoSpeech(
	input: SpeechGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<TTSResult> {
	await wait(1200, o?.signal);
	const duration = Math.min(8, Math.max(3, (input.text ?? '').length * 0.05));
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		audio: melody(duration),
		format: 'wav',
		duration
	};
}

export async function demoTranscribe(
	_input: TranscriptionGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<TranscriptionResult> {
	await wait(1500, o?.signal);
	return {
		id: crypto.randomUUID(),
		model: 'demo',
		language: 'en',
		text: 'This demo returns the same line whatever you record: "The House of Wisdom kept its doors open to scholars from every land." Connected to a transcription model, your own words appear here.'
	};
}

// Records a few seconds of a turning star pattern from a canvas, as a real video file.
export async function demoVideo(
	input: VideoGenerateInput,
	o?: { signal?: AbortSignal }
): Promise<VideoGenerateResult> {
	const canvas = Object.assign(document.createElement('canvas'), { width: 640, height: 360 });
	const g = canvas.getContext('2d')!;
	const [a, b, c] = hues(String(input.prompt));
	const type = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((t) =>
		MediaRecorder.isTypeSupported(t)
	);
	const recorder = new MediaRecorder(canvas.captureStream(30), type ? { mimeType: type } : {});
	const chunks: Blob[] = [];
	recorder.ondataavailable = (e) => chunks.push(e.data);
	const start = performance.now();
	let raf = 0;
	const draw = (t: number) => {
		const s = (t - start) / 1000;
		g.fillStyle = `hsl(${a} 45% 22%)`;
		g.fillRect(0, 0, 640, 360);
		for (let y = 0; y <= 480; y += 120)
			for (let x = 0; x <= 760; x += 120) {
				g.save();
				g.translate(x - ((s * 30) % 120), y);
				g.rotate(s * 0.4);
				for (const [r, fill] of [
					[52, `hsl(${b} 55% 42%)`],
					[26, `hsl(${c} 60% 86%)`]
				] as const) {
					g.beginPath();
					for (let i = 0; i < 16; i++) {
						const ang = (Math.PI / 8) * i;
						const d = i % 2 ? r * 0.72 : r;
						g.lineTo(d * Math.cos(ang), d * Math.sin(ang));
					}
					g.fillStyle = fill;
					g.fill();
				}
				g.restore();
			}
		raf = requestAnimationFrame(draw);
	};
	raf = requestAnimationFrame(draw);
	recorder.start();
	try {
		await wait((input.duration ?? 4) * 1000, o?.signal);
	} finally {
		cancelAnimationFrame(raf);
		const stopped = new Promise((done) => (recorder.onstop = done));
		recorder.stop();
		await stopped;
	}
	const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
	return { jobId: crypto.randomUUID(), status: 'completed', url };
}
