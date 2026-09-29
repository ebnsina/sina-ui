<script lang="ts">
	import { link } from '#lib/site/root.js';
	import { resolve } from '$app/paths';
	import { Alert02Icon, CloudOffIcon, MapsSearchIcon } from '@hugeicons/core-free-icons';
	import { page } from '$app/state';
	import Button from '#lib/ui/Button.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import { nav } from '#lib/site/nav.js';
	import { search } from '#lib/site/search.svelte.js';

	const status = $derived(page.status);
	const missing = $derived(status === 404);
	const broken = $derived(status >= 500);

	// A mistyped address usually sits a letter or two from a real page: offer the closest one.
	const pages = nav.flatMap((g) => g.items);
	function distance(a: string, b: string) {
		const row = Array.from({ length: b.length + 1 }, (_, i) => i);
		for (let i = 1; i <= a.length; i++) {
			let prev = row[0];
			row[0] = i;
			for (let j = 1; j <= b.length; j++) {
				const next = row[j];
				row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
				prev = next;
			}
		}
		return row[b.length];
	}
	const suggestion = $derived.by(() => {
		if (!missing) return undefined;
		const here = page.url.pathname
			.slice(resolve('/').length - 1)
			.toLowerCase()
			.replace(/\/$/, '');
		const best = pages.map((p) => ({ p, d: distance(here, p.href) })).sort((a, b) => a.d - b.d)[0];
		// Close enough to be a slip, not a different page altogether.
		return best && best.d <= Math.max(3, Math.floor(best.p.href.length / 4)) ? best.p : undefined;
	});

	const title = $derived(
		missing
			? "This page isn't here"
			: broken
				? 'Something went wrong on our side'
				: "That didn't work"
	);
</script>

<svelte:head>
	<title>{missing ? 'Page not found' : 'Something went wrong'} — Sina UI</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<p class="eyebrow">Error {status}</p>
<div class="error">
	<EmptyState
		icon={missing ? MapsSearchIcon : broken ? CloudOffIcon : Alert02Icon}
		{title}
		level={1}
	>
		{#if missing}
			{#if suggestion}
				<p>
					Did you mean <a href={link(suggestion.href)}>{suggestion.title}</a>? Otherwise, search the
					components, or start from the introduction.
				</p>
			{:else}
				<p>
					The link may be old, or the page has moved. Search the components, or start from the
					introduction.
				</p>
			{/if}
		{:else if broken}
			<p>
				It isn't anything you did. Try again in a moment; if it keeps happening, the page is being
				fixed.
			</p>
		{:else}
			<p>Try again, or start from the introduction.</p>
		{/if}
		{#snippet actions()}
			{#if missing}
				<Button variant="secondary" onclick={() => (search.open = true)}>Search components</Button>
			{:else}
				<Button variant="secondary" onclick={() => location.reload()}>Try again</Button>
			{/if}
			<Button href={resolve('/')}>Go to the introduction</Button>
		{/snippet}
	</EmptyState>
</div>

<style>
	.error {
		display: grid;
		place-items: center;
		min-block-size: min(60vh, 32rem);
	}
	.error :global(h1) {
		margin: 0;
		font-size: 1.5rem;
		letter-spacing: -0.02em;
	}
	.error :global(.body) {
		max-inline-size: 40ch;
		font-size: 0.9375rem;
	}
</style>
