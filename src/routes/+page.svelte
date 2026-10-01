<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { link, root } from '#lib/site/root.js';
	import { counts, type PageId } from '#lib/site/nav.js';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Area from './components/chart/examples/area.svelte';
	import Picker from './components/color-picker/examples/pigments.svelte';
	import DatePicker from './components/date-picker/examples/basic.svelte';
	import Otp from './components/otp-input/examples/verify.svelte';
	import Counter from './components/rolling-number/examples/counter.svelte';
	import Segmented from './components/segmented/examples/basic.svelte';
	import Slider from './components/slider/examples/basic.svelte';
	import Toasts from './components/toast/examples/success.svelte';
	import Island from './widgets/dynamic-island/examples/activities.svelte';
	import Orb from './widgets/orb/examples/voice.svelte';

	// Live components, not screenshots: every tile works.
	const tiles: { title: string; href: PageId; demo: Component; wide?: boolean }[] = [
		{ title: 'Dynamic island', href: '/widgets/dynamic-island', demo: Island, wide: true },
		{ title: 'Rolling number', href: '/components/rolling-number', demo: Counter },
		{ title: 'Fluid orb', href: '/widgets/orb', demo: Orb },
		{ title: 'OTP input', href: '/components/otp-input', demo: Otp },
		{ title: 'Chart', href: '/components/chart', demo: Area, wide: true },
		{ title: 'Date picker', href: '/components/date-picker', demo: DatePicker },
		{ title: 'Toast', href: '/components/toast', demo: Toasts },
		{ title: 'Segmented control', href: '/components/segmented', demo: Segmented },
		{ title: 'Color picker', href: '/components/color-picker', demo: Picker },
		{ title: 'Slider', href: '/components/slider', demo: Slider }
	];

	const description =
		'Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth.';
	// Structured data: tells search and AI engines what this is, and where to learn more.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareSourceCode',
			name: 'Sina UI',
			description,
			url: root(page.url),
			programmingLanguage: ['Svelte', 'TypeScript'],
			runtimePlatform: 'SvelteKit',
			keywords: 'Svelte, Svelte 5, SvelteKit, components, accessible, UI library',
			isAccessibleForFree: true
		}).replace(/</g, '\\u003c')
	);
	// Split so this script block doesn't end early; `<` inside the JSON is escaped above.
	const ldTag = $derived(`<script type="application/ld+json">${jsonLd}</` + 'script>');
</script>

<svelte:head>
	<title>Sina UI — Accessible Svelte components that feel finished</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Sina UI — Accessible Svelte components that feel finished" />
	<meta property="og:description" content={description} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- our own JSON, with < escaped -->
	{@html ldTag}
</svelte:head>

<section class="hero">
	<h1>Accessible Svelte components that feel finished.</h1>
	<p>
		{counts.components} components, {counts.blocks} blocks and {counts.widgets} widgets to copy into your
		project and own, plus {counts.proBlocks} Pro blocks and {counts.templates} Pro templates. Keyboard,
		screen reader and right-to-left support in every one, with motion that stays smooth.
	</p>
	<div class="actions">
		<Button size="lg" href={resolve('/docs')}>Get started</Button>
		<Button size="lg" variant="secondary" href={resolve('/pro')}>See Pro</Button>
	</div>
</section>

