<script lang="ts">
	import { page } from '$app/state';
	import { nav } from '#lib/site/nav.js';

	const groups = nav.filter((g) => g.title !== 'Getting started');
	// Structured data: tells search and AI engines what this is, and where to learn more.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareSourceCode',
			name: 'Sina UI',
			description:
				'Accessible Svelte 5 components you copy into your project: keyboard support, right-to-left, dark mode and motion.',
			url: page.url.origin,
			programmingLanguage: ['Svelte', 'TypeScript'],
			runtimePlatform: 'SvelteKit',
			keywords: 'Svelte, Svelte 5, SvelteKit, components, accessible, UI library',
			isAccessibleForFree: true
		}).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<title>Sina UI — Accessible Svelte components that feel finished</title>
	<meta
		name="description"
		content="Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth."
	/>
	<meta property="og:title" content="Sina UI — Accessible Svelte components that feel finished" />
	<meta
		property="og:description"
		content="Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth."
	/>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- our own JSON, with < escaped -->
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<p class="eyebrow">Sina UI</p>
<h1>Accessible Svelte components that feel finished.</h1>
<p class="lede">
	Copy a file into your project and own it. Svelte 5 runes and native platform features, with every
	WAI-ARIA pattern done properly.
</p>

<h2 id="principles">Principles</h2>
<ul>
	<li>
		Keyboard, screen reader and right-to-left support in every component, tested in real browsers.
	</li>
	<li>
		Native first: <code>&lt;dialog&gt;</code>, the Popover API and form controls do the hard parts.
	</li>
	<li>
		Motion only on <code>transform</code> and <code>opacity</code>, so it stays smooth while the
		page is busy.
	</li>
	<li>Themed with CSS custom properties in one <code>tokens.css</code>; fits any background.</li>
</ul>

<h2 id="components">Components</h2>
{#each groups as group (group.title)}
	<h3>{group.title}</h3>
	<ul class="cards">
		{#each group.items as item (item.href)}
			<li><a class="card" href={item.href}>{item.title}</a></li>
		{/each}
	</ul>
{/each}

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		/* A grid, not running text: not held to the prose line length. */
		max-inline-size: none;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.card {
		display: block;
		padding: 1rem 1.125rem;
		background: var(--ui-subtle);
		border-radius: calc(var(--ui-radius) * 1.5);
		color: var(--ui-fg);
		font-weight: 500;
		text-decoration: none;
		transition: background-color var(--ui-dur-press) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--ui-hover);
		}
	}
	.card:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
