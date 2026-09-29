// Renders a social preview image for every page into static/og/: `SITE=http://localhost:5174 pnpm og`
// with the dev server running. Commit the images; re-run when pages are added or renamed.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { nav } from '../src/lib/site/nav.ts';

const site = process.env.SITE;
if (!site)
	throw new Error(
		'Set SITE to a running copy of the docs, e.g. SITE=http://localhost:5174 pnpm og'
	);

const slug = (href: string) => (href === '/' ? 'home' : href.slice(1).replaceAll('/', '-'));
await mkdir('static/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const section of nav)
	for (const item of section.items) {
		const q = new URLSearchParams({
			title: item.href === '/' ? 'Sina UI' : item.title,
			section: item.href === '/' ? '' : section.title
		});
		await page.goto(`${site}/og-card?${q}`, { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		await page.screenshot({ path: `static/og/${slug(item.href)}.png` });
		console.log(`  og/${slug(item.href)}.png`);
	}
await browser.close();
