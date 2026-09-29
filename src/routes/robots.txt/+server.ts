import { resolve } from '$app/paths';
import { root } from '#lib/site/root.js';
import type { RequestHandler } from './$types';

export const prerender = true;

// Rendered on request, so the sitemap line carries the address the site is actually served at.
export const GET: RequestHandler = ({ url }) =>
	new Response(
		`User-agent: *\nDisallow: ${resolve('/og-card')}\n\nSitemap: ${root(url)}/sitemap.xml\n`,
		{
			headers: { 'content-type': 'text/plain' }
		}
	);
