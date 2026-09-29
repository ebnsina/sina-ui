import { nav } from '#lib/site/nav.js';
import type { RequestHandler } from './$types';

// Every page in the navigation, so a new page is in the sitemap the moment it's in the sidebar.
export const GET: RequestHandler = ({ url }) => {
	const pages = nav.flatMap((section) => section.items.map((item) => item.href));
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `\t<url><loc>${url.origin}${p}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'content-type': 'application/xml' } });
};
