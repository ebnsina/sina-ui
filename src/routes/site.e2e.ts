import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';
import { nav } from '../lib/site/nav';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

// Every page in the sidebar, in the real layout, on every browser and device project.
for (const href of nav.flatMap((g) => g.items.map((i) => i.href))) {
	test(`${href}: no sideways scroll, no axe violations`, async ({ page }) => {
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
