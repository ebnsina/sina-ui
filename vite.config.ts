/// <reference types="vitest/config" />
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: {
					async: true
				}
			},
			// A static site for GitHub Pages; the workflow sets BASE_PATH to /<repo> and ORIGIN to the Pages host.
			adapter: adapter({ fallback: '404.html' }),
			paths: {
				base: process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? ''),
				origin: process.env.ORIGIN,
				// Absolute, so the sitemap and llms.txt write full addresses.
				relative: false
			},
			prerender: {
				// These demos' sidebars link to a pretend app's pages; any other missing anchor fails the build.
				handleMissingId: ({ path, message }) => {
					if (
						!/\/(blocks\/dashboard|blocks\/file-explorer|components\/sidebar|pro\/saas-app)$/.test(
							path
						)
					)
						throw new Error(message);
				}
			},
			preprocess: [
				mdsvex({
					extensions: ['.svx', '.md']
				})
			],
			extensions: ['.svelte', '.svx', '.md'],
			experimental: {
				remoteFunctions: true
			}
		})
	],
	test: {
		expect: {
			requireAssertions: true
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [
							{ browser: 'chromium', headless: true },
							{ browser: 'webkit', headless: true }
						]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook')
					})
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: 'chromium'
							}
						]
					}
				}
			}
		]
	}
});
