<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import {
		ArrowLeft01Icon,
		ArrowTurnForwardIcon,
		Archive02Icon,
		Bookmark01Icon,
		Cancel01Icon,
		HashtagIcon,
		InformationCircleIcon,
		MoreHorizontalIcon,
		NotificationOff01Icon,
		PencilEdit02Icon,
		PinIcon,
		Search01Icon
	} from '@hugeicons/core-free-icons';
	import { announce } from '../../ui/announce';
	import Avatar from '../../ui/Avatar.svelte';
	import Button from '../../ui/Button.svelte';
	import Chat from '../../ui/Chat.svelte';
	import { type ChatMessage, type ChatUser } from '../../ui/chat';
	import Dialog from '../../ui/Dialog.svelte';
	import * as Dropdown from '../../ui/dropdown/index';
	import EmptyState from '../../ui/EmptyState.svelte';
	import Icon from '../../ui/Icon.svelte';
	import { ms } from '../../ui/motion';
	import { scrollEdges } from '../../ui/scroll-edges';
	import SearchField from '../../ui/SearchField.svelte';
	import Segmented from '../../ui/Segmented.svelte';
	import Skeleton from '../../ui/Skeleton.svelte';
	import Spinner from '../../ui/Spinner.svelte';
	import {
		listTime,
		messageOf,
		sorted,
		titleOf,
		type Conversation,
		type Hit,
		type MessagingApi
	} from './api';
	import Info from './Info.svelte';
	import NewConversation from './NewConversation.svelte';
	import Search from './Search.svelte';

	interface Props {
		api: MessagingApi;
		/** Names the app for screen readers. */
		label?: string;
		/** A conversation to show once the list loads; phones still start on the list. */
		initial?: string;
		class?: string;
	}

	let { api, label = 'Messages', initial, class: className }: Props = $props();
	const me = untrack(() => api.me);

	// ── Loading ───────────────────────────────────────────────────────────────────────────────
	let users = $state<ChatUser[]>([]);
	let conversations = $state<Conversation[]>();
	let listError = $state('');
	const byId = $derived(new Map(users.map((u) => [u.id, u])));
	const title = (c: Conversation) => titleOf(c, byId, me);
	const titles = $derived(new Map((conversations ?? []).map((c) => [c.id, title(c)])));

	async function load() {
		listError = '';
		conversations = undefined;
		try {
			[users, conversations] = await Promise.all([api.users(), api.conversations()]);
		} catch (e) {
			listError = messageOf(e);
		}
	}

	// Messages per conversation, kept while you move between them.
	let store = $state<Record<string, ChatMessage[]>>({});
	let selected = $state<string>();
	let loading = $state(false);
	let chatError = $state('');
	let unreadFrom = $state<string>();
	let focus = $state<string>();
	const current = $derived(conversations?.find((c) => c.id === selected));

	async function open(id: string, at?: string) {
		// A thread or details belong to the conversation you were in; search stays open.
		if (id !== selected && side && side.kind !== 'search') side = undefined;
		selected = id;
		pane = 'chat';
		focus = undefined;
		chatError = '';
		const c = conversations?.find((x) => x.id === id);
		if (!store[id]) {
			loading = true;
			try {
				store[id] = await api.messages(id);
			} catch (e) {
				chatError = messageOf(e);
				return;
			} finally {
				loading = false;
			}
		}
		// A search result further back: load earlier pages until it's there.
		for (let i = 0; at && i < 20 && !store[id].some((m) => m.id === at); i++) {
			const more = await api.messages(id, store[id][0]?.id);
			if (!more.length) break;
			store[id] = [...more, ...store[id]];
		}
		const list = store[id];
		unreadFrom = c?.unread ? list[Math.max(0, list.length - c.unread)]?.id : undefined;
		await tick();
		focus = at;
	}

	function seenAll(id: string) {
		const c = conversations?.find((x) => x.id === selected);
		if (!c || (!c.unread && !c.mentions)) return;
		c.unread = 0;
		c.mentions = 0;
		api.read(c.id, id).catch(() => {});
	}

	// ── The list ──────────────────────────────────────────────────────────────────────────────
	let filter = $state('all');
	// Archived conversations are a separate view, reached from the foot of the list.
	let archived = $state(false);
	let query = $state('');
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const shown = $derived(
		sorted(conversations ?? []).filter(
			(c) =>
				(archived ? c.archived : !c.archived) &&
				(archived ||
					filter === 'all' ||
					(filter === 'unread' ? c.unread > 0 : c.kind === filter)) &&
				fold(title(c)).includes(fold(query.trim()))
		)
	);
	const archivedCount = $derived((conversations ?? []).filter((c) => c.archived).length);
	const unreadTotal = $derived(
		(conversations ?? []).filter((c) => !c.archived && !c.muted).reduce((n, c) => n + c.unread, 0)
	);
	const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
	function seen(u: ChatUser) {
		if (u.online) return 'Online';
		if (!u.lastSeen) return 'Offline';
		const minutes = Math.round((u.lastSeen - Date.now()) / 60_000);
		if (minutes > -60) return `Last seen ${relative.format(minutes, 'minute')}`;
		if (minutes > -1440) return `Last seen ${relative.format(Math.round(minutes / 60), 'hour')}`;
		return `Last seen ${relative.format(Math.round(minutes / 1440), 'day')}`;
	}
	function subtitle(c: Conversation) {
		if (c.kind === 'direct') {
			const other = byId.get(c.members.find((id) => id !== me) ?? '');
			return other ? seen(other) : '';
		}
		const online = c.members.filter((id) => byId.get(id)?.online).length;
		const people = `${c.members.length} members, ${online} online`;
		return c.topic ? `${c.topic} · ${people}` : people;
	}
	const preview = (c: Conversation) =>
		c.last
			? `${c.last.author === me ? 'You: ' : c.kind === 'direct' ? '' : `${byId.get(c.last.author)?.name.split(' ')[0]}: `}${c.last.text}`
			: 'No messages yet';

	async function change(
		c: Conversation,
		next: Partial<Pick<Conversation, 'pinned' | 'muted' | 'archived'>>
	) {
		const before = { pinned: c.pinned, muted: c.muted, archived: c.archived };
		Object.assign(c, next);
		const said =
			next.muted !== undefined
				? next.muted
					? 'Muted'
					: 'Notifications on'
				: next.pinned !== undefined
					? next.pinned
						? 'Pinned to the top'
						: 'Unpinned'
					: next.archived
						? 'Archived'
						: 'Moved back to the list';
		announce(said);
		try {
			await api.update(c.id, next);
		} catch (e) {
			Object.assign(c, before);
			announce(messageOf(e), 'assertive');
		}
	}

	// ── Phones: one pane at a time ────────────────────────────────────────────────────────────
	let pane = $state<'list' | 'chat' | 'side'>('list');
	type Side =
		| { kind: 'info' }
		| { kind: 'search'; within?: string }
		| { kind: 'thread'; parent: ChatMessage };
	let side = $state<Side>();
	function openSide(next: Side) {
		side = next;
		pane = 'side';
	}
	function closeSide() {
		side = undefined;
		pane = selected ? 'chat' : 'list';
	}

	// ── Threads ───────────────────────────────────────────────────────────────────────────────
	let replies = $state<ChatMessage[]>([]);
	let threadLoading = $state(false);
	let threadError = $state('');
	async function openThread(parent: ChatMessage) {
		openSide({ kind: 'thread', parent });
		replies = [];
		threadError = '';
		threadLoading = true;
		try {
			replies = await api.thread(selected!, parent.id);
		} catch (e) {
			threadError = messageOf(e);
		} finally {
			threadLoading = false;
		}
	}
	const bumpReplies = (conversation: string, parent: string) => {
		const p = store[conversation]?.find((m) => m.id === parent);
		if (p) p.replies = (p.replies ?? 0) + 1;
	};

	// ── Message actions the block adds: forward, pin, save ────────────────────────────────────
	async function toggle(m: ChatMessage, key: 'pinned' | 'saved') {
		const id = selected!;
		const list = store[id];
		const at = list.findIndex((x) => x.id === m.id);
		if (at < 0) return;
		const next = { ...list[at], [key]: !list[at][key] };
		list[at] = next;
		announce(
			key === 'pinned'
				? next.pinned
					? 'Pinned'
					: 'Unpinned'
				: next.saved
					? 'Saved for later'
					: 'Removed from saved'
		);
		try {
			await api.save(id, next);
		} catch (e) {
			list[at] = m;
			announce(messageOf(e), 'assertive');
		}
	}
	let forwarding = $state<ChatMessage>();
	let forwardTo = $state('');
	let forwardError = $state('');
	let forwardBusy = $state(false);
	async function forward() {
		if (!forwarding || !forwardTo) return;
		forwardBusy = true;
		forwardError = '';
		const copy: ChatMessage = {
			id: crypto.randomUUID(),
			author: me,
			text: forwarding.text,
			at: Date.now(),
			attachments: forwarding.attachments,
			forwarded: true,
			status: 'sent'
		};
		try {
			await api.send(forwardTo, copy, []);
			store[forwardTo]?.push(copy);
			const c = conversations?.find((x) => x.id === forwardTo);
			if (c) c.last = { text: copy.text || 'Sent an attachment', author: me, at: copy.at };
			announce(`Forwarded to ${titles.get(forwardTo)}`);
			forwarding = undefined;
		} catch (e) {
			forwardError = messageOf(e);
		} finally {
			forwardBusy = false;
		}
	}
	const actions = [
		{
			label: 'Forward',
			icon: ArrowTurnForwardIcon,
			run: (m: ChatMessage) => ((forwardTo = ''), (forwardError = ''), (forwarding = m))
		},
		{
			label: (m: ChatMessage) => (m.pinned ? 'Unpin' : 'Pin'),
			icon: PinIcon,
			run: (m: ChatMessage) => toggle(m, 'pinned')
		},
		{
			label: (m: ChatMessage) => (m.saved ? 'Remove from saved' : 'Save for later'),
			icon: Bookmark01Icon,
			run: (m: ChatMessage) => toggle(m, 'saved')
		}
	];

	// ── Live: new messages, typing, receipts ──────────────────────────────────────────────────
	let typing = $state<Record<string, string[]>>({});
	const mine = (name: string | undefined, text: string) => !!name && text.includes(`@${name}`);
	onMount(() => {
		load().then(() => {
			if (!initial || selected || !conversations?.some((c) => c.id === initial)) return;
			open(initial);
			pane = 'list';
		});
		return api.listen((e) => {
			const c = conversations?.find((x) => x.id === e.conversation);
			if (e.type === 'typing') {
				const now = typing[e.conversation] ?? [];
				typing[e.conversation] = e.typing
					? [...new Set([...now, e.user])]
					: now.filter((u) => u !== e.user);
			} else if (e.type === 'update') {
				for (const list of [store[e.conversation], replies])
					list?.forEach((m, i) => m.id === e.id && (list[i] = { ...m, ...e.change }));
			} else if (e.parent) {
				if (side?.kind === 'thread' && side.parent.id === e.parent)
					replies = [...replies, e.message];
				bumpReplies(e.conversation, e.parent);
			} else {
				if (store[e.conversation]) store[e.conversation] = [...store[e.conversation], e.message];
				if (c) {
					c.last = {
						text: e.message.text || 'Sent an attachment',
						author: e.message.author,
						at: e.message.at
					};
					// Counted as unread unless you're looking at it right now.
					if (c.id !== selected || document.hidden) {
						c.unread++;
						if (mine(byId.get(me)?.name, e.message.text)) c.mentions++;
					}
				}
			}
		});
	});

	let newOpen = $state(false);
	async function create(members: string[], name?: string) {
		const c = await api.create(members, name);
		const existing = conversations?.find((x) => x.id === c.id);
		if (existing) existing.archived = false;
		else conversations = [...(conversations ?? []), c];
		filter = 'all';
		archived = false;
		await open(c.id);
	}
