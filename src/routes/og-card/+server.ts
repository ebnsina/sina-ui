import type { RequestHandler } from './$types';

// Reads its title from the query string, so it only runs on the dev server (for scripts/og.ts).
export const prerender = false;

// The social preview card, 1200 by 630, as a standalone page (none of the docs around it):
// scripts/og.ts photographs it for each page.
const escape = (s: string) =>
	s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const GET: RequestHandler = ({ url }) => {
	const title = escape(url.searchParams.get('title') ?? 'Sina UI');
	const section = escape(url.searchParams.get('section') ?? '');
	const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<style>
	@font-face { font-family: Plex; src: url(/fonts/plex/IBMPlexSans-SemiBold-Latin1.woff2) format('woff2'); font-weight: 600; }
	@font-face { font-family: Plex; src: url(/fonts/plex/IBMPlexSans-Regular-Latin1.woff2) format('woff2'); font-weight: 400; }
	body { margin: 0; }
	.card { position: relative; display: grid; grid-template-rows: auto 1fr auto; box-sizing: border-box;
		width: 1200px; height: 630px; padding: 72px 80px; overflow: hidden; background: #fff; color: #0f172a;
		font-family: Plex, system-ui, sans-serif; }
	.pattern { position: absolute; top: -40px; right: -120px; width: 620px; color: #047857; opacity: .14;
		mask-image: linear-gradient(to left, #000 40%, transparent); }
	.brand { margin: 0; font-size: 34px; font-weight: 600; }
	.mark { color: #047857; }
	.words { align-self: center; max-width: 820px; }
	.section { margin: 0 0 12px; color: #047857; font-size: 30px; font-weight: 600; }
	h1 { margin: 0; font-size: 96px; line-height: 1.05; letter-spacing: -0.03em; text-wrap: balance; font-weight: 600; }
	.tagline { margin: 0; color: #475569; font-size: 28px; }
</style></head>
<body><div class="card">
	<svg class="pattern" viewBox="0 0 240 240" aria-hidden="true"><defs>
		<pattern id="s" width="60" height="60" patternUnits="userSpaceOnUse">
			<polygon points="30,6 36,20 51,15 46,30 51,45 36,40 30,54 24,40 9,45 14,30 9,15 24,20"
				fill="none" stroke="currentColor" stroke-width="1.2"/></pattern></defs>
		<rect width="240" height="240" fill="url(#s)"/></svg>
	<p class="brand"><span class="mark">✦</span> Sina UI</p>
	<div class="words">${section ? `<p class="section">${section}</p>` : ''}<h1>${title}</h1></div>
	<p class="tagline">Accessible Svelte components that feel finished</p>
</div></body></html>`;
	return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
