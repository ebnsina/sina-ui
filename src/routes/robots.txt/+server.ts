import type { RequestHandler } from './$types';

// Rendered on request, so the sitemap line carries the address the site is actually served at.
export const GET: RequestHandler = ({ url }) =>
	new Response(`User-agent: *\nDisallow: /og-card\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
		headers: { 'content-type': 'text/plain' }
	});
