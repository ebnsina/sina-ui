<script lang="ts">
	import { pop, reflow } from '#lib/ui/motion.js';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { onMount, tick } from 'svelte';
	import {
		Delete02Icon,
		PencilEdit02Icon,
		Search01Icon,
		SidebarLeftIcon
	} from '@hugeicons/core-free-icons';
	import { localStoragePersistence, type ConnectionAdapter } from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import { load, save } from '#lib/ui/stored.js';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import SearchField from '#lib/ui/SearchField.svelte';
	import Chat from './Chat.svelte';

	interface Props {
		connection: ConnectionAdapter;
		/** Questions offered when a conversation is empty. */
		suggestions?: string[];
		/** Prefix for what's saved in this browser, so two assistants on one site keep apart. */
		storageKey?: string;
		class?: string;
	}

	let {
		connection,
		suggestions = [],
		storageKey = 'sinaui-chat',
		class: className
	}: Props = $props();

	type Thread = { id: string; title: string; updated: number };
	// svelte-ignore state_referenced_locally
	const persistence = localStoragePersistence({ keyPrefix: `${storageKey}:` });
	// svelte-ignore state_referenced_locally
	const listKey = `${storageKey}-threads`;

	let threads = $state<Thread[]>([]);
	let active = $state('new');
	let loaded = false;
	onMount(() => {
		const saved = load(listKey, []);
		if (Array.isArray(saved)) threads = saved;
		active = threads[0]?.id ?? crypto.randomUUID();
		loaded = true;
	});
	$effect(() => {
		const list = $state.snapshot(threads);
		if (loaded) save(listKey, list);
	});

	const current = $derived(threads.find((t) => t.id === active));
	// The first message names the conversation; each later one moves it to the top.
	function sent(text: string) {
		const rest = threads.filter((t) => t.id !== active);
		const title = current?.title ?? (text.slice(0, 60) || 'Attachment');
		threads = [{ id: active, title, updated: Date.now() }, ...rest];
	}
	function start() {
		active = crypto.randomUUID();
		if (narrow) drawer = false;
	}
	function open(id: string) {
		active = id;
		if (narrow) drawer = false;
	}
	function remove(t: Thread) {
		threads = threads.filter((x) => x.id !== t.id);
		try {
			persistence.removeItem(t.id);
		} catch {}
		announce(`${t.title} deleted`);
		if (t.id === active) start();
	}

	// Grouped by age, as chat apps do.
	const groups = $derived.by(() => {
		const day = 86_400_000;
		const midnight = new Date().setHours(0, 0, 0, 0);
		const by: [string, Thread[]][] = [
			['Today', []],
			['Previous 7 days', []],
			['Older', []]
		];
		for (const t of threads)
			by[t.updated >= midnight ? 0 : t.updated >= midnight - 7 * day ? 1 : 2][1].push(t);
		return by.filter(([, list]) => list.length);
	});

	let query = $state('');
	let searchBox = $state<HTMLInputElement>();

	// Wide, the list sits beside the chat and folds to a rail of icons; narrow, it slides over it.
	let width = $state(0);
	const narrow = $derived(width > 0 && width < 700);
	let pinned = $state(true);
	let drawer = $state(false);
	const showing = $derived(narrow ? drawer : pinned);
	const toggle = () => (narrow ? (drawer = !drawer) : (pinned = !pinned));
	// The rail's search opens the list with the search field ready.
	async function find() {
		pinned = true;
		await tick();
		searchBox?.focus();
	}
</script>

<div
	class={['assistant', narrow && 'narrow', showing && 'showing', className]}
	bind:clientWidth={width}
