#!/usr/bin/env node
// sina-ui: copies Sina UI components into your project, with everything they import.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

const HELP = `Sina UI

  sina-ui init                 Add the design tokens (tokens.css)
  sina-ui add <name...>        Add components, e.g. sina-ui add button dropdown blocks/chat
  sina-ui list                 Show what can be added

Options
  --dir <path>     Where files go (default src/lib/sina-ui)
  --overwrite      Replace files you already have (normally they're kept)

Set SINA_UI_REGISTRY to the Sina UI site's address.`;

/** '#lib/ui/Button.svelte' in a file at blocks/chat/Chat.svelte becomes '../../ui/Button.svelte'. */
export function rewrite(content, filePath) {
	return content.replace(/(['"])#lib\/([^'"]+)\1/g, (_, q, rest) => {
		let rel = relative(dirname(filePath), rest).replaceAll('\\', '/');
		if (!rel.startsWith('.')) rel = `./${rel}`;
		return `${q}${rel}${q}`;
	});
}

/** The project's package manager, from its lockfile. */
export function manager(root) {
	if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm add';
	if (existsSync(join(root, 'yarn.lock'))) return 'yarn add';
	if (existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb'))) return 'bun add';
	return 'npm install';
}

async function get(registry, name) {
	const url = new URL(`r/${name}.json`, registry.endsWith('/') ? registry : `${registry}/`);
	let res;
	try {
		res = await fetch(url);
	} catch {
		throw new Error(`Couldn't reach ${url.origin}. Check your connection and SINA_UI_REGISTRY.`);
	}
	if (res.status === 404) throw new Error(`There's no component called "${name}". Run sina-ui list to see them.`);
	if (!res.ok) throw new Error(`${url} answered ${res.status}.`);
	return res.json();
}

async function main(argv) {
	const args = argv.filter((a) => !a.startsWith('--'));
	const flag = (name) => argv.includes(`--${name}`);
	const dirAt = argv.indexOf('--dir');
	const dir = dirAt >= 0 ? argv[dirAt + 1] : 'src/lib/sina-ui';
	if (dirAt >= 0) args.splice(args.indexOf(dir), 1);
	const [command, ...names] = args;

	if (!command || flag('help')) return console.log(HELP);
	const registry = process.env.SINA_UI_REGISTRY;
	if (!registry) throw new Error("Set SINA_UI_REGISTRY to the Sina UI site's address, e.g. SINA_UI_REGISTRY=https://… npx sina-ui add button");

	if (command === 'list') {
		const { items } = await get(registry, 'index');
		return console.log(items.join('\n'));
	}
	if (command !== 'add' && command !== 'init') throw new Error(`Unknown command "${command}".\n\n${HELP}`);
	if (command === 'add' && !names.length) throw new Error('Name at least one component: sina-ui add button');

	// Tokens always come along: every component reads its colours and corners from them.
	const items = await Promise.all(['tokens', ...(command === 'add' ? names : [])].map((n) => get(registry, n)));
	const files = new Map(items.flatMap((i) => i.files.map((f) => [f.path, f.content])));
	const deps = Object.assign({}, ...items.map((i) => i.dependencies));

	const written = [];
	const kept = [];
	for (const [path, content] of files) {
		const to = join(dir, path);
		if (existsSync(to) && !flag('overwrite')) {
			kept.push(to);
			continue;
		}
		await mkdir(dirname(to), { recursive: true });
		await writeFile(to, rewrite(content, path));
		written.push(to);
	}

	const pkg = existsSync('package.json') ? JSON.parse(await readFile('package.json', 'utf8')) : {};
	const have = { ...pkg.dependencies, ...pkg.devDependencies };
	const missing = Object.entries(deps).filter(([name]) => !have[name]);

	for (const f of written) console.log(`  added  ${f}`);
	for (const f of kept) console.log(`  kept   ${f} (yours; --overwrite to replace)`);
	if (missing.length) console.log(`\nInstall what they need:\n  ${manager('.')} ${missing.map(([n, v]) => `${n}@${v}`).join(' ')}`);
	if (written.some((f) => f.endsWith('tokens.css')))
		console.log(`\nImport the tokens once, in src/routes/+layout.svelte:\n  import '${relative('src/routes', join(dir, 'ui/tokens.css')).replaceAll('\\', '/')}';`);
}

// Only run when called as a command, so the functions above can be tested on their own.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('/sina-ui')) {
	main(process.argv.slice(2)).catch((e) => {
		console.error(`\n  ${e.message}\n`);
		process.exit(1);
	});
}
