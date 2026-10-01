<script lang="ts">
	import { link } from '#lib/site/root.js';
	import { asset, resolve } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import './layout.css';
	import '#lib/ui/tokens.css';
	import './docs.css';
	import favicon from '#lib/assets/favicon.svg';
	import { flushSync, onMount } from 'svelte';
	import { afterNavigate, goto, snapshot } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/ui/Button.svelte';
	import CommandPalette, { type Command } from '#lib/ui/CommandPalette.svelte';
	import { isApple } from '#lib/ui/announce.js';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { Toaster } from '#lib/ui/toast/index.js';
	import { glide } from '#lib/ui/glide.js';
	import { nav, type PageId } from '#lib/site/nav.js';
	import Badge from '#lib/ui/Badge.svelte';
	import { search } from '#lib/site/search.svelte.js';
	import { isDark, setTheme } from '#lib/site/theme.js';
	import {
		Menu01Icon,
		Moon02Icon,
		Search01Icon,
		SidebarLeftIcon,
		Sun03Icon
	} from '@hugeicons/core-free-icons';

	let { children } = $props();
	// The home page is a landing page: a top menu, no docs sidebar or contents rail.
	const landing = $derived(page.route.id === '/');
	// A template's own pages (its header, footer and routes), shown as they would ship: no docs chrome.
	// "/pro/<template>/site/…", "…/app/…" or a variant like "…/modern-site/…": a template's own pages.
	// A 404 has no route id, so fall back to the address (minus any base path): a missing page inside
	// a template still shows bare, never inside the docs.
	const template = $derived(
		(page.route.id ?? page.url.pathname.slice(resolve('/').length - 1)).match(
			/^\/pro\/([^/]+)\/(?:[a-z-]+-)?(?:site|app)(?:\/|$)/
		)?.[1]
	);
	const bare = $derived(!!template);
	const menu: { title: string; href: PageId; pro?: boolean }[] = [
		{ title: 'Docs', href: '/docs' },
		{ title: 'Components', href: '/components/button' },
		{ title: 'Blocks', href: '/blocks/dashboard' },
		{ title: 'Pro', href: '/pro', pro: true }
	];
	let menuHover = $state() as HTMLSpanElement;

	// From the address the page was served at, so no domain is written into the site.
	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);
	// Share images are made per docs page; a template's own pages share their template page's one.
	const ogSlug = $derived(
		!page.route.id || page.route.id === '/'
			? 'home'
			: template
				? `pro-${template}`
				: page.route.id.slice(1).replaceAll('/', '-')
	);
	const ogImage = $derived(`${page.url.origin}${asset(`og/${ogSlug}.png` as AssetPath)}`);

	let dark = $state(false);
	let menuOpen = $state(false);
	// Desktop sidebar collapsed to a rail. The attribute on <html> is set before paint (app.html) and
	// drives the CSS; this mirrors it for labels.
	let collapsed = $state(false);
	function toggleSidebar() {
		collapsed = !collapsed;
		if (collapsed) document.documentElement.dataset.sidebar = 'collapsed';
		else delete document.documentElement.dataset.sidebar;
		try {
			localStorage.setItem('sidebar', collapsed ? 'collapsed' : 'expanded');
		} catch {}
	}
	// ⌘K on Apple devices, Ctrl K elsewhere; decided in the browser.
	let modKey = $state('⌘');

	// Every page in the nav, grouped as in the sidebar, plus the theme.
	const commands: Command[] = [
		...nav.flatMap((group) =>
			group.items.map((item) => ({
				id: item.href,
				label: item.title,
				group: group.title,
				keywords: [group.title, ...(item.keywords ?? [])],
				onselect: () => goto(link(item.href))
			}))
		),
		...[true, false].map((toDark) => ({
			id: toDark ? 'theme-dark' : 'theme-light',
			label: toDark ? 'Dark theme' : 'Light theme',
			group: 'Theme',
			keywords: ['appearance', 'color', 'mode'],
			icon: toDark ? Moon02Icon : Sun03Icon,
			onselect: () => setTheme(toDark, null, () => flushSync(() => (dark = toDark)))
		}))
	];
	let toc = $state<{ id: string; text: string; sub: boolean }[]>([]);
	// The section being read (index into toc).
	let current = $state(-1);
	let main = $state() as HTMLElement;
	let panel = $state() as HTMLElement;
	let navHover = $state() as HTMLSpanElement;
	let navCurrent = $state() as HTMLSpanElement;
	let sideNav = $state() as HTMLElement;
	let tocList = $state<HTMLUListElement>();
	let tocCard = $state<HTMLDivElement>();
	let tocOpen = $state(false);
	// How far through the page you are, 0–1: the corner button's ring fills with it.
	let progress = $state(0);
	// Leaving the button for the card crosses empty page; a short grace keeps it open on the way.
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const holdToc = () => clearTimeout(closeTimer);
	const releaseToc = () => {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => (tocOpen = false), 280);
	};
	// Opening the contents, the section being read is in the middle of the card.
	const centerCurrent = () => {
		const a = tocList?.querySelector<HTMLElement>('[aria-current]');
		if (tocCard && a) tocCard.scrollTop = a.offsetTop - tocCard.clientHeight / 2;
	};
	let marker = $state<HTMLSpanElement>();
	let placed = $state(false);
	let untrack: (() => void) | undefined;

	// Mirror what the head script / system already applied, instead of overriding it after paint.
	onMount(() => {
		dark = isDark();
		collapsed = document.documentElement.dataset.sidebar === 'collapsed';
		if (!isApple()) modKey = 'Ctrl ';
		// Tells the page checks the app is live, so they don't wait on a fixed network lull.
		document.documentElement.dataset.hydrated = '';
		return () => untrack?.();
	});

	// Slide and resize the marker onto the current link.
	$effect(() => {
		const first = current;
		const last = current;
		if (!marker || !tocList) return;
		const links = tocList.querySelectorAll<HTMLElement>('li');
		if (first === -1 || !links[first]) {
			marker.style.opacity = '0';
			return;
		}
		const top = links[first].offsetTop;
		const height = links[last].offsetTop + links[last].offsetHeight - top;
		marker.style.transform = `translateY(${top}px) scaleY(${height})`;
		marker.style.opacity = '1';
		// First placement snaps; after that it glides.
		if (!placed) requestAnimationFrame(() => (placed = true));
	});

	// Where you were, per history entry: back, forward and reload return to the same place in the
	// content and in the sidebar. Only the desktop panel needs this; SvelteKit restores the window itself.
	const panelScrolls = () => getComputedStyle(panel).overflowY === 'auto';
	snapshot<{ main: number; nav: number }>({
		capture: () =>
			panel
				? { main: panelScrolls() ? panel.scrollTop : 0, nav: sideNav.scrollTop }
				: { main: 0, nav: 0 },
		restore: ({ main: top, nav: navTop }) => {
			if (!panel) return;
			sideNav.scrollTop = navTop;
			if (!panelScrolls() || !top) return;
			// The page may still be laying out (examples, fonts): try for a few frames until it's tall enough.
			let tries = 30;
			const put = () => {
				panel.scrollTop = top;
				if (Math.abs(panel.scrollTop - top) > 1 && --tries) requestAnimationFrame(put);
			};
			put();
		}
	});

	// "On this page" comes from the page's own h2s and example h3s; the highlight follows what's being read.
	afterNavigate(({ to, type }) => {
		menuOpen = false;
		untrack?.();
		if (!sideNav) {
			toc = [];
			return;
		}
		// The current-page marker glides from the old link to the new one (appears in place on first load).
		const here = sideNav.querySelector<HTMLElement>('a[aria-current="page"]');
		glide(navCurrent, here, true, 240);
		// On desktop the panel, not the window, scrolls: SvelteKit only resets the window, so reset it here.
		// Back, forward and reload are left alone: the snapshot below puts them back where they were.
		if (type !== 'popstate' && type !== 'enter') {
			if (!to?.url.hash) panel.scrollTo(0, 0);
			// The page just chosen stays in view in the sidebar.
			here?.scrollIntoView({ block: 'nearest' });
		}
		untrack?.();
		// Headings inside a live example (a calendar's month) belong to the demo, not the page.
		const headings = [...main.querySelectorAll<HTMLElement>('h2[id], h3[id]')].filter(
			(h) => !h.closest('.preview')
		);
		toc = headings.map((h) => ({ id: h.id, text: h.textContent ?? '', sub: h.tagName === 'H3' }));

		// Current = the last heading past a reading line 30% down the visible area. At the very bottom,
		// the last section wins even when it's too short to reach that line.
		let frame = 0;
		const measure = () => {
			frame = 0;
			// Desktop scrolls the panel; phones scroll the window.
			const scroller =
				getComputedStyle(panel).overflowY === 'auto' ? panel : document.scrollingElement!;
			const view = panel.getBoundingClientRect();
			const top = Math.max(view.top, 0);
			const bottom = Math.min(view.bottom, innerHeight);
			const line = top + (bottom - top) * 0.3;
			let at = headings.length ? 0 : -1;
			headings.forEach((h, i) => {
				if (h.getBoundingClientRect().top <= line) at = i;
			});
			if (scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 2)
				at = headings.length - 1;
			current = at;
			progress = Math.min(
				1,
				scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight)
			);
		};
		const schedule = () => (frame ||= requestAnimationFrame(measure));
		measure();
		// The panel scrolls on desktop, the window on phones; capture catches either.
		addEventListener('scroll', schedule, true);
		addEventListener('resize', schedule);
		untrack = () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule, true);
			removeEventListener('resize', schedule);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Shared by every page; each page sets its own title and description. -->
	<link rel="canonical" href={canonical} />
	<meta property="og:site_name" content="Sina UI" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
	<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
	<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
	<link
		rel="alternate"
		type="text/plain"
		href={resolve('/llms.txt')}
		title="Sina UI for language models"
	/>
	<!-- The faces nearly every page uses; the rest load as needed. -->
	<link
		rel="preload"
		href={asset('fonts/plex/IBMPlexSans-Regular-Latin1.woff2')}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href={asset('fonts/plex/IBMPlexSans-SemiBold-Latin1.woff2')}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href={asset('fonts/plex/IBMPlexMono-Regular-Latin1.woff2')}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