>
	{#if !narrow && !showing}
		<!-- Folded: a rail of icons, as in current chat apps. -->
		<nav class="rail" aria-label="Conversations">
			<Button
				variant="ghost"
				size="sm"
				square
				aria-label="Show conversations"
				aria-expanded="false"
				aria-controls="{storageKey}-list"
				onclick={toggle}><Icon icon={SidebarLeftIcon} size={18} /></Button
			>
			<Button variant="ghost" size="sm" square aria-label="New chat" onclick={start}
				><Icon icon={PencilEdit02Icon} size={17} /></Button
			>
			<Button variant="ghost" size="sm" square aria-label="Search conversations" onclick={find}
				><Icon icon={Search01Icon} size={17} /></Button
			>
		</nav>
	{/if}
	<aside id="{storageKey}-list" class="threads" aria-label="Conversations" inert={!showing}>
		<div class="top">
			<Button
				variant="ghost"
				size="sm"
				square
				aria-label="Hide conversations"
				aria-expanded={showing}
				aria-controls="{storageKey}-list"
				onclick={toggle}><Icon icon={SidebarLeftIcon} size={18} /></Button
			>
			<Button variant="ghost" size="sm" square aria-label="New chat" onclick={start}
				><Icon icon={PencilEdit02Icon} size={17} /></Button
			>
		</div>
		<div class="search">
			<SearchField
				label="Search conversations"
				placeholder="Search"
				bind:value={query}
				bind:element={searchBox}
			/>
		</div>
		<nav class="list" aria-label="Past conversations" {@attach scrollEdges} data-fade>
			{#each groups as [label, list] (label)}
				<p class="group">{label}</p>
				<ul>
					{#each list as t (t.id)}
						<li
							class={[t.id === active && 'current']}
							animate:reflow
							out:pop={{ start: 0.9, duration: 160 }}
						>
							<button
								type="button"
								class="open"
								aria-current={t.id === active ? 'page' : undefined}
								onclick={() => open(t.id)}>{t.title}</button
							>
							<Button
								variant="ghost"
								size="sm"
								square
								class="delete"
								aria-label="Delete {t.title}"
								onclick={() => remove(t)}
							>
								<Icon icon={Delete02Icon} size={15} />
							</Button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="none">
					{query.trim()
						? 'No conversations match.'
						: 'Your conversations will be kept here, in this browser.'}
				</p>
			{/each}
		</nav>
	</aside>
	{#if narrow && drawer}
		<button
			type="button"
			class="scrim"
			aria-label="Close conversations"
			onclick={() => (drawer = false)}
		></button>
	{/if}

	{#key active}
		<Chat
			{connection}
			{suggestions}
			threadId={active}
			{persistence}
			attachments
			title={current?.title ?? 'New chat'}
			onsend={sent}
			onnew={start}
		>
			{#snippet header(newChat, busy)}
				<div class="bar">
					{#if narrow}
						<Button
							variant="ghost"
							size="sm"
							square
							aria-label="Show conversations"
							aria-expanded={showing}
							aria-controls="{storageKey}-list"
							onclick={toggle}
						>
							<Icon icon={SidebarLeftIcon} size={18} />
						</Button>
					{/if}
					<h2>{current?.title ?? 'New chat'}</h2>
				</div>
				{#if narrow}
					<Button
						variant="ghost"
						size="sm"
						square
						aria-label="New chat"
						disabled={busy}
						onclick={newChat}
					>
						<Icon icon={PencilEdit02Icon} size={16} />
					</Button>
				{/if}
			{/snippet}
		</Chat>
	{/key}
</div>

<style>
	/* One card: the list and the chat share it. Concentric corners: 1.75rem card, 1rem list panel
	   inset by 0.75rem. */
	.assistant {
		position: relative;
		display: grid;
		grid-template-columns: 3.25rem minmax(0, 1fr);
		inline-size: 100%;
		block-size: 38rem;
		max-block-size: 85dvh;
		overflow: hidden;
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		transition: grid-template-columns 300ms var(--ui-ease-drawer);
	}
	.assistant.showing:not(.narrow) {
		grid-template-columns: 16rem minmax(0, 1fr);
	}
	.assistant.narrow {
		grid-template-columns: minmax(0, 1fr);
	}
	/* Chat always in the last column, whether the rail or the list is beside it. */
	.assistant > :global(.chat) {
		grid-column: -2;
		grid-row: 1;
	}
	.rail {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding-block: 0.75rem;
		padding-inline-start: 0.5rem;
	}
	.top {
		display: flex;
		justify-content: space-between;
		margin-inline: 0.125rem;
	}
	.search {
		min-inline-size: 0;
	}
	.search :global(.field) {
		min-inline-size: 0;
	}
	/* The field's label is for screen readers; the placeholder and icon say it here. */
	.search :global(label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* Doubled class: beats the chat's own card styles regardless of stylesheet order. */
	.assistant :global(.chat.chat) {
		block-size: 100%;
		max-block-size: none;
		border-radius: 0;
		background: none;
		box-shadow: none;
	}
	/* No hairline under the header: it would stop at the rail and leave the card lopsided. */
	.assistant :global(.chat.chat > header) {
		box-shadow: none;
	}
	.threads {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-inline-size: 0;
		min-block-size: 0;
		margin-block: 0.75rem;
		margin-inline: 0.75rem 0.25rem;
		padding: 0.75rem 0.5rem;
		overflow: hidden;
		border-radius: 1rem;
		background: var(--ui-subtle);
		transition: opacity 200ms var(--ui-ease-out);
	}
	.assistant:not(.showing) .threads {
		visibility: hidden;
		opacity: 0;
	}
	.list {
		flex: 1;
		min-block-size: 0;
		overflow-y: auto;
	}
	.group {
		margin: 0.75rem 0.5rem 0.25rem;
		color: var(--ui-muted);
		font: 600 0.6875rem/1.2 var(--ui-font);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}
	ul {
		display: grid;
		gap: 1px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
		display: flex;
		align-items: center;
		border-radius: var(--ui-radius);
		transition: background var(--ui-dur) var(--ui-ease-out);
	}
	li:hover,
	li:focus-within {
		background: var(--ui-hover);
	}
	li.current {
		background: var(--ui-surface);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
	}
	.open {
		flex: 1;
		min-inline-size: 0;
		padding-block: 0.5rem;
		padding-inline: 0.625rem 0.5rem;
		overflow: hidden;
		border: 0;
		border-radius: inherit;
		background: none;
		color: var(--ui-fg);
		font: 0.8125rem/1.3 var(--ui-font);
		text-align: start;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
	}
	.open:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: calc(var(--ui-ring-offset) * -1);
	}
	/* Delete shows on hover or focus, so the list reads as titles. */
	li :global(.delete) {
		flex: none;
		margin-inline-end: 0.125rem;
		opacity: 0;
		transition: opacity var(--ui-dur) ease;
	}
	li:hover :global(.delete),
	li:focus-within :global(.delete) {
		opacity: 1;
	}
	@media (hover: none) {
		li :global(.delete) {
			opacity: 1;
		}
	}
	.none {
		margin: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		line-height: 1.45;
	}
	/* A button's height, so the title centers on the rail's (or the list's) first row of buttons. */
	.bar {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-inline-size: 0;
		min-block-size: 2rem;
	}
	.showing:not(.narrow) :global(.chat.chat > header) {
		padding-block-start: 1.5rem;
	}
	.narrow .bar {
		margin-inline-start: -0.625rem;
	}
	.bar h2 {
		overflow: hidden;
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Narrow: the list slides over the chat from the side. */
	.narrow .threads {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		z-index: 3;
		inline-size: min(17rem, 80%);
		margin: 0.5rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-overlay);
		/* Off past the start edge: the left, or the right right to left. */
		transform: translateX(calc((-100% - 1rem) * var(--dir, 1)));
		transition:
			transform 300ms var(--ui-ease-drawer),
			opacity 200ms var(--ui-ease-out);
	}
	.narrow .threads:dir(rtl) {
		--dir: -1;
	}
	.narrow.showing .threads {
		transform: none;
	}
	.scrim {
		position: absolute;
		inset: 0;
		z-index: 2;
		border: 0;
		background: var(--ui-backdrop);
		animation: fade 200ms var(--ui-ease-out);
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.assistant,
		.threads {
			transition: none;
		}
	}
</style>
