<script lang="ts" module>
	// Unsent text per conversation, kept while you switch between them.
	const drafts: Record<string, string> = {};
</script>

<script lang="ts">
	import { onMount, tick, untrack, type Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import {
		AlertCircleIcon,
		ArrowDown01Icon,
		ArrowTurnBackwardIcon,
		ArrowTurnForwardIcon,
		Bookmark01Icon,
		ArrowUp02Icon,
		Attachment01Icon,
		Cancel01Icon,
		Clock01Icon,
		Comment01Icon,
		Copy01Icon,
		Delete02Icon,
		Edit02Icon,
		File01Icon,
		MoreHorizontalIcon,
		PinIcon,
		SmileIcon,
		Tick01Icon,
		TickDouble01Icon
	} from '@hugeicons/core-free-icons';
	import { announce } from './announce';
	import Avatar from './Avatar.svelte';
	import Button from './Button.svelte';
	import {
		atBottom,
		fileSize,
		pieces,
		rows,
		type ChatAttachment,
		type ChatMessage,
		type ChatUser
	} from './chat';
	import * as Dropdown from './dropdown/index';
	import Icon from './Icon.svelte';
	import Image from './Image.svelte';
	import MentionInput from './MentionInput.svelte';
	import { ms, reduced } from './motion';
	import Popover from './Popover.svelte';
	import { scrollEdges } from './scroll-edges';
	import Spinner from './Spinner.svelte';
	import VoiceNote from './VoiceNote.svelte';

	/** An extra item in a message's More menu (Forward, Pin, Save). */
	type Action = {
		label: string | ((message: ChatMessage) => string);
		icon: typeof Copy01Icon;
		run: (message: ChatMessage) => void;
		/** Only for the messages this returns true for. */
		show?: (message: ChatMessage) => boolean;
	};

	interface Props {
		/** The conversation, oldest first. Bind it: sending, editing and reacting update it. */
		messages?: ChatMessage[];
		/** Everyone in the conversation, you included. */
		users: ChatUser[];
		/** Your user id. */
		me: string;
		/** Names the conversation for screen readers. */
		label?: string;
		/** bubbles: yours on the far side (Messenger). flat: everyone on one side (Slack). */
		variant?: 'bubbles' | 'flat';
		/** Ids of who's typing right now. */
		typing?: string[];
		/** The first message you haven't read: a "New" divider goes above it, and the view opens there. */
		unread?: string;
		/** Delivers a new (or retried) message. Resolve with changes (a server id, a status); throw if it failed. */
		send?: (message: ChatMessage, files: File[]) => Promise<Partial<ChatMessage> | void>;
		/** Saves an edit, delete or reaction, already shown. Throw to undo it. */
		save?: (message: ChatMessage) => Promise<unknown>;
		/** Older messages, oldest first, before the ones loaded. An empty list means you've reached the start. */
		older?: () => Promise<ChatMessage[]>;
		/** Offers "Reply in thread" and a replies link; called with the message to open. */
		thread?: (message: ChatMessage) => void;
		/** More items for each message's menu, after Reply in thread and Copy. */
		menu?: Action[];
		/** Offers "Delete for me" on anyone's message: called once it's hidden. Throw to bring it back. */
		hide?: (message: ChatMessage) => Promise<unknown>;
		/** Scrolls to this message and highlights it (a search result, a pinned message). */
		focus?: string;
		/** Called with the newest message's id once you've seen it. */
		onread?: (id: string) => void;
		/** Keeps unsent text under this key while the chat is closed (one per conversation). */
		draft?: string;
		placeholder?: string;
		attachments?: boolean;
		/** Above the messages: a title, members, actions. */
		header?: Snippet;
		/** Shown while there are no messages yet. */
		empty?: Snippet;
		class?: string;
	}

	let {
		messages = $bindable([]),
		users,
		me,
		label = 'Conversation',
		variant = 'bubbles',
		typing = [],
		unread,
		send,
		save,
		older,
		thread,
		menu = [],
		hide,
		focus,
		onread,
		draft,
		placeholder = 'Write a message…',
		attachments = true,
		header,
		empty,
		class: className
	}: Props = $props();

	const uid = $props.id();
	const EMOJI = ['👍', '❤️', '😂', '🎉', '🙏', '👀'] as const;
	const EMOJI_NAMES: Record<string, string> = {
		'👍': 'Thumbs up',
		'❤️': 'Heart',
		'😂': 'Laughing',
		'🎉': 'Celebrate',
		'🙏': 'Thank you',
		'👀': 'Looking'
	};
	const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
	const full = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' });

	const byId = $derived(new Map(users.map((u) => [u.id, u])));
	const nameOf = (id: string) => (id === me ? 'You' : (byId.get(id)?.name ?? 'Someone'));
	const others = $derived(users.filter((u) => u.id !== me));
	const list = $derived(rows(messages, unread));
	const lastMine = $derived(messages.findLast((m) => m.author === me && !m.deleted)?.id);
	const find = (id?: string) => (id ? messages.find((m) => m.id === id) : undefined);

	let log = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement>();
	let box = $state<HTMLDivElement>();

	// ── Scrolling ───────────────────────────────────────────────────────────────────────────────
	// Stuck to the bottom only while you're there; reading history, nothing moves under you.
	let stick = $state(true);
	let fresh = $state(0);
	let firstFresh = $state<string>();
	let loadingOlder = $state(false);
	let olderFailed = $state(false);
	let start = $state(false);
	let lastId = messages.at(-1)?.id;
	// Messages from after the chat opened slide in; history and older pages just appear.
	const opened = Date.now();

	const toBottom = () => log && (log.scrollTop = log.scrollHeight);
	const rowOf = (id: string) => log?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);

	function onscroll() {
		if (!log) return;
		stick = atBottom(log);
		if (stick) {
			fresh = 0;
			firstFresh = undefined;
		}
		if (log.scrollTop < 240) loadOlder();
	}

	async function loadOlder() {
		if (!older || loadingOlder || start || olderFailed) return;
		loadingOlder = true;
		try {
			const more = await older();
			if (!more.length) start = true;
			else if (log) {
				// Held in place: the same message stays under your eyes as history is added above it.
				const fromEnd = log.scrollHeight - log.scrollTop;
				messages = [...more, ...messages];
				await tick();
				log.scrollTop = log.scrollHeight - fromEnd;
			}
		} catch {
			olderFailed = true;
		} finally {
			loadingOlder = false;
		}
	}

	onMount(() => {
		// Opens at the first unread message, or the latest.
		const divider = log?.querySelector<HTMLElement>('.divider.unread');
		if (divider && log) log.scrollTop = divider.offsetTop - log.clientHeight / 3;
		else toBottom();
		if (log) stick = atBottom(log);
		// Images, the typing row, an edit: whatever grows the list keeps a stuck view at the bottom.
		const grow = new ResizeObserver(() => stick && toBottom());
		if (content) grow.observe(content);
		if (log && log.scrollHeight <= log.clientHeight) loadOlder();
		return () => grow.disconnect();
	});

	// New messages at the end: yours always come into view; others' do if you're at the bottom,
	// otherwise they're counted on the "new messages" button. Others' are announced either way.
	$effect(() => {
		const last = messages.at(-1)?.id;
		if (last === lastId) return;
		untrack(() => {
			const from = lastId ? messages.findIndex((m) => m.id === lastId) + 1 : 0;
			lastId = last;
			if (from === 0 && messages.length > 1) return; // Replaced wholesale: nothing "arrived".
			const added = messages.slice(from);
			const theirs = added.filter((m) => m.author !== me);
			if (theirs.length > 3) announce(`${theirs.length} new messages`);
			else
				for (const m of theirs) announce(`${nameOf(m.author)}: ${m.text || 'sent an attachment'}`);
			if (added.some((m) => m.author === me)) {
				stick = true;
				tick().then(toBottom);
			} else if (!stick && theirs.length) {
				fresh += theirs.length;
				firstFresh ??= theirs[0].id;
			} else tick().then(toBottom);
		});
	});

	// Seen: you're at the bottom with the page in front of you.
	$effect(() => {
		const last = messages.at(-1)?.id;
		if (stick && last && !document.hidden) untrack(() => onread?.(last));
	});

	function jump() {
		const target = firstFresh && rowOf(firstFresh);
		if (target && log) {
			log.scrollTo({
				top: target.offsetTop - 16,
				behavior: reduced() ? 'auto' : 'smooth'
			});
			focusRow(firstFresh!);
		} else {
			log?.scrollTo({ top: log.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
		}
		fresh = 0;
		firstFresh = undefined;
	}

	// ── Moving between messages ───────────────────────────────────────────────────────────────
	// One message is in the tab order at a time; arrows move between them (a roving tabindex).
	let current = $state<string>();
	const focusable = $derived(current ?? messages.at(-1)?.id);
	let hovered = $state<string>();
	let focused = $state<string>();
	let pinned = $state<string>();
	let pressTimer: ReturnType<typeof setTimeout> | undefined;
	const shown = $derived(pinned ?? hovered ?? focused);
	let moreOpen = $state(false);
	let reactOpen = $state(false);
	$effect(() => {
		const open = moreOpen || reactOpen;
		untrack(() => (pinned = open ? shown : undefined));
	});
	let flash = $state<string>();
	let flashTimer: ReturnType<typeof setTimeout> | undefined;

	function focusRow(id: string) {
		current = id;
		tick().then(() => rowOf(id)?.focus({ preventScroll: false }));
	}

	function onRowKey(e: KeyboardEvent, id: string) {
		if (e.target !== e.currentTarget) return;
		const ids = messages.map((m) => m.id);
		const i = ids.indexOf(id);
		const to = { ArrowUp: i - 1, ArrowDown: i + 1, Home: 0, End: ids.length - 1 }[e.key];
		if (to !== undefined) {
			e.preventDefault();
			if (ids[to]) focusRow(ids[to]);
			else if (to < 0) loadOlder();
		} else if (e.key === 'Escape') {
			field()?.focus();
		}
	}

	async function showOriginal(id: string) {
		if (!rowOf(id)) {
			announce('That message is further back. Scroll up to load it.');
			return;
		}
		rowOf(id)?.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
		focusRow(id);
		flash = id;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => (flash = undefined), 1600);
	}

	$effect(() => {
		if (focus) untrack(() => tick().then(() => showOriginal(focus)));
	});

	// ── Changing messages ─────────────────────────────────────────────────────────────────────
	const patch = (id: string, change: Partial<ChatMessage>) =>
		(messages = messages.map((m) => (m.id === id ? { ...m, ...change } : m)));

	/** Shows a change at once and saves it; if saving fails it's put back and you're told. */
	async function change(id: string, next: Partial<ChatMessage>, failed: string) {
		const before = find(id);
		if (!before) return;
		patch(id, next);
		try {
			await save?.(find(id)!);
		} catch {
			patch(id, before);
			announce(failed, 'assertive');
		}
	}

	function react(m: ChatMessage, emoji: string) {
		const reactions = { ...m.reactions };
		const who = reactions[emoji] ?? [];
		reactions[emoji] = who.includes(me) ? who.filter((x) => x !== me) : [...who, me];
		if (!reactions[emoji].length) delete reactions[emoji];
		reactOpen = false;
		change(m.id, { reactions }, 'Couldn’t save your reaction.');
	}

	let editing = $state<string>();
	let editText = $state('');
	function startEdit(m: ChatMessage) {
		editing = m.id;
		editText = m.text;
		tick().then(() => {
			const area = rowOf(m.id)?.querySelector('textarea');
			area?.focus();
			area?.setSelectionRange(area.value.length, area.value.length);
		});
	}
	function finishEdit(save: boolean) {
		const m = find(editing);
		editing = undefined;
		if (save && m && editText.trim() && editText !== m.text)
			change(
				m.id,
				{
					text: editText.trim(),
					edited: true,
					editedAt: Date.now(),
					// Every earlier version, each with the time it was written.
					history: [...(m.history ?? []), { text: m.text, at: m.editedAt ?? m.at }]
				},
				'Couldn’t save your edit.'
			);
		if (m) focusRow(m.id);
	}

	async function hideForMe(m: ChatMessage) {
		const at = messages.findIndex((x) => x.id === m.id);
		messages = messages.filter((x) => x.id !== m.id);
		announce('Deleted for you');
		try {
			await hide?.(m);
		} catch {
			messages = messages.toSpliced(at, 0, m);
			announce('Couldn’t delete that message.', 'assertive');
		}
	}

	function remove(m: ChatMessage) {
		if (m.status === 'failed') {
			messages = messages.filter((x) => x.id !== m.id);
			field()?.focus();
			return;
		}
		change(
			m.id,
			{ deleted: true, text: '', attachments: [], reactions: {} },
			'Couldn’t delete that message.'
		);
		announce('Message deleted');
	}

	async function copy(m: ChatMessage) {
		try {
			await navigator.clipboard.writeText(m.text);
			announce('Copied');
		} catch {
			announce('Couldn’t copy. Select the text instead.');
		}
	}

	// ── Composing ─────────────────────────────────────────────────────────────────────────────
	let text = $state(untrack(() => (draft && drafts[draft]) || ''));
	$effect(() => {
		if (draft) drafts[draft] = text;
	});
	let replyTo = $state<string>();
	let files = $state<File[]>([]);
	let picker = $state<HTMLInputElement>();
	let emojiOpen = $state(false);
	const field = () => box?.querySelector('textarea');
	const canSend = $derived(!!text.trim() || files.length > 0);

	async function deliver(m: ChatMessage, attached: File[]) {
		try {
			const changes = await (send ? send(m, attached) : Promise.resolve());
			patch(m.id, { status: 'sent', ...changes });
		} catch {
			patch(m.id, { status: 'failed' });
			announce('Your message wasn’t sent.', 'assertive');
		}
	}

	// Files kept for a retry, by message id.
	const pendingFiles: Record<string, File[]> = {};
	function submit() {
		if (!canSend) return;
		const attached = files;
		const message: ChatMessage = {
			id: crypto.randomUUID(),
			author: me,
			text: text.trim(),
			at: Date.now(),
			status: 'sending',
			replyTo,
			attachments: attached.map((f): ChatAttachment => ({
				name: f.name,
				size: f.size,
				type: f.type,
				url: URL.createObjectURL(f)
			}))
		};
		pendingFiles[message.id] = attached;
		messages = [...messages, message];
		text = '';
		files = [];
		replyTo = undefined;
		field()?.focus();
		deliver(message, attached);
	}

	function retry(m: ChatMessage) {
		patch(m.id, { status: 'sending' });
		deliver({ ...m, status: 'sending' }, pendingFiles[m.id] ?? []);
	}

	function insert(emoji: string) {
		const area = field();
		const at = area?.selectionStart ?? text.length;
		text = text.slice(0, at) + emoji + text.slice(area?.selectionEnd ?? at);
		emojiOpen = false;
		tick().then(() => {
			area?.focus();
			area?.setSelectionRange(at + emoji.length, at + emoji.length);
		});
	}

	function onComposerKey(e: KeyboardEvent) {
		const area = e.target as HTMLTextAreaElement;
		if (area.tagName !== 'TEXTAREA') return;
		// The mention list owns Enter and arrows while it's open (it points aria-controls at itself).
		const listing = area.hasAttribute('aria-controls');
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !listing) {
			e.preventDefault();
			submit();
		} else if (e.key === 'Escape' && replyTo && !listing) {
			replyTo = undefined;
		} else if (e.key === 'ArrowUp' && !text && !listing && lastMine) {
			// Like Slack: up in an empty box edits your last message.
			e.preventDefault();
			const m = find(lastMine);
			if (m?.text && m.status !== 'failed') startEdit(m);
		}
	}

	onMount(() => () => {
		clearTimeout(pressTimer);
		clearTimeout(flashTimer);
	});

	const reacted = (who: string[]) =>
		who.length === 1
			? nameOf(who[0])
			: who.includes(me)
				? `you and ${who.length - 1} other${who.length > 2 ? 's' : ''}`
				: `${who.length} people`;
	const typingText = $derived.by(() => {
		const names = typing.filter((id) => id !== me).map(nameOf);
		if (!names.length) return '';
		if (names.length === 1) return `${names[0]} is typing…`;
		if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
		return 'Several people are typing…';
	});
