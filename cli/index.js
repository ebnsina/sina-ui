#!/usr/bin/env node
// sinaui: copies Sina UI components into your project, with everything they import.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `Sina UI

  npx sinaui add <name...>   Add components, e.g. add button dropdown blocks/chat
  npx sinaui add --all       Add everything
  npx sinaui init            Add only the design tokens
  npx sinaui list            Show what can be added

Options
  --dir <path>     Where files go (default src/lib/sina-ui)
  --overwrite      Replace files you already have (normally they're kept)
  --no-install     Only print the packages to install

Browse the components at https://ebnsina.github.io/sina-ui/`;

// The published site; SINA_UI_REGISTRY points it at a local copy while working on Sina UI itself.
const REGISTRY = process.env.SINA_UI_REGISTRY || 'https://ebnsina.github.io/sina-ui';

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

/** Adds `line` to the root layout's script (creating the layout if there is none); false if already there. */
export async function importIn(layout, line) {
	if (!existsSync(layout)) {
		await mkdir(dirname(layout), { recursive: true });
		await writeFile(
			layout,
			`<script>\n\t${line}\n\n\tlet { children } = $props();\n</script>\n\n{@render children()}\n`
		);
		return true;
	}
	const src = await readFile(layout, 'utf8');
	if (src.includes(line)) return false;
	const script = src.match(/<script[^>]*>\n?/);
	await writeFile(
		layout,
		script
			? src.replace(script[0], `${script[0]}\t${line}\n`)
			: `<script>\n\t${line}\n</script>\n\n${src}`
	);
	return true;
}

async function get(registry, name) {
	const url = new URL(`r/${name}.json`, registry.endsWith('/') ? registry : `${registry}/`);
	let res;
	try {
		res = await fetch(url);
	} catch {
		throw new Error(`Couldn't reach ${url.origin}. Check your connection and try again.`);
	}
	if (res.status === 404)
		throw new Error(
			`There's no component called "${name}". Run npx sinaui list to see them.`
		);
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
	const registry = REGISTRY;

	if (command === 'list') {
		const { items } = await get(registry, 'index');
		return console.log(items.join('\n'));
	}
	if (command !== 'add' && command !== 'init')
		throw new Error(`Unknown command "${command}".\n\n${HELP}`);
	if (!existsSync('package.json'))
		throw new Error("Run this in your SvelteKit project's folder (the one with package.json).");
	if (command === 'add' && flag('all')) names.push(...(await get(registry, 'index')).items);
	if (command === 'add' && !names.length)
		throw new Error('Name at least one component: npx sinaui add button');

	// Tokens always come along: every component reads its colours and corners from them.
	const items = await Promise.all(
		['tokens', ...(command === 'add' ? names : [])].map((n) => get(registry, n))
	);
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

	if (missing.length) {
		const [bin, ...sub] = manager('.').split(' ');
		const specs = missing.map(([n, v]) => `${n}@${v}`);
		if (flag('no-install'))
			console.log(`\nInstall what they need:\n  ${bin} ${sub.join(' ')} ${specs.join(' ')}`);
		else {
			console.log(`\nInstalling ${specs.join(', ')}`);
			const run = spawnSync(bin, [...sub, ...specs], {
				stdio: 'inherit',
				shell: process.platform === 'win32'
			});
			if (run.status !== 0)
				throw new Error(
					`Installing failed. Run it yourself: ${bin} ${sub.join(' ')} ${specs.join(' ')}`
				);
		}
	}

	const layout = 'src/routes/+layout.svelte';
	const tokens = `import '${relative('src/routes', join(dir, 'ui/tokens.css')).replaceAll('\\', '/')}';`;
	if (await importIn(layout, tokens)) console.log(`\n  Imported the tokens in ${layout}`);
	console.log('\nDone.');
}

// Only run when called as a command (npx runs it through a symlink), so the functions above can be tested.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2)).catch((e) => {
		console.error(`\n  ${e.message}\n`);
		process.exit(1);
	});
}
