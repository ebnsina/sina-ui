<script lang="ts" module>
	export type Notification = {
		id: string;
		/** Who did it; their name is shown in bold before the text. */
		actor: { name: string; src?: string };
		/** What happened, after the name: "finished copying the Almagest." */
		text: string;
		at: Date | number | string;
		read?: boolean;
		/** Counts under "Mentions". */
		mention?: boolean;
		muted?: boolean;
	};
</script>

<script lang="ts">
	import {
		AlertCircleIcon,
		InboxIcon,
		Mail01Icon,
		MailOpen01Icon,
		Notification01Icon,
		NotificationOff01Icon,
		TickDouble02Icon
	} from '@hugeicons/core-free-icons';
	import { announce } from '#lib/ui/announce.js';
	import Avatar from '#lib/ui/Avatar.svelte';
	import Button from '#lib/ui/Button.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { pop, reflow } from '#lib/ui/motion.js';
	import { now } from '#lib/ui/now.svelte.js';
	import { optimistic } from '#lib/ui/optimistic.js';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	interface Props {
		/** Newest first. Bindable: reading and muting update it. */
		items: Notification[];
		title?: string;
		loading?: boolean;
		/** A plain-language message when loading failed; shows a Try again button calling onretry. */
		error?: string;
		onretry?: () => void;
		/** Opened: it's marked read first. */
		onopen?: (item: Notification) => void;
		/** Save read state. If it throws, the change is put back and the person is told. */
		onread?: (ids: string[], read: boolean) => Promise<unknown> | unknown;
		onmute?: (item: Notification, muted: boolean) => Promise<unknown> | unknown;
		/** Older ones exist: shows "Load more", which awaits onmore. */
		more?: boolean;
		onmore?: () => Promise<unknown> | unknown;
		class?: string;
	}

	let {
		items = $bindable(),
		title = 'Notifications',
		loading = false,
		error,
		onretry,
		onopen,
		onread,
		onmute,
		more = false,
		onmore,
		class: className
	}: Props = $props();

	const uid = $props.id();
	let filter = $state<'all' | 'unread' | 'mentions'>('all');
	let active = $state<string>();
	let loadingMore = $state(false);
	let list = $state<HTMLElement>();

	const unread = $derived(items.filter((n) => !n.read).length);
	const shown = $derived(
		items.filter((n) => (filter === 'unread' ? !n.read : filter === 'mentions' ? n.mention : true))
	);

	// Today / Yesterday / Earlier, from the reader's calendar and words.
	const day = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	const ago = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'short' });
	const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
	const midnight = (t: number) => {
		const d = new Date(t);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	};
	function groupOf(at: Notification['at']) {
		const days = Math.round((midnight(now()) - midnight(new Date(at).getTime())) / 86400000);
		return days <= 0
			? cap(day.format(0, 'day'))
			: days === 1
				? cap(day.format(-1, 'day'))
				: 'Earlier';
	}
	const groups = $derived.by(() => {
		const out: { label: string; items: Notification[] }[] = [];
		for (const n of shown) {
			const label = groupOf(n.at);
			if (out.at(-1)?.label !== label) out.push({ label, items: [] });
			out.at(-1)!.items.push(n);
		}
		return out;
	});
	function relative(at: Notification['at']) {
		const s = Math.round((new Date(at).getTime() - now()) / 1000);
		const a = Math.abs(s);
		if (a < 45) return ago.format(0, 'second');
		if (a < 3600) return ago.format(Math.round(s / 60), 'minute');
		if (a < 86400) return ago.format(Math.round(s / 3600), 'hour');
		return ago.format(Math.round(s / 86400), 'day');
	}

	// New arrivals (not the first load) are announced, politely.
	let seen: Set<string> | undefined;
	$effect(() => {
		const ids = items.map((n) => n.id);
		if (seen) {
			const fresh = items.filter((n) => !seen!.has(n.id));
			if (fresh.length === 1) announce(`New: ${fresh[0].actor.name} ${fresh[0].text}`);
			else if (fresh.length > 1) announce(`${fresh.length} new notifications`);
		}
		seen = new Set(ids);
	});

	async function setRead(targets: Notification[], read: boolean) {
		const was = targets.map((n) => n.read);
		const ok = await optimistic(
			() => targets.forEach((n) => (n.read = read)),
			onread &&
				(() =>
					onread(
						targets.map((n) => n.id),
						read
					)),
			() => targets.forEach((n, i) => (n.read = was[i]))
		);
		if (!ok) toast.error(read ? 'Couldn’t mark as read. Try again.' : 'Couldn’t mark as unread.');
		return ok;
	}
	// aria-disabled, not disabled, when there's nothing to mark: focus stays on it instead of dropping.
	async function markAll() {
		const targets = items.filter((n) => !n.read);
		if (!targets.length || loading || error) return;
		if (await setRead(targets, true)) announce('All marked as read');
	}
	async function mute(n: Notification) {
		const to = !n.muted;
		const ok = await optimistic(
			() => (n.muted = to),
			onmute && (() => onmute(n, to)),
			() => (n.muted = !to)
		);
		if (ok) announce(to ? 'Muted' : 'Unmuted');
		else toast.error('Couldn’t change that. Try again.');
	}
	function open(n: Notification) {
		active = n.id;
		if (!n.read) setRead([n], true);
		onopen?.(n);
	}
	async function loadMore() {
		if (loadingMore) return;
		loadingMore = true;
		try {
			await onmore?.();
		} catch {
			toast.error('Couldn’t load older notifications. Try again.');
		}
		loadingMore = false;
	}

	// One row in the Tab order (roving); arrows move between rows, as in React Aria's GridList.
	const focusable = $derived(shown.some((n) => n.id === active) ? active : shown[0]?.id);
	function onkeydown(e: KeyboardEvent) {
		const rows = [...(list?.querySelectorAll<HTMLElement>('button.row') ?? [])];
		const i = rows.indexOf(e.target as HTMLElement);
		if (i === -1) return;
		const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: rows.length - 1 }[e.key];
		if (to === undefined) return;
		e.preventDefault();
		const row = rows[Math.max(0, Math.min(rows.length - 1, to))];
		active = row.dataset.id;
		row.focus();
	}
