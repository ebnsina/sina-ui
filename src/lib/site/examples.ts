import type { Component } from 'svelte';

// Every example is a real component, and the code shown is its own source file: preview and code can't drift.
// Pages pass their own import.meta.glob results (globs must be literal), so each page bundles only its examples.
export function examples(components: Record<string, Component>, sources: Record<string, string>) {
	return (name: string) => {
		const path = `./examples/${name}.svelte`;
		if (!components[path]) throw new Error(`Missing example ${path}`);
		return { component: components[path], code: sources[path].trimEnd() };
	};
}
