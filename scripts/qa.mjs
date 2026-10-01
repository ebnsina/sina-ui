// Page checks across the docs and templates, run against the dev server (pnpm dev --port 5199):
//   node scripts/qa.mjs freeze  [paths…]   long main-thread tasks, unresponsive pages, update loops
//   node scripts/qa.mjs clip    [paths…]   text cut off by a container that hides overflow
//   node scripts/qa.mjs cover   [paths…]   text with something else drawn on top of it
//   node scripts/qa.mjs monkey  [paths…]   ~15 random clicks, inputs and keys per page; must stay alive
// With no paths it checks "/" and every page in the docs nav. SITE=http://… overrides the address.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SITE = process.env.SITE ?? 'http://localhost:5199';
const [mode, ...given] = process.argv.slice(2);
const nav = readFileSync(new URL('../src/lib/site/nav.ts', import.meta.url), 'utf8');
const urls = given.length
	? given
	: ['/', ...[...nav.matchAll(/href: '([^']+)'/g)].map((m) => m[1])];
const b = await chromium.launch({
	args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
});
const out = [];
const settle = (p, ms) =>
	Promise.race([
		p.then(() => 'ok').catch(() => 'ok'),
		new Promise((r) => setTimeout(() => r('HANG'), ms))
	]);

async function freeze() {
	for (const url of urls) {
		const ctx = await b.newContext({
			viewport: { width: 1280, height: 860 },
			permissions: ['microphone']
		});
		const p = await ctx.newPage();
		await p.addInitScript(() => {
			window.__long = [];
			new PerformanceObserver((l) => {
				for (const e of l.getEntries()) window.__long.push(Math.round(e.duration));
			}).observe({ type: 'longtask', buffered: true });
		});
		const errs = [];
		let crashed = false;
		p.on('crash', () => (crashed = true));
		p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
		p.on(
			'console',
			(m) => /effect_update_depth|infinite/i.test(m.text()) && errs.push(m.text().slice(0, 120))
		);
		try {
			await p.goto(SITE + url, { timeout: 20000 });
			await p.waitForTimeout(800);
			for (let i = 0; i < 12; i++) {
				await p.mouse.move(100 + ((i * 97) % 1000), 120 + ((i * 53) % 650), { steps: 6 });
				await p.mouse.wheel(0, 500);
				await p.waitForTimeout(60);
			}
		} catch (e) {
			errs.push('nav ' + e.message.slice(0, 80));
		}
		const frozen =
			crashed ||
			(await settle(
				p.evaluate(() => 1),
				5000
			)) === 'HANG';
		const long = frozen ? [] : await p.evaluate(() => window.__long).catch(() => []);
		const worst = long.length ? Math.max(...long) : 0;
		if (frozen || worst > 250 || errs.length)
			out.push({ url, frozen, crashed, worst, errs: [...new Set(errs)].slice(0, 3) });
		await ctx.close().catch(() => {});
	}
}

async function scan(widths, find) {
	for (const width of widths) {
		const ctx = await b.newContext({ viewport: { width, height: 860 }, reducedMotion: 'reduce' });
		const p = await ctx.newPage();
		for (const url of urls) {
			try {
				await p.goto(SITE + url, { timeout: 20000 });
			} catch {
				continue;
			}
			await p.waitForTimeout(800);
			const found = await p.evaluate(find).catch(() => []);
			if (found.length) out.push({ width, url, found });
		}
		await ctx.close();
	}
}

// Text cut off by an ancestor that hides overflow (scrollable areas and "…" truncation are intended).
function clipped() {
	const hits = [];
	const hidden = (el) =>
		el.closest('[aria-hidden="true"], [inert], svg') ||
		getComputedStyle(el).clipPath.startsWith('inset(50%');
	for (const el of document.querySelectorAll('body *')) {
		if (hidden(el)) continue;
		const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
		if (!own) continue;
		const cs = getComputedStyle(el);
		if (cs.visibility === 'hidden' || +cs.opacity === 0 || cs.textOverflow === 'ellipsis') continue;
		const r = el.getBoundingClientRect();
		if (r.width < 2 || r.height < 2) continue;
		let clip = null;
		for (let a = el.parentElement; a; a = a.parentElement) {
			const o = getComputedStyle(a).overflowX;
			if (o === 'hidden' || o === 'clip') {
				clip = a;
				break;
			}
			if (o === 'auto' || o === 'scroll') break;
		}
		if (!clip || hidden(clip)) continue;
		const c = clip.getBoundingClientRect();
		if (c.width < 4) continue;
		const over = Math.max(c.left - r.left, r.right - c.right);
		if (over > 3 && r.top < c.bottom && r.bottom > c.top)
			hits.push(
				`"${el.textContent.trim().slice(0, 40)}" cut ${Math.round(over)}px by ${clip.tagName.toLowerCase()}.${String(clip.className).split(' ')[0]}`
			);
	}
	return [...new Set(hits)].slice(0, 6);
}

// Text with an unrelated opaque element on top of it (a panel or bar covering content).
function covered() {
	const hits = [];
	for (const el of document.querySelectorAll('body *')) {
		if (
			el.closest('[aria-hidden="true"], [inert], svg, header, [role="banner"], dialog, [popover]')
		)
			continue;
		if (getComputedStyle(el).clipPath.startsWith('inset(50%') || el.closest('thead')) continue;
		const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
		if (!own) continue;
		const cs = getComputedStyle(el);
		if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
		const r = el.getBoundingClientRect();
		if (
			r.width < 4 ||
			r.height < 4 ||
			r.top < 70 ||
			r.bottom > innerHeight - 4 ||
			r.left < 0 ||
			r.right > innerWidth
		)
			continue;
		let n = 0;
		for (const fx of [0.15, 0.5, 0.85]) {
			const top = document.elementFromPoint(r.left + r.width * fx, r.top + r.height / 2);
			if (top && top !== el && !el.contains(top) && !top.contains(el)) {
				const t = getComputedStyle(top);
				if (t.pointerEvents !== 'none' && t.backgroundColor !== 'rgba(0, 0, 0, 0)') n++;
			}
		}
		if (n >= 2) {
			const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			hits.push(
				`"${el.textContent.trim().slice(0, 36)}" under ${top?.tagName.toLowerCase()}.${String(top?.className).split(' ')[0]}`
			);
		}
	}
	return [...new Set(hits)].slice(0, 5);
}

async function monkey() {
	let seed = 7;
	const rnd = (n) => (seed = (seed * 16807) % 2147483647) % n;
	for (const url of urls) {
		const ctx = await b.newContext({
			viewport: { width: 1280, height: 860 },
			permissions: ['microphone']
		});
		const p = await ctx.newPage();
		const errs = [];
		let crashed = false;
		p.on('crash', () => (crashed = true));
		p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
		p.on('dialog', (d) => d.dismiss().catch(() => {}));
		try {
			await p.goto(SITE + url, { timeout: 20000 });
			await p.waitForTimeout(700);
		} catch {
			continue;
		}
		let frozen = null;
		for (let step = 0; step < 15 && !frozen && !crashed; step++) {
			const kind = rnd(4);
			let act = Promise.resolve();
			if (kind < 2) {
				const btns = p.locator('button:visible');
				const n = await btns.count().catch(() => 0);
				if (n) act = btns.nth(rnd(n)).click({ timeout: 1500 });
			} else if (kind === 2) {
				const inputs = p.locator(
					'input:visible:not([type=file]):not([type=checkbox]):not([type=radio]), textarea:visible'
				);
				const n = await inputs.count().catch(() => 0);
				if (n)
					act = inputs
						.nth(rnd(n))
						.fill('test 12', { timeout: 1500 })
						.then(() => p.keyboard.press('Enter'));
			} else act = p.keyboard.press(['Escape', 'ArrowDown', 'Tab', 'j', 'k', 'ArrowRight'][rnd(6)]);
			await settle(act, 6000);
			await p.waitForTimeout(150);
			if (
				crashed ||
				(await settle(
					p.evaluate(() => 1),
					4000
				)) === 'HANG'
			)
				frozen = `after step ${step}`;
		}
		if (frozen || crashed || errs.length)
			out.push({ url, frozen, crashed, errs: [...new Set(errs)].slice(0, 3) });
		await ctx.close().catch(() => {});
	}
}

if (mode === 'freeze') await freeze();
else if (mode === 'clip') await scan([1280, 390], clipped);
else if (mode === 'cover') await scan([1280, 1024, 390], covered);
else if (mode === 'monkey') await monkey();
else {
	console.error('Usage: node scripts/qa.mjs freeze|clip|cover|monkey [paths…]');
	process.exit(1);
}
console.log(JSON.stringify(out, null, 1));
console.log(`${mode}: ${out.length} problem page(s) of ${urls.length}`);
await b.close();
process.exit(out.length ? 1 : 0);