</script>

<section class={['inbox', className]} aria-label={title}>
	<header>
		<span class="title" aria-hidden="true">{title}</span>
		<Button
			variant="ghost"
			size="sm"
			onclick={markAll}
			aria-disabled={!unread || loading || !!error || undefined}
		>
			<Icon icon={TickDouble02Icon} size={16} /> Mark all as read
		</Button>
	</header>
	<Segmented
		label="Show"
		hideLabel
		options={[
			{ value: 'all', label: 'All' },
			{ value: 'unread', label: unread ? `Unread (${unread})` : 'Unread' },
			{ value: 'mentions', label: 'Mentions' }
		]}
		bind:value={filter}
		class="filter"
	/>

	{#if loading}
		<ul class="list" aria-busy="true" aria-label="Loading notifications">
			{#each [0, 1, 2, 3] as i (i)}
				<li class="skeleton">
					<Skeleton circle width="2rem" height="2rem" />
					<span class="lines"><Skeleton lines={2} /></span>
				</li>
			{/each}
		</ul>
	{:else if error}
		<EmptyState title="Notifications didn’t load" icon={AlertCircleIcon} level={3}>
			<p>{error}</p>
			{#snippet actions()}
				{#if onretry}<Button variant="secondary" onclick={onretry}>Try again</Button>{/if}
			{/snippet}
		</EmptyState>
	{:else if !shown.length}
		<EmptyState
			level={3}
			icon={filter === 'unread' ? TickDouble02Icon : InboxIcon}
			title={filter === 'unread'
				? 'You’re all caught up'
				: filter === 'mentions'
					? 'No mentions yet'
					: 'No notifications yet'}
		>
			<p>
				{filter === 'mentions'
					? 'When someone names you, it shows up here.'
					: 'New activity will show up here.'}
			</p>
		</EmptyState>
	{:else}
		<div class="scroll" bind:this={list} {@attach scrollEdges} data-fade>
			{#each groups as g, gi (g.label)}
				<p class="group" id="{uid}-g{gi}">{g.label}</p>
				<ul class="list" aria-labelledby="{uid}-g{gi}">
					{#each g.items as n (n.id)}
						<li class={['item', !n.read && 'unread']} animate:reflow in:pop out:pop>
							<button
								type="button"
								class="row"
								data-id={n.id}
								tabindex={n.id === focusable ? 0 : -1}
								onclick={() => open(n)}
								{onkeydown}
								onfocus={() => (active = n.id)}
							>
								<Avatar name={n.actor.name} src={n.actor.src} size="sm" decorative />
								<span class="body">
									<span class="text"><strong>{n.actor.name}</strong> {n.text}</span>
									<span class="meta">
										<time datetime={new Date(n.at).toISOString()}>{relative(n.at)}</time>
										{#if n.muted}
											<span class="muted"
												><Icon icon={NotificationOff01Icon} size={12} /> Muted</span
											>
										{/if}
										{#if !n.read}<span class="sr">, unread</span>{/if}
									</span>
								</span>
								<span class="dot" aria-hidden="true"></span>
							</button>
							<span class="actions">
								<Button
									variant="ghost"
									size="sm"
									square
									tabindex={n.id === focusable ? 0 : -1}
									aria-label={n.read ? 'Mark as unread' : 'Mark as read'}
									title={n.read ? 'Mark as unread' : 'Mark as read'}
									onclick={() => setRead([n], !n.read)}
								>
									<Icon icon={n.read ? Mail01Icon : MailOpen01Icon} size={16} />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									square
									tabindex={n.id === focusable ? 0 : -1}
									aria-label={n.muted ? 'Unmute this thread' : 'Mute this thread'}
									title={n.muted ? 'Unmute this thread' : 'Mute this thread'}
									onclick={() => mute(n)}
								>
									<Icon icon={n.muted ? Notification01Icon : NotificationOff01Icon} size={16} />
								</Button>
							</span>
						</li>
					{/each}
				</ul>
			{/each}
			{#if more && onmore && filter === 'all'}
				<div class="more">
					<Button variant="secondary" size="sm" loading={loadingMore} onclick={loadMore}
						>Load older</Button
					>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.inbox {
		display: grid;
		gap: 0.5rem;
		min-inline-size: 0;
		color: var(--ui-fg);
		font: 0.875rem/1.45 var(--ui-font);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.title {
		font-size: 1rem;
		font-weight: 600;
	}
	.inbox :global(.filter) {
		inline-size: 100%;
	}
	/* In a popover it scrolls inside a set height (--inbox-height); full page it just grows. */
	.scroll {
		max-block-size: var(--inbox-height, none);
		overflow: auto;
		overscroll-behavior: contain;
		margin-inline: -0.5rem;
		padding-inline: 0.5rem;
	}
	.group {
		margin: 0.75rem 0 0.25rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.group:first-child {
		margin-block-start: 0.25rem;
	}
	.list {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		position: relative;
		border-radius: var(--ui-radius);
		transition: background-color var(--ui-dur-press) ease;
	}
	.unread {
		background: color-mix(in srgb, var(--ui-accent) 6%, transparent);
	}
	@media (hover: hover) {
		.item:hover {
			background: var(--ui-subtle);
		}
	}
	.row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
		gap: 0.75rem;
		inline-size: 100%;
		padding: 0.625rem 0.75rem;
		border: 0;
		border-radius: inherit;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.row:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.body {
		display: grid;
		gap: 0.125rem;
		min-inline-size: 0;
	}
	.text {
		overflow-wrap: anywhere;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}
	.muted {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	/* Read: the dot fades and shrinks away rather than vanishing. */
	.dot {
		inline-size: 0.5rem;
		block-size: 0.5rem;
		margin-block-start: 0.375rem;
		border-radius: 50%;
		background: var(--ui-accent);
		opacity: 0;
		scale: 0.4;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			scale var(--ui-dur) var(--ui-ease-out);
	}
	.unread .dot {
		opacity: 1;
		scale: 1;
	}
	/* Quick actions appear over the dot's corner on hover or focus; touch shows them always. */
	.actions {
		position: absolute;
		inset-block-start: 0.375rem;
		inset-inline-end: 0.375rem;
		display: flex;
		gap: 0.125rem;
		padding: 0.125rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-xs);
		opacity: 0;
		translate: 0 -2px;
		pointer-events: none;
		transition:
			opacity var(--ui-dur-exit) ease,
			translate var(--ui-dur-exit) ease;
	}
	.item:hover .actions,
	.item:focus-within .actions {
		opacity: 1;
		translate: 0 0;
		pointer-events: auto;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur) var(--ui-ease-out);
	}
	@media (hover: none) {
		.actions {
			position: static;
			justify-content: flex-end;
			margin: -0.375rem 0.5rem 0.375rem 0;
			background: none;
			box-shadow: none;
			opacity: 1;
			translate: 0 0;
			pointer-events: auto;
		}
	}
	.skeleton {
		display: flex;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
	}
	.lines {
		flex: 1;
	}
	.more {
		display: flex;
		justify-content: center;
		padding-block: 0.75rem 0.25rem;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.dot,
		.actions {
			scale: 1;
			translate: 0 0;
		}
	}
</style>