</script>

{#snippet face(c: Conversation)}
	{@const other =
		c.kind === 'direct' ? byId.get(c.members.find((id) => id !== me) ?? '') : undefined}
	<span class="face">
		{#if c.kind === 'channel'}
			<span class="tile"><Icon icon={HashtagIcon} size={18} /></span>
		{:else}
			<Avatar name={title(c)} src={other?.avatar} decorative />
			{#if other?.online}<span class="online"></span>{/if}
		{/if}
	</span>
{/snippet}

<!-- The outer box is the container its own width is measured by; the layout sits inside it. -->
<div class="shell">
	<div
		class={['app', `on-${pane}`, side && 'with-side', className]}
		role="region"
		aria-label={label}
	>
		<!-- The list of conversations -->
		<nav class="list" aria-label="{label}: conversations">
			<div class="list-head">
				<h2>
					{label}
					{#if unreadTotal}<span class="total" aria-label="{unreadTotal} unread">{unreadTotal}</span
						>{/if}
				</h2>
				<Button
					variant="ghost"
					square
					aria-label="Search messages"
					onclick={() => openSide({ kind: 'search' })}
				>
					<Icon icon={Search01Icon} size={18} />
				</Button>
				<Button
					variant="ghost"
					square
					aria-label="New conversation"
					onclick={() => (newOpen = true)}
				>
					<Icon icon={PencilEdit02Icon} size={18} />
				</Button>
			</div>
			<div class="list-tools">
				<SearchField label="Find a conversation" bind:value={query} />
				{#if archived}
					<div class="archived-head">
						<Button variant="ghost" size="sm" onclick={() => (archived = false)}>
							<Icon icon={ArrowLeft01Icon} size={16} /> All conversations
						</Button>
						<strong>Archived</strong>
					</div>
				{:else}
					<Segmented
						label="Show"
						hideLabel
						bind:value={filter}
						options={[
							{ value: 'all', label: 'All' },
							{ value: 'unread', label: 'Unread' },
							{ value: 'group', label: 'Groups' },
							{ value: 'channel', label: 'Channels' }
						]}
					/>
				{/if}
			</div>
			<div class="items" {@attach scrollEdges} data-fade>
				{#if listError}
					<EmptyState title="Couldn’t load your conversations" level={3}>
						{listError}
						{#snippet actions()}<Button variant="secondary" onclick={load}>Try again</Button
							>{/snippet}
					</EmptyState>
				{:else if !conversations}
					<div class="loading" role="status" aria-label="Loading conversations">
						{#each { length: 6 }, i (i)}
							<div class="sk">
								<Skeleton circle width="2.5rem" height="2.5rem" /><Skeleton lines={2} />
							</div>
						{/each}
					</div>
				{:else if !conversations.length}
					<EmptyState title="No conversations yet" level={3}>
						Start one with anyone in your workspace, or a group of several.
						{#snippet actions()}<Button onclick={() => (newOpen = true)}>New conversation</Button
							>{/snippet}
					</EmptyState>
				{:else if !shown.length}
					<EmptyState
						title={query.trim()
							? 'No conversation by that name'
							: archived
								? 'Nothing archived'
								: filter === 'unread'
									? 'You’re all caught up'
									: filter === 'group'
										? 'No groups yet'
										: 'No channels yet'}
						level={3}
					>
						{#if query.trim()}Search inside messages instead.{/if}
						{#snippet actions()}
							{#if query.trim()}
								<Button variant="secondary" onclick={() => openSide({ kind: 'search' })}
									>Search messages</Button
								>
							{/if}
						{/snippet}
					</EmptyState>
				{:else}
					<ul>
						{#each shown as c (c.id)}
							<li animate:flip={{ duration: ms(200) }}>
								<button
									type="button"
									class={['item', c.unread > 0 && 'unread']}
									aria-current={c.id === selected ? 'true' : undefined}
									onclick={() => open(c.id)}
								>
									{@render face(c)}
									<span class="lines">
										<span class="line">
											<span class="name">{c.kind === 'channel' ? `#${title(c)}` : title(c)}</span>
											{#if c.last}<time datetime={new Date(c.last.at).toISOString()}
													>{listTime(c.last.at)}</time
												>{/if}
										</span>
										<span class="line">
											<span class="snip">
												{#if typing[c.id]?.length}<em>typing…</em>{:else}{preview(c)}{/if}
											</span>
											<span class="marks">
												{#if c.muted}<Icon icon={NotificationOff01Icon} size={14} /><span class="sr"
														>Muted</span
													>{/if}
												{#if c.pinned}<Icon icon={PinIcon} size={14} /><span class="sr">Pinned</span
													>{/if}
												{#if c.mentions}<span class="badge at" aria-label="{c.mentions} mentions"
														>@</span
													>{/if}
												{#if c.unread}<span
														class={['badge', c.muted && 'quiet']}
														aria-label="{c.unread} unread">{c.unread}</span
													>{/if}
											</span>
										</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				{#if !archived && archivedCount}
					<button type="button" class="to-archive" onclick={() => (archived = true)}>
						<Icon icon={Archive02Icon} size={16} /> Archived
						<span class="count">{archivedCount}</span>
					</button>
				{/if}
			</div>
		</nav>

		<!-- The open conversation -->
		<div class="conversation">
			{#if !current}
				<EmptyState
					title={conversations?.length === 0 ? 'Your messages will be here' : 'Pick a conversation'}
					level={3}
				>
					Or start a new one with anyone in your workspace.
					{#snippet actions()}<Button variant="secondary" onclick={() => (newOpen = true)}
							>New conversation</Button
						>{/snippet}
				</EmptyState>
			{:else}
				<div class="bar">
					<Button
						variant="ghost"
						square
						class="back"
						aria-label="Back to conversations"
						onclick={() => ((pane = 'list'), (selected = undefined))}
					>
						<Icon icon={ArrowLeft01Icon} size={20} />
					</Button>
					<button type="button" class="ident" onclick={() => openSide({ kind: 'info' })}>
						{@render face(current)}
						<span class="lines">
							<strong>{current.kind === 'channel' ? `#${title(current)}` : title(current)}</strong>
							<small>{typing[current.id]?.length ? 'typing…' : subtitle(current)}</small>
						</span>
					</button>
					<Button
						variant="ghost"
						square
						aria-label="Search in this conversation"
						onclick={() => openSide({ kind: 'search', within: current.id })}
					>
						<Icon icon={Search01Icon} size={18} />
					</Button>
					<Button
						variant="ghost"
						square
						aria-label="Conversation info"
						aria-pressed={side?.kind === 'info'}
						onclick={() => (side?.kind === 'info' ? closeSide() : openSide({ kind: 'info' }))}
					>
						<Icon icon={InformationCircleIcon} size={18} />
					</Button>
					<Dropdown.Root>
						{#snippet trigger(props)}
							<Button {...props} variant="ghost" square aria-label="More for this conversation">
								<Icon icon={MoreHorizontalIcon} size={18} />
							</Button>
						{/snippet}
						<Dropdown.Item onselect={() => change(current, { pinned: !current.pinned })}>
							<Icon icon={PinIcon} />
							{current.pinned ? 'Unpin from the top' : 'Pin to the top'}
						</Dropdown.Item>
						<Dropdown.Item onselect={() => change(current, { muted: !current.muted })}>
							<Icon icon={NotificationOff01Icon} />
							{current.muted ? 'Turn on notifications' : 'Mute'}
						</Dropdown.Item>
						<Dropdown.Separator />
						<Dropdown.Item onselect={() => change(current, { archived: !current.archived })}>
							{current.archived ? 'Move back to the list' : 'Archive'}
						</Dropdown.Item>
					</Dropdown.Root>
				</div>
				{@const pins = (store[current.id] ?? []).filter((m) => m.pinned && !m.deleted)}
				{#if pins.length}
					<button
						type="button"
						class="pinned"
						onclick={() => ((focus = undefined), tick().then(() => (focus = pins.at(-1)!.id)))}
					>
						<Icon icon={PinIcon} size={14} />
						<span class="sr">Pinned message: </span>
						<span class="clip">{pins.at(-1)!.text || 'An attachment'}</span>
						{#if pins.length > 1}<small>+{pins.length - 1} more</small>{/if}
					</button>
				{/if}
				<div class="thread-area">
					{#if chatError}
						<EmptyState title="Couldn’t load this conversation" level={3}>
							{chatError}
							{#snippet actions()}<Button variant="secondary" onclick={() => open(current.id)}
									>Try again</Button
								>{/snippet}
						</EmptyState>
					{:else if loading || !store[current.id]}
						<div class="center"><Spinner size={20} label="Loading messages" /></div>
					{:else}
						{#key current.id}
							<Chat
								bind:messages={store[current.id]}
								{users}
								{me}
								label={title(current)}
								variant={current.kind === 'direct' ? 'bubbles' : 'flat'}
								typing={typing[current.id] ?? []}
								unread={unreadFrom}
								{focus}
								draft={current.id}
								menu={actions}
								placeholder={current.kind === 'channel'
									? `Message #${title(current)}`
									: `Message ${title(current)}`}
								send={(m, files) =>
									api.send(current.id, m, files).then((r) => {
										current.last = { text: m.text || 'Sent an attachment', author: me, at: m.at };
										return r;
									})}
								save={(m) => api.save(current.id, m)}
								hide={(m) => api.hide(current.id, m.id)}
								older={() => api.messages(current.id, store[current.id][0]?.id)}
								thread={current.kind === 'direct' ? undefined : openThread}
								onread={seenAll}
							>
								{#snippet empty()}
									{@render face(current)}
									<strong
										>{current.kind === 'channel' ? `#${title(current)}` : title(current)}</strong
									>
									<span>No messages yet. Say hello.</span>
								{/snippet}
							</Chat>
						{/key}
					{/if}
				</div>
			{/if}
		</div>

		<!-- Thread, info or search, beside the conversation (over it on smaller screens) -->
		{#if side}
			<aside
				class="side"
				aria-label={side.kind === 'thread'
					? 'Thread'
					: side.kind === 'info'
						? 'Conversation info'
						: 'Search'}
				transition:fly={{ x: 24, duration: ms(200) }}
			>
				<div class="side-head">
					<Button variant="ghost" square class="back" aria-label="Back" onclick={closeSide}>
						<Icon icon={ArrowLeft01Icon} size={20} />
					</Button>
					<h3>{side.kind === 'thread' ? 'Thread' : side.kind === 'info' ? 'Details' : 'Search'}</h3>
					<Button variant="ghost" square class="close" aria-label="Close" onclick={closeSide}>
						<Icon icon={Cancel01Icon} size={18} />
					</Button>
				</div>
				<div class="side-body">
					{#if side.kind === 'search'}
						{#key side.within}
							<Search
								{api}
								{users}
								{titles}
								within={side.within}
								onopen={(hit: Hit) => open(hit.conversation, hit.message.id)}
							/>
						{/key}
					{:else if side.kind === 'info' && current}
						<Info
							conversation={current}
							title={title(current)}
							subtitle={subtitle(current)}
							users={byId}
							{me}
							messages={store[current.id] ?? []}
							{seen}
							onshow={(id) => {
								focus = undefined;
								pane = 'chat';
								tick().then(() => (focus = id));
							}}
							onchange={(next) => change(current, next)}
						/>
					{:else if side.kind === 'thread' && current}
						{@const parent = side.parent}
						{#if threadError}
							<EmptyState title="Couldn’t load the thread" level={4}>{threadError}</EmptyState>
						{:else if threadLoading}
							<div class="center"><Spinner size={20} label="Loading replies" /></div>
						{:else}
							{#key parent.id}
								<Chat
									bind:messages={replies}
									{users}
									{me}
									variant="flat"
									label="Thread"
									placeholder="Reply in thread"
									draft="thread-{parent.id}"
									send={(m, files) =>
										api.send(current.id, m, files, parent.id).then((r) => {
											bumpReplies(current.id, parent.id);
											return r;
										})}
									save={(m) => api.save(current.id, m)}
								>
									{#snippet header()}
										<div class="parent">
											<strong>{byId.get(parent.author)?.name}</strong>
											<p>{parent.text}</p>
											<small>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</small>
										</div>
									{/snippet}
								</Chat>
							{/key}
						{/if}
					{/if}
				</div>
			</aside>
		{/if}
	</div>
</div>

<NewConversation bind:open={newOpen} {users} {me} {create} />

<Dialog
	open={!!forwarding}
	onclose={() => (forwarding = undefined)}
	title="Forward message"
	description={forwarding?.text
		? `“${forwarding.text.slice(0, 80)}${forwarding.text.length > 80 ? '…' : ''}”`
		: undefined}
>
	<form
		id="forward"
		class="forward"
		onsubmit={(e) => {
			e.preventDefault();
			forward();
		}}
	>
		<fieldset>
			<legend>To</legend>
			{#each sorted(conversations ?? []).filter((c) => !c.archived) as c (c.id)}
				<label class="to">
					<input type="radio" name="forward-to" value={c.id} bind:group={forwardTo} />
					{@render face(c)}
					<span>{c.kind === 'channel' ? `#${title(c)}` : title(c)}</span>
				</label>
			{/each}
		</fieldset>
		{#if forwardError}<p class="error" role="alert">{forwardError}</p>{/if}
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (forwarding = undefined)}>Cancel</Button>
		<Button type="submit" form="forward" loading={forwardBusy} disabled={!forwardTo}>Forward</Button
		>
	{/snippet}
</Dialog>

<style>
	.shell {
		container-type: inline-size;
		inline-size: 100%;
		block-size: 100%;
	}
	.app {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.list,
	.conversation,
	.side {
		grid-area: 1 / 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-block-size: 0;
		min-inline-size: 0;
		background: var(--ui-surface);
	}
	/* Phones: one pane at a time. */
	.app:not(.on-list) .list,
	.app:not(.on-chat) .conversation,
	.app:not(.on-side) .side {
		visibility: hidden;
	}
	.list {
		grid-template-rows: auto auto minmax(0, 1fr);
		background: var(--ui-subtle);
	}
	.list-head {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem 0.25rem 1rem;
	}
	h2 {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 1.0625rem;
		font-weight: 650;
		letter-spacing: -0.02em;
	}
	.total,
	.badge {
		display: inline-grid;
		place-items: center;
		min-inline-size: 1.25rem;
		block-size: 1.25rem;
		padding: 0 0.375rem;
		box-sizing: border-box;
		border-radius: 999px;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 0.75rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.badge.quiet {
		background: color-mix(in srgb, var(--ui-fg) 18%, transparent);
		color: var(--ui-fg);
	}
	.list-tools {
		display: grid;
		gap: 0.5rem;
		padding: 0.25rem 0.75rem 0.5rem;
	}
	/* Four filters on one row in the narrow sidebar. */
	.list-tools :global(.track) {
		flex-wrap: nowrap;
	}
	.list-tools :global(.segment) {
		padding-inline: 0.5rem;
		font-size: 0.8125rem;
	}
	.items {
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0 0.5rem 0.75rem;
	}
	ul {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		inline-size: 100%;
		padding: 0.5rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
		transition: background-color var(--ui-dur) ease;
	}
	.item:hover {
		background: var(--ui-hover);
	}
	.item[aria-current='true'] {
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-xs);
	}
	.item:focus-visible,
	.ident:focus-visible,
	.pinned:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.face {
		position: relative;
		flex: none;
	}
	.tile {
		display: grid;
		place-items: center;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		border-radius: var(--ui-radius-control);
		background: color-mix(in srgb, var(--ui-accent) 14%, var(--ui-surface));
		color: var(--ui-accent);
	}
	.online {
		position: absolute;
		inset-inline-end: 0;
		inset-block-end: 0;
		inline-size: 0.75rem;
		block-size: 0.75rem;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 0 0 2px var(--ui-subtle);
	}
	.lines {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		flex: 1;
		min-inline-size: 0;
	}
	.line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.name,
	.snip {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.name {
		font-weight: 500;
	}
	.snip {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.snip em {
		color: var(--ui-accent);
	}
	.unread .name {
		font-weight: 700;
	}
	.unread .snip {
		color: var(--ui-fg);
	}
	.line time {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.unread time {
		color: var(--ui-accent);
		font-weight: 600;
	}
	.marks {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--ui-muted);
	}
	.badge.at {
		padding: 0;
	}
	.archived-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		min-block-size: 2.25rem;
	}
	.archived-head strong {
		padding-inline-end: 0.5rem;
		font-size: 0.875rem;
	}
	.to-archive {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		inline-size: 100%;
		margin-block-start: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-muted);
		font: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}
	.to-archive:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	.to-archive:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.count {
		margin-inline-start: auto;
		font-variant-numeric: tabular-nums;
	}
	.loading {
		display: grid;
		gap: 0.75rem;
		padding: 0.5rem;
	}
	.sk {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.75rem;
	}

	.conversation {
		grid-template-rows: auto auto minmax(0, 1fr);
		align-content: start;
	}
	.conversation > :global(.empty) {
		grid-row: 1 / -1;
		align-self: center;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.5rem 0.5rem 0.5rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.ident {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.625rem;
		min-inline-size: 0;
		padding: 0.25rem 0.5rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.ident:hover {
		background: var(--ui-hover);
	}
	.ident small {
		overflow: hidden;
		color: var(--ui-muted);
		font-size: 0.75rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ident strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.pinned {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.5rem 0.75rem 0;
		padding: 0.375rem 0.75rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: inherit;
		font-size: 0.8125rem;
		text-align: start;
		cursor: pointer;
	}
	.pinned small {
		color: var(--ui-muted);
	}
	.clip {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.thread-area {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-block-size: 0;
		grid-row: 3;
	}
	.center {
		display: grid;
		place-items: center;
		min-block-size: 8rem;
	}

	.side {
		grid-template-rows: auto minmax(0, 1fr);
		z-index: 2;
	}
	.side-head {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.side-head h3 {
		flex: 1;
		margin: 0;
		font-size: 0.9375rem;
	}
	.side-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-block-size: 0;
	}
	.side :global(.close) {
		display: none;
	}
	.parent {
		display: grid;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
	}
	.parent p {
		margin: 0;
	}
	.parent small {
		color: var(--ui-muted);
	}

	/* Small phones: the name gets the room in the bar. */
	@container (max-width: 26rem) {
		.bar .face {
			display: none;
		}
	}
	/* Tablets and up: the list beside the conversation; details over the conversation's edge. */
	@container (min-width: 48rem) {
		.app {
			grid-template-columns: 18rem minmax(0, 1fr);
		}
		.list,
		.conversation {
			visibility: visible !important;
		}
		.list {
			grid-area: 1 / 1;
		}
		.conversation {
			grid-area: 1 / 2;
		}
		.side {
			grid-area: 1 / 2;
			justify-self: end;
			inline-size: min(22rem, 100%);
			visibility: visible !important;
			box-shadow: var(--ui-shadow-overlay);
		}
		.app :global(.back) {
			display: none;
		}
		.side :global(.close) {
			display: inline-flex;
		}
	}
	/* Wide: three columns, nothing covered (18 + at least 21 + 21rem). */
	@container (min-width: 60rem) {
		.app.with-side {
			grid-template-columns: 18rem minmax(0, 1fr) 21rem;
		}
		.with-side .side {
			grid-area: 1 / 3;
			inline-size: auto;
			justify-self: stretch;
			box-shadow: inset 1px 0 var(--ui-line);
		}
	}

	.forward fieldset {
		display: grid;
		gap: 0.125rem;
		max-block-size: 18rem;
		overflow-y: auto;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.forward legend {
		margin-block-end: 0.5rem;
		font-weight: 500;
	}
	.to {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.375rem 0.5rem;
		border-radius: var(--ui-radius-control);
		cursor: pointer;
	}
	.to:hover,
	.to:has(:checked) {
		background: var(--ui-hover);
	}
	.to input {
		accent-color: var(--ui-accent);
	}
	.error {
		margin: 0.75rem 0 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