{#snippet links()}
	{#each nav as group (group.title)}
		<p class="group">{group.title}</p>
		<ul>
			{#each group.items as item (item.href)}
				<li>
					<a href={link(item.href)} aria-current={page.route.id === item.href ? 'page' : undefined}>
						{item.title}
						{#if item.pro}<Badge tone="accent" icon={false} class="pro">Pro</Badge>{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/each}
{/snippet}

<!-- ⌘B / Ctrl B collapses and expands the sidebar, as in editors. -->
<svelte:window
	onkeydown={(e) => {
		if (
			e.key.toLowerCase() !== 'b' ||
			!(isApple() ? e.metaKey : e.ctrlKey) ||
			e.altKey ||
			e.shiftKey
		)
			return;
		if ((e.target as HTMLElement).isContentEditable || !matchMedia('(min-width: 1024px)').matches)
			return;
		e.preventDefault();
		toggleSidebar();
	}}
/>

{#if !bare}<a class="skip" href="#content">Skip to content</a>{/if}

{#snippet themeToggle(size: 'sm' | 'md')}
	<Button
		variant="ghost"
		{size}
		square
		aria-label="Dark theme"
		aria-pressed={dark}
		onclick={(e: MouseEvent) => {
			const next = !dark;
			setTheme(next, e.currentTarget as Element, () => flushSync(() => (dark = next)));
		}}
	>
		<Icon icon={dark ? Sun03Icon : Moon02Icon} />
	</Button>
{/snippet}

{#if bare}
	{@render children()}
{:else if landing}
	<header class="bar">
		<a class="brand" href={resolve('/')} aria-label="Sina UI home">
			<img src={favicon} alt="" width="22" height="22" />
			<span>Sina UI</span>
		</a>
		<nav
			class="menu"
			aria-label="Main"
			onpointerover={(e) => {
				if (e.pointerType === 'touch') return;
				glide(menuHover, (e.target as Element).closest<HTMLElement>('a'), true);
			}}
			onpointerleave={() => glide(menuHover, null, false)}
		>
			<span class="menu-hover" aria-hidden="true" bind:this={menuHover}></span>
			{#each menu as item (item.href)}
				<a href={link(item.href)}>
					{item.title}
					{#if item.pro}<Badge tone="accent" icon={false} class="pro">Pro</Badge>{/if}
				</a>
			{/each}
		</nav>
		<div class="bar-end">
			<Button
				variant="ghost"
				size="sm"
				square
				aria-label="Search components"
				aria-keyshortcuts={modKey === '⌘' ? 'Meta+K' : 'Control+K'}
				onclick={() => (search.open = true)}
			>
				<Icon icon={Search01Icon} size={16} />
			</Button>
			{@render themeToggle('sm')}
			<Button size="sm" href={resolve('/docs')} class="bar-cta">Get started</Button>
			<Button
				variant="ghost"
				size="sm"
				square
				class="bar-menu"
				aria-label="Open navigation"
				onclick={() => (menuOpen = true)}
			>
				<Icon icon={Menu01Icon} />
			</Button>
		</div>
	</header>
	<main id="content" class="landing" tabindex="-1">
		{@render children()}
	</main>
{:else}
	<!-- Phones only: the drawer needs a way to open. Desktop has no header. -->
	<header class="top">
		<Button variant="ghost" square aria-label="Open navigation" onclick={() => (menuOpen = true)}>
			<Icon icon={Menu01Icon} />
		</Button>
		<Button
			variant="ghost"
			square
			aria-label="Search components"
			onclick={() => (search.open = true)}
		>
			<Icon icon={Search01Icon} />
		</Button>
		{@render themeToggle('md')}
	</header>

	<div class={['shell', tocOpen && 'toc-open']}>
		<div class="side">
			<header>
				<a class="side-brand" href={resolve('/')} aria-label="Sina UI home">
					<img src={favicon} alt="" width="20" height="20" />
					<span class="side-label">Sina UI</span>
				</a>
			</header>
			<nav
				id="side-nav"
				bind:this={sideNav}
				class="side-nav"
				{@attach scrollEdges}
				data-fade
				aria-label="Documentation"
				onpointerover={(e) => {
					// The dropdown's hover: one pill glides between links (mouse only).
					if (e.pointerType === 'touch') return;
					glide(navHover, (e.target as Element).closest<HTMLElement>('li a'), true);
				}}
				onpointerleave={() => glide(navHover, null, false)}
			>
				<span class="nav-current" aria-hidden="true" bind:this={navCurrent}></span>
				<span class="nav-hover" aria-hidden="true" bind:this={navHover}></span>
				{@render links()}
			</nav>
			<!-- One row at the bottom: theme, search (⌘K) and the collapse toggle. -->
			<div class="side-foot">
				{@render themeToggle('sm')}
				<button
					type="button"
					class="side-search"
					aria-label="Search components"
					onclick={() => (search.open = true)}
				>
					<Icon icon={Search01Icon} size={15} />
					<kbd class="side-label" aria-hidden="true">{modKey}K</kbd>
				</button>
				<Button
					variant="ghost"
					size="sm"
					square
					class="side-toggle"
					aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					aria-expanded={!collapsed}
					aria-controls="side-nav"
					aria-keyshortcuts={modKey === '⌘' ? 'Meta+B' : 'Control+B'}
					title="{collapsed ? 'Expand' : 'Collapse'} sidebar ({modKey}B)"
					onclick={toggleSidebar}
				>
					<Icon icon={SidebarLeftIcon} />
				</Button>
			</div>
		</div>

		<!-- White panel for the content; the frame around it is the gray page. -->
		<div class="panel" bind:this={panel} {@attach scrollEdges} data-fade-over>
			<main id="content" tabindex="-1" bind:this={main}>
				{@render children()}
			</main>
		</div>

		<!-- "On this page": a round button in the corner whose ring fills as you read.
		     Pointing at it, focusing it or pressing it opens the contents, which grow out of the button. -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<aside
			class="toc"
			aria-label="On this page"
			onpointerenter={(e) => {
				if (e.pointerType === 'touch') return;
				holdToc();
				if (!tocOpen) centerCurrent();
				tocOpen = true;
			}}
			onpointerleave={(e) => e.pointerType !== 'touch' && releaseToc()}
			onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && (tocOpen = false)}
			onkeydown={(e) => {
				if (e.key !== 'Escape' || !tocOpen) return;
				tocOpen = false;
				e.currentTarget.querySelector<HTMLElement>('.rail')?.focus();
			}}
		>
			{#if toc.length}
				<button
					type="button"
					class="rail"
					aria-label="On this page"
					aria-expanded={tocOpen}
					onclick={() => {
						tocOpen = !tocOpen;
						if (tocOpen) centerCurrent();
					}}
				>
					<!-- A ring open at the bottom that fills as you read, with three dots in the opening. -->
					<svg viewBox="0 0 40 40" aria-hidden="true">
						<path class="track" d="M11.4 32.29 A15 15 0 1 1 28.6 32.29" />
						<path
							class="fill"
							d="M11.4 32.29 A15 15 0 1 1 28.6 32.29"
							pathLength="1"
							style:stroke-dashoffset={1 - progress}
						/>
						<circle cx="16.4" cy="33.4" r="1.25" />
						<circle cx="20" cy="34.3" r="1.25" />
						<circle cx="23.6" cy="33.4" r="1.25" />
					</svg>
				</button>
				<div class="card" bind:this={tocCard} {@attach scrollEdges} data-fade>
					<p class="group">On this page</p>
					<ul bind:this={tocList}>
						{#each toc as t, i (t.id)}
							<li class:sub={t.sub} style:--i={Math.min(i, 12)}>
								<a href="#{t.id}" aria-current={i === current ? 'true' : undefined}>{t.text}</a>
							</li>
						{/each}
						<!-- One bar that slides and resizes onto the section being read. -->
						<span class="marker" class:placed aria-hidden="true" bind:this={marker}></span>
					</ul>
				</div>
			{/if}
		</aside>
	</div>
{/if}

<Toaster />

<!-- On a template's own pages, ⌘K belongs to the template's search, not the docs'. -->
<CommandPalette
	{commands}
	shortcut={!bare}
	bind:open={search.open}
	label="Search components"
	placeholder="Search components…"
/>

<Dialog bind:open={menuOpen} side="start" title="Sina UI">
	<nav class="sheet-nav" aria-label="Documentation">{@render links()}</nav>
</Dialog>

<style>
	.skip {
		position: fixed;
		inset-block-start: 0.5rem;
		inset-inline-start: 0.5rem;
		z-index: 20;
		padding: 0.5rem 0.875rem;
		border-radius: var(--ui-radius);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-weight: 500;
		translate: 0 -200%;
	}
	.skip:focus-visible {
		translate: 0 0;
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}

	.top {
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		block-size: 3.5rem;
		padding-inline: 0.5rem;
		background: color-mix(in srgb, var(--page) 85%, transparent);
		backdrop-filter: blur(12px);
	}
	a:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}

	.shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.panel {
		min-inline-size: 0;
		min-block-size: calc(100dvh - 3.5rem);
		background: var(--ui-surface);
	}
	main {
		min-inline-size: 0;
		padding: 2rem 1rem 6rem;
	}
	main:focus {
		outline: none;
	}
	main.landing {
		padding: 0 0 4rem;
	}
	:global(.badge.pro) {
		margin-inline-start: 0.375rem;
		vertical-align: 0.0625rem;
	}

	/* Landing: brand, the main menu in a soft pill (one highlight glides between links), actions. */
	.bar {
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		block-size: 4rem;
		padding-inline: max(1rem, (100% - 76rem) / 2);
		background: color-mix(in srgb, var(--ui-bg) 85%, transparent);
		backdrop-filter: blur(12px);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		justify-self: start;
		color: var(--ui-fg);
		font-weight: 600;
		text-decoration: none;
	}
	.menu {
		position: relative;
		display: flex;
		gap: 0.125rem;
		padding: 0.25rem;
		/* Concentric with the links inside: their radius plus this padding. */
		border-radius: calc(var(--ui-radius-control) + 0.25rem);
		background: var(--ui-subtle);
	}
	.menu a {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		border-radius: var(--ui-radius-control);
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: color var(--ui-dur-press) ease;
	}
	@media (hover: hover) {
		.menu a:hover {
			color: var(--ui-fg);
		}
	}
	.menu-hover {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--ui-dur-exit) ease;
	}
	.bar-end {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.25rem;
	}
	.bar-end :global(.bar-cta) {
		margin-inline-start: 0.5rem;
	}
	/* Phones: the menu folds into the navigation sheet. */
	@media (width < 48rem) {
		.bar {
			grid-template-columns: 1fr auto;
		}
		.menu,
		.bar-end :global(.bar-cta) {
			display: none;
		}
	}
	@media (width >= 48rem) {
		.bar-end :global(.bar-menu) {
			display: none;
		}
	}
	.side,
	.toc {
		display: none;
	}

	/* Hierarchy by weight and color: dark headings over lighter links, and more space above a group
	   than inside it, so each heading plainly owns the links under it. */
	.group {
		margin: 1.75rem 0 0.25rem;
		padding-inline: 0.75rem;
		color: var(--ui-fg);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.group:first-child {
		margin-block-start: 0;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li a {
		/* Above the gliding hover pill. */
		position: relative;
		display: block;
		padding: 0.375rem 0.75rem;
		border-radius: var(--ui-radius);
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-decoration: none;
		transition: color var(--ui-dur-press) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		li a:hover {
			color: var(--ui-fg);
		}
	}
	li a[aria-current='page'] {
		/* Emerald pulled 20% toward the text color: 4.5:1+ on the gray highlight (plain emerald was 4.18). */
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
		font-weight: 500;
	}
	/* Sidebar: one marker (fill + edge bar) glides to the current link. The phone drawer closes on
	   navigation, so there each link simply marks itself. */
	.sheet-nav li a[aria-current='page'] {
		background: var(--ui-hover);
	}
	.nav-current {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius);
		background: var(--ui-hover);
		opacity: 0;
		pointer-events: none;
	}
	/* A short brand bar on the sidebar's outer edge (as in tavora), rounded toward the link. */
	.nav-current::before,
	.sheet-nav li a[aria-current='page']::before {
		content: '';
		position: absolute;
		inset-block: 0.5rem;
		inset-inline-start: calc(-1 * var(--edge));
		inline-size: 3px;
		border-start-end-radius: 4px;
		border-end-end-radius: 4px;
		background: var(--ui-accent);
	}
	/* Distance from the link to its container's edge: the sidebar's and the sheet's inline padding. */
	.side {
		--edge: 1rem;
	}
	/* Pulled out by the links' own padding, so their text lines up with the drawer title. */
	.sheet-nav {
		--edge: 0.75rem;
		margin-inline: -0.75rem;
	}
	@media (forced-colors: active) {
		.nav-current::before,
		.sheet-nav li a[aria-current='page']::before {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
	.toc ul {
		position: relative;
	}
	/* The corner button: round, lifted off the page. */
	.rail {
		position: relative;
		display: block;
		color: var(--ui-fg);
		inline-size: 2.75rem;
		block-size: 2.75rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 50%;
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		cursor: pointer;
		transition:
			scale var(--ui-dur-press) var(--ui-ease-out),
			opacity var(--ui-dur) var(--ui-ease-out);
	}
	.rail:active {
		scale: 0.94;
	}
	.rail:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.rail svg {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
	}
	.rail path {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
	}
	.rail .track {
		stroke: color-mix(in srgb, var(--ui-muted) 30%, transparent);
	}
	.rail .fill {
		stroke: var(--ui-accent);
		stroke-dasharray: 1;
		transition: stroke-dashoffset var(--ui-dur) var(--ui-ease-out);
	}
	.rail circle {
		fill: var(--ui-muted);
	}
	/* Genie: the card grows out of the button: squeezed narrow and short at the button's corner, it
	   stretches up and out on the spring, and pulls back into the button quickly when it closes. */
	.card {
		position: absolute;
		inset-block-end: 100%;
		inset-inline-end: 0;
		box-sizing: border-box;
		inline-size: 17rem;
		max-block-size: calc(100dvh - 7rem);
		overflow: auto;
		overscroll-behavior: contain;
		padding: 1rem 0.75rem;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		opacity: 0;
		visibility: hidden;
		transform: translateY(1.5rem) scale(0.12, 0.08) skewX(-6deg);
		transform-origin: bottom right;
		pointer-events: none;
		transition:
			opacity 160ms var(--ui-ease-out),
			transform 220ms var(--ui-ease-exit),
			visibility 0s 220ms;
	}
	.card:dir(rtl) {
		transform-origin: bottom left;
	}
	.toc-open .card {
		opacity: 1;
		visibility: visible;
		transform: none;
		pointer-events: auto;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			transform var(--ui-dur-spring) var(--ui-ease-spring),
			visibility 0s;
	}
	.card li {
		opacity: 0;
		translate: 0 0.375rem;
		transition:
			opacity var(--ui-dur-exit) ease,
			translate var(--ui-dur-exit) ease;
	}
	.toc-open .card li {
		opacity: 1;
		translate: 0 0;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur) var(--ui-ease-enter);
		transition-delay: calc(80ms + var(--i) * 18ms);
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.toc-open .card {
			transform: none;
		}
		.card li,
		.toc-open .card li {
			translate: 0 0;
			transition-delay: 0s;
		}
	}
	.toc li a {
		padding-block: 0.25rem;
		font-size: 0.875rem;
		border-radius: 0;
	}
	.toc li.sub a {
		padding-inline-start: 1.5rem;
		font-size: 0.8125rem;
	}
	.toc li a[aria-current='true'] {
		color: var(--ui-accent);
	}
	/* 1px tall, scaled to the current link: transform only, so it stays smooth while you scroll. */
	.marker {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 2px;
		block-size: 1px;
		background: var(--ui-accent);
		transform-origin: top;
		opacity: 0;
		pointer-events: none;
	}
	.marker.placed {
		transition:
			transform 300ms var(--ui-ease-out),
			opacity 200ms ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.marker.placed {
			transition: opacity 200ms ease;
		}
		.shell {
			transition: none;
		}
	}
	@media (forced-colors: active) {
		.marker {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
	.sheet-nav {
		margin-block-start: 0.5rem;
	}
	.nav-hover {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
	}

	@media (min-width: 1024px) {
		.top {
			display: none;
		}
		/* App shell: the page never scrolls. The white panel is inset with the same radius on every
		   corner and scrolls its own content, which clips cleanly at those corners. */
		:global(body:has(.shell)) {
			overflow: hidden;
		}
		.shell {
			grid-template-columns: 15rem minmax(0, 1fr);
			block-size: 100dvh;
			transition: grid-template-columns 300ms var(--ui-ease-drawer);
		}
		/* Collapsed to a rail: just the toggle, search and theme, as icons. */
		:global(html[data-sidebar='collapsed']) .shell {
			grid-template-columns: 3.25rem minmax(0, 1fr);
		}
		:global(html[data-sidebar='collapsed']) .side-foot {
			flex-direction: column;
			padding-inline: 0.5rem;
		}
		:global(html[data-sidebar='collapsed']) .side-foot > :global(.side-toggle) {
			margin-inline-start: 0;
		}
		:global(html[data-sidebar='collapsed']) .side-label {
			display: none;
		}
		:global(html[data-sidebar='collapsed']) .side-nav {
			visibility: hidden;
			opacity: 0;
		}
		/* A slim, even gap on every free side of the panel. */
		.panel {
			min-block-size: 0;
			margin-block: 0.25rem;
			margin-inline-end: 0.25rem;
			border-radius: 1rem;
			overflow: auto;
			overscroll-behavior: contain;
			scroll-padding-block-start: 1.5rem;
			box-shadow:
				0 1px 3px rgb(15 23 42 / 0.04),
				0 12px 32px -16px rgb(15 23 42 / 0.12);
		}
		/* Links scroll; the theme switch stays pinned at the bottom. */
		.side {
			display: flex;
			flex-direction: column;
			min-block-size: 0;
			overflow: hidden;
		}
		.side-nav {
			transition:
				opacity 200ms var(--ui-ease-out),
				visibility 200ms;
		}
		.side-nav {
			position: relative;
			flex: 1;
			min-block-size: 0;
			overflow: auto;
			padding: 1rem 1rem 2rem;
		}
		/* Nothing above the first heading: no gap to make. */
		.side-nav > :global(.group:first-of-type) {
			margin-block-start: 0;
		}
		.side-brand {
			display: flex;
			flex: none;
			align-items: center;
			gap: 0.5rem;
			padding: 1rem 1.25rem 0.25rem;
			color: var(--ui-fg);
			font-weight: 600;
			text-decoration: none;
		}
		:global(html[data-sidebar='collapsed']) .side-brand {
			justify-content: center;
			padding-inline: 0.5rem;
		}
		.side-foot {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			padding: 0.5rem 0.75rem 0.75rem;
		}
		/* Theme and search on the left; the sidebar toggle keeps to the right. */
		.side-foot > :global(.side-toggle) {
			margin-inline-start: auto;
		}
		.side-search {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			block-size: 2rem;
			padding-block: 0;
			padding-inline: 0.5rem 0.375rem;
			border: 0;
			border-radius: var(--ui-radius);
			background: var(--ui-subtle);
			color: var(--ui-muted);
			font: 0.75rem/1 var(--ui-font);
			cursor: pointer;
			transition:
				background-color var(--ui-dur-press) ease,
				color var(--ui-dur) ease;
		}
		:global(html[data-sidebar='collapsed']) .side-search {
			justify-content: center;
			inline-size: 2rem;
			padding: 0;
		}
		.side-search kbd {
			padding: 0.2rem 0.3rem;
			border-radius: calc(var(--ui-radius) * 0.6);
			background: var(--ui-surface);
			font: 500 0.6875rem/1 var(--ui-font);
		}
		.side-search:hover {
			background: var(--ui-hover);
			color: var(--ui-fg);
		}
		.side-search:focus-visible {
			outline: var(--ui-ring-width) solid var(--ui-ring);
			outline-offset: var(--ui-ring-offset);
		}
		main {
			padding-inline: 3rem;
		}
	}
	@media (min-width: 1024px) {
		/* Fixed in the corner, over the page: nothing in the layout moves when it opens. The padding
		   keeps the pointer inside it while crossing from the button up to the card. */
		.toc {
			position: fixed;
			inset-block-end: 1.25rem;
			inset-inline-end: 1.25rem;
			z-index: 15;
			display: block;
			padding-block-start: 0.625rem;
		}
	}
</style>
