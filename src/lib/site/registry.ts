// The registry the sinaui CLI installs from: for each component, its source files (following every
// local import) and the npm packages they need. Built from the real source, so it never drifts.
import pkg from '../../../package.json';

const sources = import.meta.glob<string>(
	['/src/lib/ui/**/*.{svelte,ts,css}', '/src/lib/blocks/**/*.{svelte,ts}', '!**/*.{spec,test}.ts'],
	{ eager: true, query: '?raw', import: 'default' }
);

export type RegistryItem = {
	name: string;
	/** Paths are relative to the lib folder the CLI installs into ("ui/Button.svelte"). */
	files: { path: string; content: string }[];
	dependencies: Record<string, string>;
};

const versions: Record<string, string> = { ...pkg.devDependencies, ...pkg.dependencies };
// Provided by every SvelteKit app already.
const framework = (spec: string) =>
	spec === 'svelte' ||
	spec.startsWith('svelte/') ||
	spec.startsWith('$app/') ||
	spec.startsWith('@sveltejs/');

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const importsOf = (code: string) =>
	[...code.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)].map((m) => m[1].split('?')[0]);

function resolve(from: string, spec: string): string | undefined {
	const base = spec.startsWith('#lib/')
		? `/src/lib/${spec.slice(5)}`
		: new URL(spec, `file://${from}`).pathname;
	return [
		base,
		base.replace(/\.js$/, '.ts'),
		`${base}.ts`,
		`${base}.svelte`,
		`${base}/index.ts`
	].find((p) => p in sources);
}

function build(name: string, entries: string[]): RegistryItem {
	const files = new Set<string>();
	const dependencies: Record<string, string> = {};
	const visit = (path: string) => {
		if (files.has(path)) return;
		files.add(path);
		for (const spec of importsOf(sources[path])) {
			if (spec.startsWith('.') || spec.startsWith('#lib/')) {
				const found = resolve(path, spec);
				if (!found) throw new Error(`registry: ${path} imports ${spec}, which doesn't exist`);
				visit(found);
			} else if (!framework(spec)) {
				const name = spec.startsWith('@')
					? spec.split('/').slice(0, 2).join('/')
					: spec.split('/')[0];
				if (!versions[name])
					throw new Error(`registry: ${path} imports ${name}, which isn't in package.json`);
				dependencies[name] = versions[name];
			}
		}
	};
	entries.forEach(visit);
	return {
		name,
		files: [...files]
			.sort()
			.map((p) => ({ path: p.replace('/src/lib/', ''), content: sources[p] })),
		dependencies
	};
}

const paths = Object.keys(sources);
const within = (dir: string) =>
	paths.filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/'));

/** Every installable item, by name: components ("date-picker"), folders ("dropdown"), blocks ("blocks/chat"). */
export const registry: Record<string, () => RegistryItem> = {};
for (const p of within('/src/lib/ui/').filter((p) => p.endsWith('.svelte')))
	registry[kebab(p.split('/').pop()!.replace('.svelte', ''))] = () =>
		build(kebab(p.split('/').pop()!.replace('.svelte', '')), [p]);
for (const index of paths.filter((p) => /^\/src\/lib\/ui\/[^/]+\/index\.ts$/.test(p))) {
	const folder = index.split('/').at(-2)!;
	registry[folder] = () => build(folder, [index]);
}
registry['form'] = () => build('form', ['/src/lib/ui/form.svelte.ts']);
registry['tokens'] = () => build('tokens', ['/src/lib/ui/tokens.css']);
for (const dir of new Set(
	paths.filter((p) => p.startsWith('/src/lib/blocks/')).map((p) => p.split('/')[4])
)) {
	const name = `blocks/${dir}`;
	registry[name] = () => build(name, within(`/src/lib/blocks/${dir}/`));
}
