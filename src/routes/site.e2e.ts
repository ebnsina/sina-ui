import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';
import { nav } from '../lib/site/nav';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

// The home page and every page in the sidebar, in the real layout, on every browser and device project.
// Template pages aren't in the docs nav; Daftar's, Sidra AI's and Nur's are checked too.
const daftar = ['', '/pricing', '/changelog', '/blog', '/contact', '/legal/terms', '/404'].map(
	(p) => `/pro/saas-landing/site${p}`
);
const daftarApp = [
	'',
	'/invoices',
	'/invoices/new',
	'/invoices/i12',
	'/customers',
	'/customers/c1',
	'/team',
	'/billing',
	'/settings',
	'/sign-in',
	'/onboarding'
].map((p) => `/pro/saas-app/app${p}`);
const sidra = [
	...['', '/orders', '/pricing'].map((p) => `/pro/ai-agents/site${p}`),
	...[
		'',
		'/agents/care',
		'/playground',
		'/conversations',
		'/conversations/cv1',
		'/handovers',
		'/insights',
		'/setup',
		'/sign-in'
	].map((p) => `/pro/ai-agents/app${p}`)
];
const nur = [
	'',
	'/articles/house-of-wisdom',
	'/topics/astronomy',
	'/authors/nusrat-jahan',
	'/search',
	'/archive',
	'/about',
	'/newsletter',
	'/404'
].map((p) => `/pro/blog/modern-site${p}`);
for (const href of [
	'/',
	...nav.flatMap((g) => g.items.map((i) => i.href)),
	...daftar,
	...daftarApp,
	...sidra,
	...nur
]) {
	test(`${href}: no sideways scroll, no axe violations`, async ({ page }) => {
		// Scroll reveals start faded below the fold; axe judges what they settle into.
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(href);
		await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow, 'page scrolls sideways').toBeLessThanOrEqual(0);
		await page.addScriptTag({ path: axePath });
		const violations = await page.evaluate(async () => {
			// @ts-expect-error injected above
			const { violations } = await axe.run(document, {
				runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
			});
			return violations.map(
				(v: { id: string; nodes: { target: string[] }[] }) =>
					`${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`
			);
		});
		expect(violations).toEqual([]);
	});
}