<section class="grid" aria-label="Components">
	{#each tiles as tile (tile.href)}
		{@const Demo = tile.demo}
		<article class={['tile', tile.wide && 'wide']}>
			<div class="demo"><Demo /></div>
			<a class="caption" href={link(tile.href)}>{tile.title}</a>
		</article>
	{/each}
</section>

<section class="pro">
	<Badge tone="accent" icon={false}>Pro</Badge>
	<h2>Blocks and templates, ready to ship</h2>
	<p>
		Larger blocks and complete apps built from the same components. One price, paid once, shown
		before you buy.
	</p>
	<ul>
		<li>
			<a href={resolve('/pro/pricing')}>
				<strong>Pricing</strong>
				<span>Plans with a billing switch and prices that roll.</span>
			</a>
		</li>
		<li>
			<a href={resolve('/pro/saas-landing')}>
				<strong>SaaS landing page</strong>
				<span>Hero, features, pricing and questions: a product site, ready to rename.</span>
			</a>
		</li>
		<li>
			<a href={resolve('/pro/saas-app')}>
				<strong>SaaS app</strong>
				<span>Sidebar app with dashboard, invoices and full account management.</span>
			</a>
		</li>
	</ul>
</section>

<footer>
	<span>Sina UI · MIT licensed</span>
	<a href={resolve('/changelog')}>Changelog</a>
</footer>

<style>
	section,
	footer {
		box-sizing: border-box;
		inline-size: min(76rem, 100% - 2rem);
		margin-inline: auto;
	}
	/* A soft emerald wash behind the headline; it rises in once when the page opens. */
	.hero {
		display: grid;
		justify-items: center;
		gap: 1.25rem;
		margin-block-start: 0.5rem;
		padding: clamp(4rem, 12vw, 8rem) 1.5rem;
		border-radius: calc(var(--ui-radius) * 3);
		background:
			radial-gradient(
				60% 80% at 85% 0%,
				color-mix(in srgb, var(--ui-accent) 16%, transparent),
				transparent
			),
			radial-gradient(
				50% 70% at 10% 100%,
				color-mix(in srgb, var(--ui-accent) 10%, transparent),
				transparent
			),
			var(--ui-subtle);
		text-align: center;
	}
	.hero > * {
		animation: mount 700ms var(--ui-ease-enter) both;
	}
	.hero > :nth-child(2) {
		animation-delay: 60ms;
	}
	.hero > :nth-child(3) {
		animation-delay: 120ms;
	}
	@keyframes mount {
		from {
			opacity: 0;
			translate: 0 10px;
		}
	}
	.hero h1 {
		max-inline-size: 16ch;
		margin: 0;
		font-size: clamp(2.25rem, 6vw, 4rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}
	.hero p {
		max-inline-size: 36rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 1.125rem;
		text-wrap: pretty;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-block-start: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
		grid-auto-flow: dense;
		gap: 1rem;
		margin-block-start: 1rem;
	}
	.tile {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 2);
		background: var(--ui-subtle);
	}
	@media (width >= 48rem) {
		.wide {
			grid-column: span 2;
		}
	}
	/* Each tile rises in as it scrolls into view; tiles already on screen stay put. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.tile {
				animation: reveal linear both;
				animation-timeline: view();
				animation-range: entry 0 entry 200px;
			}
		}
	}
	@keyframes reveal {
		from {
			opacity: 0;
			translate: 0 32px;
		}
	}
	.demo {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		align-content: center;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		min-block-size: 14rem;
		padding: 1.5rem;
	}
	.demo > :global(*) {
		max-inline-size: 100%;
	}
	.caption {
		padding: 0 1.25rem 1rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: color var(--ui-dur-press) ease;
	}
	@media (hover: hover) {
		.caption:hover {
			color: var(--ui-fg);
		}
	}

	.pro {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		margin-block-start: 5rem;
	}
	.pro h2 {
		margin: 0;
		font-size: clamp(1.5rem, 3.5vw, 2.25rem);
		letter-spacing: -0.02em;
	}
	.pro p {
		max-inline-size: 36rem;
		margin: 0;
		color: var(--ui-muted);
	}
	.pro ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
		gap: 1rem;
		inline-size: 100%;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
	}
	.pro a {
		display: grid;
		gap: 0.25rem;
		block-size: 100%;
		box-sizing: border-box;
		padding: 1.25rem;
		border-radius: calc(var(--ui-radius) * 2);
		background: color-mix(in srgb, var(--ui-accent) 7%, transparent);
		color: var(--ui-fg);
		text-decoration: none;
		transition: translate var(--ui-dur) var(--ui-ease-out);
	}
	.pro a span {
		color: var(--ui-muted);
		font-size: 0.9375rem;
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.pro a:hover {
			translate: 0 -2px;
		}
	}
	.pro a:active {
		scale: 0.99;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
		margin-block-start: 5rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	footer a {
		color: inherit;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero > * {
			animation: none;
		}
	}
</style>