</script>

{#snippet body(m: ChatMessage)}
	{#each pieces(m.text, users) as p, i (i)}
		{#if p.kind === 'link'}<a href={p.href} target="_blank" rel="noopener noreferrer nofollow"
				>{p.text}</a
			>{:else if p.kind === 'mention'}<span class={['mention', p.id === me && 'me']}>{p.text}</span
			>{:else}{p.text}{/if}
	{/each}
{/snippet}

{#snippet status(m: ChatMessage)}
	{#if m.status === 'failed'}
		<span class="state failed">
			<Icon icon={AlertCircleIcon} size={14} /> Not sent
			<button type="button" class="link" onclick={() => retry(m)}>Retry</button>
			<button type="button" class="link" onclick={() => remove(m)}>Delete</button>
		</span>
	{:else if m.status === 'sending'}
		<span class="state"><Icon icon={Clock01Icon} size={14} /> Sending…</span>
	{:else if m.id === lastMine && m.readBy?.length && others.length > 1}
		<!-- A group: who has seen it, rather than a single "Read". -->
		<span class="state read">
			<Icon icon={TickDouble01Icon} size={14} />
			{m.readBy.length >= others.length
				? 'Seen by everyone'
				: `Seen by ${m.readBy.slice(0, 2).map(nameOf).join(', ')}${m.readBy.length > 2 ? ` and ${m.readBy.length - 2} more` : ''}`}
		</span>
	{:else if m.id === lastMine && m.status}
		<span class={['state', m.status === 'read' && 'read']}>
			<Icon icon={m.status === 'sent' ? Tick01Icon : TickDouble01Icon} size={14} />
			{m.status === 'read' ? 'Read' : m.status === 'delivered' ? 'Delivered' : 'Sent'}
		</span>
	{/if}
{/snippet}

{#snippet actions(m: ChatMessage)}
	<div class="actions" role="toolbar" aria-label="Message actions">
		<Popover title="React" hideTitle side="top" bind:open={reactOpen}>
			{#snippet trigger(props)}
				<button {...props} type="button" class="act" aria-label="React">
					<Icon icon={SmileIcon} size={16} />
				</button>
			{/snippet}
			<div class="picker">
				{#each EMOJI as e (e)}
					<button
						type="button"
						aria-label={EMOJI_NAMES[e]}
						aria-pressed={m.reactions?.[e]?.includes(me) ?? false}
						onclick={() => react(m, e)}>{e}</button
					>
				{/each}
			</div>
		</Popover>
		<button
			type="button"
			class="act"
			aria-label="Reply"
			onclick={() => {
				replyTo = m.id;
				field()?.focus();
			}}
		>
			<Icon icon={ArrowTurnBackwardIcon} size={16} />
		</button>
		<Dropdown.Root bind:open={moreOpen}>
			{#snippet trigger(props)}
				<button {...props} type="button" class="act" aria-label="More actions">
					<Icon icon={MoreHorizontalIcon} size={16} />
				</button>
			{/snippet}
			{#if thread}
				<Dropdown.Item onselect={() => thread(m)}>
					<Icon icon={Comment01Icon} /> Reply in thread
				</Dropdown.Item>
			{/if}
			{#if m.text}
				<Dropdown.Item onselect={() => copy(m)}><Icon icon={Copy01Icon} /> Copy text</Dropdown.Item>
			{/if}
			{#each menu.filter((a) => a.show?.(m) ?? true) as a, i (i)}
				<Dropdown.Item onselect={() => a.run(m)}>
					<Icon icon={a.icon} />
					{typeof a.label === 'function' ? a.label(m) : a.label}
				</Dropdown.Item>
			{/each}
			{#if hide || m.author === me}<Dropdown.Separator />{/if}
			{#if hide}
				<Dropdown.Item variant="danger" onselect={() => hideForMe(m)}>
					<Icon icon={Delete02Icon} /> Delete for me
				</Dropdown.Item>
			{/if}
			{#if m.author === me}
				{#if m.text && m.status !== 'failed'}
					<Dropdown.Item onselect={() => startEdit(m)}
						><Icon icon={Edit02Icon} /> Edit</Dropdown.Item
					>
				{/if}
				<Dropdown.Item variant="danger" onselect={() => remove(m)}>
					<Icon icon={Delete02Icon} />
					{hide ? 'Delete for everyone' : 'Delete'}
				</Dropdown.Item>
			{/if}
		</Dropdown.Root>
	</div>
{/snippet}

<section class={['chat', variant, className]} aria-label={label}>
	{#if header}<div class="head">{@render header()}</div>{/if}

	<div class="viewport">
		<div
			bind:this={log}
			class="log"
			role="log"
			aria-live="off"
			aria-label="Messages"
			{@attach scrollEdges}
			data-fade
			{onscroll}
		>
			<div bind:this={content} class="rows">
				{#if older}
					<!-- Always the same height, so it appearing or going never shifts the messages. -->
					<div class="top">
						{#if start}
							<p>This is the start of the conversation.</p>
						{:else if olderFailed}
							<p>
								Couldn’t load earlier messages.
								<button
									type="button"
									class="link"
									onclick={() => {
										olderFailed = false;
										loadOlder();
									}}>Try again</button
								>
							</p>
						{:else if loadingOlder}
							<Spinner size={16} label="Loading earlier messages" />
						{/if}
					</div>
				{/if}

				{#if !messages.length && empty && !loadingOlder}
					<div class="empty">{@render empty()}</div>
				{/if}

				{#each list as row (row.key)}
					{#if row.kind === 'day'}
						<div class="divider" role="separator">
							<time datetime={row.date}>{row.label}</time>
						</div>
					{:else if row.kind === 'unread'}
						<div class="divider unread" role="separator">New</div>
					{:else}
						{@const m = row.message}
						{@const mine = m.author === me}
						{@const user = byId.get(m.author)}
						{@const quoted = find(m.replyTo)}
						<!-- Messages take focus one at a time (arrows move between them), so they listen for keys. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
						<div
							class={[
								'msg',
								mine && 'mine',
								row.first && 'first',
								row.last && 'last',
								flash === m.id && 'flash',
								m.at >= opened && 'arrived',
								m.status === 'sending' && 'sending'
							]}
							data-id={m.id}
							role="article"
							tabindex={focusable === m.id ? 0 : -1}
							aria-labelledby="{uid}-who-{m.id} {uid}-text-{m.id}"
							aria-describedby="{uid}-when-{m.id}"
							onkeydown={(e) => onRowKey(e, m.id)}
							onfocusin={() => {
								focused = m.id;
								current = m.id;
							}}
							onfocusout={(e) => {
								if (!e.currentTarget.contains(e.relatedTarget as Node)) focused = undefined;
							}}
							onpointerenter={(e) => e.pointerType === 'mouse' && (hovered = m.id)}
							onpointerleave={() => hovered === m.id && (hovered = undefined)}
							onpointerdown={(e) => {
								if (e.pointerType !== 'touch') return;
								clearTimeout(pressTimer);
								pressTimer = setTimeout(() => (hovered = m.id), 450);
							}}
							onpointerup={() => clearTimeout(pressTimer)}
							onpointercancel={() => clearTimeout(pressTimer)}
						>
							{#if row.first && (!mine || variant === 'flat')}
								<span class="avatar">
									<Avatar name={user?.name ?? 'Someone'} src={user?.avatar} size="sm" decorative />
									{#if user?.online}<span class="online" title="Online"></span>{/if}
								</span>
							{/if}
							<div class="stack">
								<span
									id="{uid}-who-{m.id}"
									class={row.first && (!mine || variant === 'flat') ? 'who' : 'sr'}
								>
									{nameOf(m.author)}
									{#if variant === 'flat' && row.first}
										<time
											class="when"
											datetime={new Date(m.at).toISOString()}
											title={full.format(m.at)}>{time.format(m.at)}</time
										>
									{/if}
								</span>

								{#if m.deleted}
									<p id="{uid}-text-{m.id}" class="bubble gone">This message was deleted.</p>
								{:else}
									{#if m.forwarded}
										<span class="tag"><Icon icon={ArrowTurnForwardIcon} size={12} /> Forwarded</span
										>
									{/if}
									{#if m.replyTo}
										<button
											type="button"
											class="quote"
											onclick={() => m.replyTo && showOriginal(m.replyTo)}
										>
											<span class="sr">Replying to </span>
											<strong>{quoted ? nameOf(quoted.author) : 'A message'}</strong>
											<span class="snippet"
												>{quoted ? quoted.text || 'An attachment' : 'Not loaded yet'}</span
											>
										</button>
									{/if}
									{#if editing === m.id}
										<div class="edit">
											<label class="sr" for="{uid}-edit">Edit message</label>
											<textarea
												id="{uid}-edit"
												bind:value={editText}
												rows="2"
												onkeydown={(e) => {
													if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
														e.preventDefault();
														finishEdit(true);
													} else if (e.key === 'Escape') {
														e.preventDefault();
														e.stopPropagation();
														finishEdit(false);
													}
												}}></textarea>
											<span class="hint">Enter to save · Esc to cancel</span>
										</div>
										<span id="{uid}-text-{m.id}" class="sr">{m.text}</span>
									{:else if m.text}
										<p id="{uid}-text-{m.id}" class="bubble">
											{@render body(m)}{#if m.edited && !m.history?.length}<span class="edited">
													(edited)</span
												>{/if}
										</p>
										{#if m.edited && m.history?.length}
											<Popover title="Edit history" side="top">
												{#snippet trigger(props)}
													<button {...props} type="button" class="edited link-quiet">Edited</button>
												{/snippet}
												<ol class="history">
													{#each m.history as h, i (i)}
														<li>
															<time datetime={new Date(h.at).toISOString()}
																>{full.format(h.at)}</time
															>
															<span>{h.text}</span>
														</li>
													{/each}
													<li class="now">
														{#if m.editedAt}<time datetime={new Date(m.editedAt).toISOString()}
																>Now · {full.format(m.editedAt)}</time
															>{/if}
														<span>{m.text}</span>
													</li>
												</ol>
											</Popover>
										{/if}
										{#if m.preview}
											<a
												class="link-card"
												href={m.preview.url}
												target="_blank"
												rel="noopener noreferrer nofollow"
											>
												{#if m.preview.image}<img
														src={m.preview.image}
														alt=""
														loading="lazy"
													/>{/if}
												<span>
													{#if m.preview.site}<small>{m.preview.site}</small>{/if}
													<strong>{m.preview.title}</strong>
													{#if m.preview.description}<span class="desc"
															>{m.preview.description}</span
														>{/if}
												</span>
											</a>
										{/if}
									{:else}
										<span id="{uid}-text-{m.id}" class="sr">Sent an attachment</span>
									{/if}
									{#if m.attachments?.length}
										<div class="files">
											{#each m.attachments as a (a.url)}
												{#if a.type.startsWith('audio/')}
													<VoiceNote
														class="voice"
														src={a.url}
														label="Voice message from {nameOf(m.author)}"
													/>
												{:else if a.type.startsWith('image/')}
													<Image
														class="pic"
														src={a.url}
														alt={a.name}
														ratio={a.width && a.height ? `${a.width} / ${a.height}` : '4 / 3'}
														zoom
													/>
												{:else}
													<a class="file" href={a.url} download={a.name}>
														<Icon icon={File01Icon} size={20} />
														<span><strong>{a.name}</strong><br />{fileSize(a.size)}</span>
													</a>
												{/if}
											{/each}
										</div>
									{/if}
									{#if m.reactions && Object.keys(m.reactions).length}
										<div class="reactions">
											{#each Object.entries(m.reactions) as [e, who] (e)}
												<button
													type="button"
													class="chip"
													aria-pressed={who.includes(me)}
													aria-label="{EMOJI_NAMES[e] ?? e}: {reacted(who)}"
													onclick={() => react(m, e)}
													><span aria-hidden="true">{e}</span> {who.length}</button
												>
											{/each}
										</div>
									{/if}
									{#if thread && m.replies}
										<button type="button" class="replies" onclick={() => thread(m)}>
											{m.replies}
											{m.replies === 1 ? 'reply' : 'replies'}
										</button>
									{/if}
								{/if}

								<span class="meta">
									{#if variant === 'bubbles' && row.last}
										<time datetime={new Date(m.at).toISOString()} title={full.format(m.at)}
											>{time.format(m.at)}</time
										>
									{/if}
									<span id="{uid}-when-{m.id}" class="sr">{full.format(m.at)}</span>
									{#if m.pinned}<span class="state" title="Pinned"
											><Icon icon={PinIcon} size={13} /><span class="sr">Pinned</span></span
										>{/if}
									{#if m.saved}<span class="state" title="Saved"
											><Icon icon={Bookmark01Icon} size={13} /><span class="sr">Saved</span></span
										>{/if}
									{#if mine}{@render status(m)}{/if}
								</span>
							</div>
							{#if shown === m.id && !m.deleted && editing !== m.id && m.status !== 'sending' && m.status !== 'failed'}
								{@render actions(m)}
							{/if}
						</div>
					{/if}
				{/each}

				{#if typingText}
					<div class="typing" transition:fly={{ y: 6, duration: ms(160) }}>
						<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
						{typingText}
					</div>
				{/if}
			</div>
		</div>

		{#if !stick}
			<button
				type="button"
				class={['jump', fresh > 0 && 'news']}
				transition:fly={{ y: 8, duration: ms(180) }}
				onclick={jump}
			>
				{#if fresh}{fresh} new {fresh === 1 ? 'message' : 'messages'}{:else}<span class="sr"
						>Jump to the latest message</span
					>{/if}
				<Icon icon={ArrowDown01Icon} size={16} />
			</button>
		{/if}
	</div>

	<form
		class="composer"
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
	>
		{#if replyTo && find(replyTo)}
			{@const q = find(replyTo)!}
			<div class="replying" transition:fly={{ y: 6, duration: ms(160) }}>
				<span
					>Replying to <strong>{nameOf(q.author)}</strong>
					<span class="snippet">{q.text || 'an attachment'}</span></span
				>
				<button
					type="button"
					class="act"
					aria-label="Cancel reply"
					onclick={() => {
						replyTo = undefined;
						field()?.focus();
					}}><Icon icon={Cancel01Icon} size={16} /></button
				>
			</div>
		{/if}
		{#if files.length}
			<ul class="pending" aria-label="Attached">
				{#each files as f, i (f.name + i)}
					<li transition:fly={{ y: 6, duration: ms(160) }}>
						<Icon icon={f.type.startsWith('image/') ? Attachment01Icon : File01Icon} size={16} />
						<span class="name">{f.name}</span>
						<button
							type="button"
							class="act"
							aria-label="Remove {f.name}"
							onclick={() => (files = files.filter((_, j) => j !== i))}
							><Icon icon={Cancel01Icon} size={14} /></button
						>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="row">
			{#if attachments}
				<input
					bind:this={picker}
					class="sr"
					type="file"
					multiple
					tabindex="-1"
					aria-hidden="true"
					onchange={(e) => {
						files = [...files, ...(e.currentTarget.files ?? [])];
						e.currentTarget.value = '';
						field()?.focus();
					}}
				/>
				<Button variant="ghost" square aria-label="Attach files" onclick={() => picker?.click()}>
					<Icon icon={Attachment01Icon} size={18} />
				</Button>
			{/if}
			<Popover title="Emoji" hideTitle side="top" bind:open={emojiOpen}>
				{#snippet trigger(props)}
					<Button {...props} variant="ghost" square aria-label="Add an emoji">
						<Icon icon={SmileIcon} size={18} />
					</Button>
				{/snippet}
				<div class="picker">
					{#each EMOJI as e (e)}
						<button type="button" aria-label={EMOJI_NAMES[e]} onclick={() => insert(e)}>{e}</button>
					{/each}
				</div>
			</Popover>
			<div class="text" bind:this={box} onkeydowncapture={onComposerKey}>
				<MentionInput label="Message" bind:value={text} people={others} rows={1} {placeholder} />
			</div>
			<Button type="submit" square aria-label="Send" disabled={!canSend}>
				<Icon icon={ArrowUp02Icon} size={18} />
			</Button>
		</div>
	</form>
</section>

<style>
	.chat {
		position: relative;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		grid-template-columns: minmax(0, 1fr);
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.head {
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.viewport {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr);
		grid-row: 2;
		min-block-size: 0;
	}
	.log {
		overflow-y: auto;
		overscroll-behavior: contain;
		/* We hold the position ourselves when history loads above; the browser's anchoring would double it. */
		overflow-anchor: none;
		scrollbar-width: thin;
	}
	.log:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-block-size: 100%;
		justify-content: flex-end;
		box-sizing: border-box;
		padding: 0.75rem 0.75rem 1rem;
	}
	.top {
		display: grid;
		place-items: center;
		block-size: 2.5rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.top p {
		margin: 0;
	}
	.empty {
		display: grid;
		flex: 1;
		place-content: center;
		justify-items: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
		color: var(--ui-muted);
		text-align: center;
	}
	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-block: 0.75rem 0.5rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 500;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		block-size: 1px;
		background: var(--ui-line);
	}
	.divider.unread {
		color: var(--ui-danger);
	}
	.divider.unread::before,
	.divider.unread::after {
		background: color-mix(in srgb, var(--ui-danger) 40%, transparent);
	}

	.msg {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding-block: 0.0625rem;
		/* Lines up with the bubbles beside an avatar: 0.25rem + the 2rem avatar + the 0.5rem gap. */
		padding-inline: 2.75rem 0.25rem;
		border-radius: var(--ui-radius-control);
		outline: none;
		transition: background-color var(--ui-dur) ease;
	}
	.msg.first {
		margin-block-start: 0.5rem;
	}
	.msg.first:has(> .avatar) {
		padding-inline-start: 0.25rem;
	}
	.msg:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.msg.flash {
		background: color-mix(in srgb, var(--ui-accent) 14%, transparent);
	}
	.msg.arrived {
		animation: rise var(--ui-dur) var(--ui-ease-enter);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
	}
	.avatar {
		position: relative;
		flex: none;
	}
	.online {
		position: absolute;
		inset-inline-end: -1px;
		inset-block-end: -1px;
		inline-size: 0.625rem;
		block-size: 0.625rem;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 0 0 2px var(--ui-surface);
	}
	.stack {
		display: grid;
		justify-items: start;
		gap: 0.25rem;
		min-inline-size: 0;
		max-inline-size: min(36rem, 80%);
	}
	.who {
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.bubble {
		margin: 0;
		padding: 0.4375rem 0.75rem;
		border-radius: 1.125rem;
		background: var(--ui-subtle);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.bubble a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.mention {
		padding: 0 0.125rem;
		border-radius: 0.25rem;
		background: color-mix(in srgb, var(--ui-accent) 16%, transparent);
		font-weight: 600;
	}
	.mention.me {
		background: color-mix(in srgb, var(--ui-warning) 30%, transparent);
	}
	.edited {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.link-quiet {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		font-size: 0.75rem;
		text-decoration: underline dotted;
		cursor: pointer;
	}
	.history {
		display: grid;
		gap: 0.625rem;
		max-inline-size: 18rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.8125rem;
	}
	.history li {
		display: grid;
		gap: 0.125rem;
	}
	.history time {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.history li:not(.now) span {
		color: var(--ui-muted);
		text-decoration: line-through;
	}
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-style: italic;
	}
	.link-card {
		display: flex;
		gap: 0.625rem;
		inline-size: min(22rem, 100%);
		padding: 0.5rem;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
		color: inherit;
		font-size: 0.8125rem;
		text-decoration: none;
	}
	.link-card img {
		flex: none;
		inline-size: 4rem;
		block-size: 4rem;
		border-radius: 0.5rem;
		object-fit: cover;
	}
	.link-card > span {
		display: grid;
		align-content: start;
		gap: 0.125rem;
		min-inline-size: 0;
	}
	.link-card small {
		color: var(--ui-muted);
	}
	.desc {
		display: -webkit-box;
		overflow: hidden;
		color: var(--ui-muted);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.link-card:focus-visible,
	.link-quiet:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.mine .edited {
		color: inherit;
		opacity: 0.75;
	}
	.gone {
		background: none;
		box-shadow: inset 0 0 0 1px var(--ui-line);
		color: var(--ui-muted);
		font-style: italic;
	}

	/* Yours, as bubbles: on the far side, in the accent. */
	.bubbles .msg.mine {
		flex-direction: row-reverse;
		padding-inline: 0.25rem;
	}
	.bubbles .mine .stack {
		justify-items: end;
	}
	.bubbles .mine .bubble:not(.gone) {
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	/* Darker, not lighter, so the white text keeps its contrast on the accent. */
	.bubbles .mine .mention {
		background: color-mix(in srgb, black 20%, transparent);
	}
	.sending .bubble {
		opacity: 0.7;
	}

	/* Flat: everyone on one side, a name and time over each group, no bubbles (Slack). */
	.flat .msg {
		padding-inline: 3rem 0.5rem;
	}
	.flat .msg.first:has(> .avatar) {
		padding-inline-start: 0.5rem;
	}
	.flat .msg:hover {
		background: var(--ui-hover);
	}
	.flat .stack {
		max-inline-size: 100%;
		gap: 0.125rem;
	}
	.flat .who {
		color: var(--ui-fg);
		font-size: 0.875rem;
	}
	.flat .bubble {
		padding: 0;
		border-radius: 0;
		background: none;
	}
	.flat .gone {
		box-shadow: none;
	}
	.when {
		margin-inline-start: 0.375rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 400;
	}

	.quote {
		display: grid;
		max-inline-size: 100%;
		padding: 0.25rem 0.625rem;
		border: 0;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--ui-fg) 6%, transparent);
		color: var(--ui-muted);
		font: inherit;
		font-size: 0.8125rem;
		text-align: start;
		cursor: pointer;
	}
	.quote strong {
		color: var(--ui-fg);
		font-weight: 600;
	}
	.snippet {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.edit {
		display: grid;
		gap: 0.25rem;
		inline-size: min(28rem, 100%);
	}
	.edit textarea {
		box-sizing: border-box;
		inline-size: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		font: inherit;
		font-size: max(1rem, 16px);
		resize: none;
		field-sizing: content;
	}
	.edit textarea:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.hint {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.files {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: 0.375rem;
		inline-size: min(20rem, 100%);
	}
	.files :global(.voice) {
		grid-column: 1 / -1;
	}
	.files :global(.pic) {
		max-block-size: 16rem;
		border-radius: 0.75rem;
		overflow: hidden;
	}
	.file {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		grid-column: 1 / -1;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font-size: 0.8125rem;
		text-decoration: none;
	}
	.file strong {
		color: var(--ui-fg);
		font-weight: 500;
		overflow-wrap: anywhere;
	}
	.reactions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: 1.75rem;
		padding: 0 0.5rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: inherit;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.chip[aria-pressed='true'] {
		background: color-mix(in srgb, var(--ui-accent) 18%, transparent);
		color: var(--ui-accent);
		font-weight: 600;
	}
	.chip:active {
		scale: 0.94;
	}
	.replies,
	.link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--ui-accent);
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
	}
	.replies:hover,
	.link:hover {
		text-decoration: underline;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.meta:empty,
	.meta:not(:has(time, .state)) {
		display: none;
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	.state.read {
		color: var(--ui-accent);
	}
	.state.failed {
		color: var(--ui-danger);
		gap: 0.5rem;
	}
	.state.failed .link {
		font-size: 0.75rem;
	}

	/* Shown for the message you're pointing at or on, at its top corner. */
	.actions {
		position: absolute;
		inset-block-start: -0.875rem;
		inset-inline-end: 0.5rem;
		z-index: 1;
		display: flex;
		gap: 0.125rem;
		padding: 0.125rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		animation: rise 140ms var(--ui-ease-enter);
	}
	.bubbles .mine .actions {
		inset-inline: 0.5rem auto;
	}
	.act {
		display: grid;
		place-items: center;
		inline-size: 1.875rem;
		block-size: 1.875rem;
		padding: 0;
		border: 0;
		border-radius: calc(var(--ui-radius-control) - 0.125rem);
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
	}
	.act:hover,
	.act[aria-expanded='true'] {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	.picker {
		display: flex;
		gap: 0.125rem;
	}
	.picker button {
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		font-size: 1.25rem;
		cursor: pointer;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.picker button:hover,
	.picker button[aria-pressed='true'] {
		background: var(--ui-hover);
	}
	.picker button:active {
		scale: 0.9;
	}

	.typing {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-block-start: 0.5rem;
		padding-inline-start: 0.25rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.dots {
		display: inline-flex;
		gap: 0.1875rem;
		padding: 0.5rem 0.625rem;
		border-radius: 999px;
		background: var(--ui-subtle);
	}
	.dots i {
		inline-size: 0.375rem;
		block-size: 0.375rem;
		border-radius: 50%;
		background: var(--ui-muted);
		animation: bounce 1.2s infinite ease-in-out;
	}
	.dots i:nth-child(2) {
		animation-delay: 0.15s;
	}
	.dots i:nth-child(3) {
		animation-delay: 0.3s;
	}
	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: none;
			opacity: 0.5;
		}
		30% {
			transform: translateY(-0.1875rem);
			opacity: 1;
		}
	}

	.jump {
		position: absolute;
		inset-block-end: 0.75rem;
		inset-inline-end: 1rem;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		min-block-size: 2.25rem;
		padding: 0 0.625rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		color: var(--ui-fg);
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
	}
	.jump.news {
		inset-inline: 50% auto;
		translate: -50% 0;
		padding-inline: 0.875rem 0.75rem;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	:global([dir='rtl']) .jump.news {
		translate: 50% 0;
	}
	.jump:focus-visible,
	.act:focus-visible,
	.chip:focus-visible,
	.quote:focus-visible,
	.replies:focus-visible,
	.link:focus-visible,
	.file:focus-visible,
	.picker button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}

	.composer {
		grid-row: 3;
		display: grid;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem 0.75rem;
	}
	.row {
		display: flex;
		align-items: flex-end;
		gap: 0.25rem;
	}
	.text {
		flex: 1;
		min-inline-size: 0;
	}
	.text :global(.field > label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.text :global(textarea) {
		max-block-size: 10rem;
		resize: none;
	}
	.text :global(textarea::placeholder) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.replying {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.375rem 0.375rem 0.375rem 0.75rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.replying > span {
		display: flex;
		gap: 0.375rem;
		min-inline-size: 0;
	}
	.replying strong {
		color: var(--ui-fg);
		flex: none;
	}
	.pending {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.pending li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		max-inline-size: 14rem;
		padding: 0.125rem 0.125rem 0.125rem 0.5rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		.msg.arrived,
		.actions,
		.dots i {
			animation: none;
		}
		.msg {
			transition: none;
		}
	}
</style>
