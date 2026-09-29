<script lang="ts">
	import { releases } from '#lib/site/changelog.js';

	const date = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' });
</script>

<svelte:head>
	<title>Changelog — Sina UI</title>
	<meta name="description" content="What each release of Sina UI contains." />
	<meta property="og:title" content="Changelog — Sina UI" />
	<meta property="og:description" content="What each release of Sina UI contains." />
</svelte:head>

<p class="eyebrow">Getting started</p>
<h1>Changelog</h1>
<p class="lede">What each release contains, newest first.</p>

{#each releases as release (release.title)}
	<section class="release">
		<h2 id="v{release.title}">
			{release.title}
			{#if release.date}
				<time datetime={release.date}>{date.format(new Date(release.date))}</time>
			{:else}
				<span class="soon">Coming soon</span>
			{/if}
		</h2>
		<p>{release.summary}</p>
		{#each release.groups as group (group.title)}
			<h3>{group.title}</h3>
			<ul class={['items', group.title !== 'Foundations' && 'columns']}>
				{#each group.items as item (item.text)}
					<li>
						{#if item.href}<a href={item.href}>{item.text}</a>{:else}{item.text}{/if}
					</li>
				{/each}
			</ul>
		{/each}
	</section>
{/each}

<style>
	h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.75rem;
	}
	time {
		color: var(--ui-muted);
		font-size: 0.9375rem;
		font-weight: 400;
	}
	.soon {
		padding: 0.125rem 0.625rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
		font-size: 0.8125rem;
		font-weight: 600;
	}
	/* Component names are short: several to a row. */
	.columns {
		columns: 12rem auto;
		column-gap: 2rem;
	}
	.columns li {
		break-inside: avoid;
	}
</style>
