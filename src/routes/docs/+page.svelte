<script lang="ts">
	import { link } from '#lib/site/root.js';
	import { counts, nav } from '#lib/site/nav.js';
	import Badge from '#lib/ui/Badge.svelte';

	const groups = nav.filter((g) => g.title !== 'Getting started');
</script>

<svelte:head>
	<title>Introduction — Sina UI</title>
	<meta
		name="description"
		content="Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth."
	/>
	<meta property="og:title" content="Introduction — Sina UI" />
	<meta
		property="og:description"
		content="Copy-paste Svelte 5 components: WAI-ARIA patterns, keyboard support, right-to-left, dark mode and motion that stays smooth."
	/>
</svelte:head>

<p class="eyebrow">Getting started</p>
<h1>Accessible Svelte components that feel finished.</h1>
<p class="lede">
	{counts.components} components, {counts.blocks} blocks and {counts.widgets} widgets to copy into your
	project and own, plus {counts.proBlocks} Pro blocks and {counts.templates} Pro templates. Svelte 5 runes
	and native platform features, with every WAI-ARIA pattern done properly.
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
			<li>
				<a class="card" href={link(item.href)}
					>{item.title}{#if item.pro}<Badge tone="accent" icon={false} class="pro">Pro</Badge
						>{/if}</a
				>
			</li>
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
	/* Full row height, so a two-line name doesn't leave its row neighbors short. */
	.card {
		display: block;
		box-sizing: border-box;
		block-size: 100%;
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
