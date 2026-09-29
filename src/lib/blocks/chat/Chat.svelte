<script lang="ts">
	import { pop, reflow } from '#lib/ui/motion.js';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { tick, type Snippet } from 'svelte';
	import {
		ArrowDown02Icon,
		ArrowUp02Icon,
		Attachment01Icon,
		Cancel01Icon,
		Copy01Icon,
		Pdf01Icon,
		PencilEdit02Icon,
		StopIcon,
		MusicNote01Icon,
		Tick02Icon
	} from '@hugeicons/core-free-icons';
	import type { ContentPart } from '@tanstack/ai';
	import {
		createChat,
		type ChatClientPersistence,
		type ConnectionAdapter
	} from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	interface Props {
		/** Where replies come from: fetchServerSentEvents('/api/chat'), or your own adapter. */
		connection: ConnectionAdapter;
		title?: string;
		/** Questions offered when the chat is empty. */
		suggestions?: string[];
		placeholder?: string;
		/** Keeps the conversation across reloads: a stable id for it, and where to store it. */
		threadId?: string;
		persistence?: ChatClientPersistence;
		/** Lets people attach images, audio, video and PDFs (by button, drop or paste). */
		attachments?: boolean;
		/** Called with the text of each message sent: to name a conversation, say. */
		onsend?: (text: string) => void;
		/** New chat starts a fresh conversation elsewhere (a new thread) instead of clearing this one. */
		onnew?: () => void;
		/** Replaces the header: gets New chat's action, and whether it's unavailable right now. */
		header?: Snippet<[() => void, boolean]>;
		class?: string;
	}

	let {
		connection,
		title = 'Ask the librarian',
		suggestions = [],
		placeholder = 'Ask anything…',
		threadId,
		persistence,
		attachments = false,
		onsend,
		onnew,
		header,
		class: className
	}: Props = $props();

	const uid = $props.id();
	// svelte-ignore state_referenced_locally
	const chat = createChat({
		connection,
		...((threadId && persistence ? { threadId, persistence } : {}) as { threadId?: string }),
		// Heard once the whole reply is in, not word by word as it streams.
		onFinish: (message) => {
			const text = message.parts.map((p) => (p.type === 'text' ? p.content : '')).join('');
			announce(text.slice(0, 280));
		}
	});

	let input = $state('');
	let box = $state<HTMLTextAreaElement>();
	let log = $state<HTMLDivElement>();
	const empty = $derived(chat.messages.length === 0);
	function newChat() {
		if (onnew) onnew();
		else chat.clear();
		box?.focus();
	}
	const last = $derived(chat.messages.at(-1));
	// Waiting for the first word of a reply.
	const thinking = $derived(chat.isLoading && last?.role === 'user');

	function send(text = input) {
		const content = text.trim();
		if ((!content && !files.length) || chat.isLoading) return;
		const parts: ContentPart[] = [
			...(content ? [{ type: 'text' as const, content }] : []),
			...files.map((f) => f.part)
		];
		input = '';
		files = [];
		stick = true;
		// Plain text stays a plain string; anything attached goes as content parts.
		chat.sendMessage(parts.length === 1 && parts[0].type === 'text' ? content : { content: parts });
		onsend?.(content);
		box?.focus();
	}

	// Attachments travel inline as base64, so they're kept small.
	const MAX = 4 * 1024 * 1024;
	const mb = new Intl.NumberFormat('en', {
		style: 'unit',
		unit: 'megabyte',
		maximumFractionDigits: 1
	});
	type Pending = { id: string; name: string; url: string; part: ContentPart };
	let files = $state<Pending[]>([]);
	let fileError = $state('');
	let picker = $state<HTMLInputElement>();
	let dropping = $state(false);
	const kindOf = (type: string) =>
		(['image', 'audio', 'video'] as const).find((k) => type.startsWith(`${k}/`)) ??
		(type === 'application/pdf' ? 'document' : undefined);
	function add(list: FileList | File[] | null | undefined) {
		fileError = '';
		for (const file of list ?? []) {
			const kind = kindOf(file.type);
			if (!kind) {
				fileError = `${file.name} isn't an image, audio, video or PDF file.`;
				continue;
			}
			if (file.size > MAX) {
				fileError = `${file.name} is ${mb.format(file.size / 1048576)}; files can be up to ${mb.format(4)}.`;
				continue;
			}
			const reader = new FileReader();
			reader.onload = () => {
				const url = reader.result as string;
				const part = {
					type: kind,
					source: { type: 'data', value: url.split(',')[1], mimeType: file.type },
					metadata: { name: file.name }
				} as ContentPart;
				files = [...files, { id: crypto.randomUUID(), name: file.name, url, part }];
				announce(`${file.name} attached`);
			};
			reader.readAsDataURL(file);
		}
	}
	const srcOf = (p: { source: { type: string; value: string; mimeType?: string } }) =>
		p.source.type === 'data'
			? `data:${p.source.mimeType};base64,${p.source.value}`
			: p.source.value;
	const nameOf = (p: { metadata?: unknown }) =>
		(p.metadata as { name?: string } | undefined)?.name ?? 'Document';

	// Follows new text only while you're at the bottom; scrolled up to read, you stay put.
	let stick = $state(true);
	let unseen = $state(false);
	const atBottom = () => !!log && log.scrollHeight - log.scrollTop - log.clientHeight < 32;
	$effect(() => {
		// Any change to the conversation, streaming included.
		void chat.messages.map((m) => m.parts.map((p) => (p.type === 'text' ? p.content.length : 0)));
		tick().then(() => {
			if (!log) return;
			if (stick) log.scrollTop = log.scrollHeight;
			else unseen = true;
		});
	});
	function toBottom() {
		stick = true;
		unseen = false;
		log?.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
	}

	const textOf = (m: (typeof chat.messages)[number]) =>
		m.parts.map((p) => (p.type === 'text' ? p.content : '')).join('');

	let copied = $state<string>();
	async function copy(id: string, text: string) {
		await navigator.clipboard.writeText(text);
		copied = id;
		announce('Copied');
		setTimeout(() => copied === id && (copied = undefined), 1500);
	}
</script>

<!-- Files dropped anywhere on the chat are attached (pointer only; the attach button does the same). -->
<section
	class={['chat', dropping && 'dropping', className]}
	aria-label={title}
	ondragover={(e) => {
		if (!attachments || !e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		dropping = true;
	}}
	ondragleave={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) dropping = false;
	}}
	ondrop={(e) => {
		if (!attachments) return;
		e.preventDefault();
		dropping = false;
		add(e.dataTransfer?.files);
	}}
>
	<header>
		{#if header}{@render header(newChat, empty || chat.isLoading)}{:else}
			<h2>{title}</h2>
			<Button variant="ghost" size="sm" disabled={empty || chat.isLoading} onclick={newChat}>
				<Icon icon={PencilEdit02Icon} size={16} /> New chat
			</Button>
		{/if}
	</header>

	<!-- A log: replies are announced when complete (aria-busy holds them while they stream). -->
	<div
		bind:this={log}
		class="log"
		{@attach scrollEdges}
		data-fade
		role="log"
		aria-label="Conversation"
		aria-busy={chat.isLoading}
		tabindex="-1"
		onscroll={() => {
			stick = atBottom();
			if (stick) unseen = false;
		}}
	>
		{#if empty}
			<div class="welcome">
				<p class="hello">How can I help you today?</p>
				{#if suggestions.length}
					<ul class="suggestions" aria-label="Suggested questions">
						{#each suggestions as s (s)}
							<li><button type="button" onclick={() => send(s)}>{s}</button></li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		{#each chat.messages as m, i (m.id)}
			{@const text = textOf(m)}
			{@const streaming =
				chat.isLoading && i === chat.messages.length - 1 && m.role === 'assistant'}
			{@const media = m.parts.filter(
				(p) =>
					p.type === 'image' || p.type === 'audio' || p.type === 'video' || p.type === 'document'
			)}
			<article class={['message', m.role]} aria-label={m.role === 'user' ? 'You' : 'Librarian'}>
				{#if media.length}
					<div class="media">
						{#each media as part, k (k)}
							{#if part.type === 'image'}
								<img src={srcOf(part)} alt={nameOf(part)} />
							{:else if part.type === 'audio'}
								<audio controls src={srcOf(part)} aria-label={nameOf(part)}></audio>
							{:else if part.type === 'video'}
								<!-- svelte-ignore a11y_media_has_caption -->
								<video controls src={srcOf(part)} aria-label={nameOf(part)}></video>
							{:else}
								<span class="doc"><Icon icon={Pdf01Icon} size={18} />{nameOf(part)}</span>
							{/if}
						{/each}
					</div>
				{/if}
				{#if text || streaming}
					<div class="bubble">
						{#each text.split(/\n{2,}/) as para, p (p)}
							<p>
								{para}{#if streaming && p === text.split(/\n{2,}/).length - 1}<span
										class="caret"
										aria-hidden="true"
									></span>{/if}
							</p>
						{/each}
					</div>
				{/if}
				{#if m.role === 'assistant' && !streaming && text}
					<div class="tools">
						<Button
							variant="ghost"
							size="sm"
							square
							aria-label={copied === m.id ? 'Copied' : 'Copy reply'}
							onclick={() => copy(m.id, text)}
						>
							<Icon icon={copied === m.id ? Tick02Icon : Copy01Icon} size={15} />
						</Button>
					</div>
				{/if}
			</article>
		{/each}

		{#if thinking}
			<div class="thinking" aria-label="The librarian is writing">
				<span></span><span></span><span></span>
			</div>
		{/if}

		{#if chat.error}
			<div class="failed" role="alert">
				<p>The reply didn't come through. Check your connection and try again.</p>
				<Button variant="secondary" size="sm" onclick={() => chat.reload()}>Retry</Button>
			</div>
		{/if}
	</div>

	{#if unseen}
		<button type="button" class="jump" onclick={toBottom}>
			New reply <Icon icon={ArrowDown02Icon} size={14} />
		</button>
	{/if}

	<form
		class="composer"
		onsubmit={(e) => {
			e.preventDefault();
			send();
		}}
	>
		<ul class="pending" aria-label="Attachments">
			{#each files as f (f.id)}
				<li animate:reflow out:pop={{ start: 0.9, duration: 160 }}>
					{#if f.part.type === 'image'}
						<img src={f.url} alt="" />
					{:else if f.part.type === 'video'}
						<video src={f.url} muted></video>
					{:else}
						<Icon icon={f.part.type === 'audio' ? MusicNote01Icon : Pdf01Icon} size={20} />
					{/if}
					<span class="file-name">{f.name}</span>
					<button
						type="button"
						class="remove"
						aria-label="Remove {f.name}"
						onclick={() => {
							files = files.filter((x) => x.id !== f.id);
							box?.focus();
						}}><Icon icon={Cancel01Icon} size={12} strokeWidth={2.5} /></button
					>
				</li>
			{/each}
		</ul>

		{#if fileError}<p class="file-error" role="alert">{fileError}</p>{/if}
		{#if attachments}
			<input
				bind:this={picker}
				class="sr-only"
				type="file"
				multiple
				accept="image/*,audio/*,video/*,application/pdf"
				tabindex="-1"
				aria-hidden="true"
				onchange={(e) => {
					add(e.currentTarget.files);
					e.currentTarget.value = '';
				}}
			/>
			<Button variant="ghost" square aria-label="Attach files" onclick={() => picker?.click()}>
				<Icon icon={Attachment01Icon} size={18} />
			</Button>
		{/if}
		<label class="sr-only" for="{uid}-input">Message</label>
		<textarea
			bind:this={box}
			bind:value={input}
			id="{uid}-input"
			rows="1"
			{placeholder}
			onpaste={(e) => {
				if (attachments && e.clipboardData?.files.length) {
					e.preventDefault();
					add(e.clipboardData.files);
				}
			}}
			onkeydown={(e) => {
				// Enter sends; Shift+Enter is a new line; composing (IME) is left alone.
				if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
					e.preventDefault();
					send();
				}
			}}></textarea>
		{#if chat.isLoading}
			<Button variant="secondary" square aria-label="Stop the reply" onclick={() => chat.stop()}>
				<Icon icon={StopIcon} size={16} />
			</Button>
		{:else}
			<Button type="submit" square aria-label="Send" disabled={!input.trim() && !files.length}>
				<Icon icon={ArrowUp02Icon} size={18} />
			</Button>
		{/if}
	</form>
</section>

<style>
	.chat {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr auto;
		inline-size: 100%;
		block-size: 34rem;
		max-block-size: 80dvh;
		overflow: hidden;
		/* Concentric corners: card 1.75rem = the input's 1rem + its 0.75rem margin; the input's
		   1rem = our buttons' 0.5rem + its 0.5rem padding. */
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.9375rem/1.55 var(--ui-font);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 0.75rem;
		padding-inline: 1.25rem 0.75rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	h2 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.log {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		outline: none;
	}
	.welcome {
		display: grid;
		justify-items: center;
		gap: 1rem;
		margin-block: auto;
		text-align: center;
	}
	.hello {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.suggestions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		max-inline-size: 30rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.suggestions button {
		padding: 0.5rem 0.875rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: inherit;
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.suggestions button:hover {
		background: var(--ui-hover);
	}
	.suggestions button:active {
		transform: scale(0.97);
	}
	.suggestions button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* New messages rise in. */
	.message {
		display: grid;
		gap: 0.25rem;
		max-inline-size: min(36rem, 88%);
		animation: rise 260ms var(--ui-ease-out);
	}
	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 6px;
		}
	}
	.user {
		align-self: flex-end;
		justify-items: end;
	}
	.bubble p {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.bubble p + p {
		margin-block-start: 0.625rem;
	}
	.user .bubble {
		padding: 0.625rem 0.875rem;
		/* The tail corner points toward the reading end, where your messages sit. */
		border-radius: 1.125rem;
		border-end-end-radius: 0.375rem;
		background: color-mix(in srgb, var(--ui-accent) 14%, var(--ui-surface));
	}
	.assistant .bubble {
		padding-block: 0.25rem;
	}
	/* While a reply streams, a soft caret sits at its end. */
	.caret {
		display: inline-block;
		inline-size: 0.5em;
		block-size: 1em;
		margin-inline-start: 0.125rem;
		vertical-align: -0.12em;
		border-radius: 2px;
		background: var(--ui-accent);
		animation: blink 1s steps(2) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.2;
		}
	}
	.tools {
		display: flex;
		margin-inline-start: -0.375rem;
		opacity: 0.6;
		transition: opacity var(--ui-dur) ease;
	}
	.message:hover .tools,
	.tools:focus-within {
		opacity: 1;
	}
	.thinking {
		display: flex;
		gap: 0.3rem;
		padding-block: 0.5rem;
	}
	.thinking span {
		inline-size: 0.45rem;
		block-size: 0.45rem;
		border-radius: 50%;
		background: var(--ui-muted);
		animation: dot 1.2s ease-in-out infinite;
	}
	.thinking span:nth-child(2) {
		animation-delay: 0.15s;
	}
	.thinking span:nth-child(3) {
		animation-delay: 0.3s;
	}
	@keyframes dot {
		0%,
		60%,
		100% {
			opacity: 0.3;
			translate: 0 0;
		}
		30% {
			opacity: 1;
			translate: 0 -3px;
		}
	}
	.failed {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-radius: var(--ui-radius);
		background: color-mix(in srgb, var(--ui-danger) 10%, var(--ui-surface));
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	.failed p {
		margin: 0;
	}
	.jump {
		position: absolute;
		inset-inline: 0;
		bottom: 5.25rem;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		inline-size: max-content;
		margin-inline: auto;
		padding: 0.375rem 0.875rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-fg);
		color: var(--ui-surface);
		font: 500 0.8125rem/1 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
		cursor: pointer;
		animation: rise 200ms var(--ui-ease-out);
	}
	.jump:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.composer {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.5rem;
		margin: 0 0.75rem 0.75rem;
		padding-block: 0.5rem;
		padding-inline: 1rem 0.5rem;
		border: 1px solid var(--ui-field-line);
		border-radius: 1rem;
		background: var(--ui-surface);
	}
	.composer:focus-within {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	textarea {
		flex: 1;
		min-inline-size: 0;
		max-block-size: 10rem;
		margin: 0;
		padding: 0.375rem 0;
		border: 0;
		outline: none;
		background: none;
		color: inherit;
		font: inherit;
		font-size: max(1rem, 16px);
		resize: none;
		/* Grows with what's typed, up to a few lines. */
		field-sizing: content;
	}
	/* Attached, waiting to send: small previews in their own row above the text. */
	.pending:empty {
		display: none;
	}
	.pending {
		display: flex;
		flex-wrap: wrap;
		flex-basis: 100%;
		gap: 0.5rem;
		margin-block: 0.25rem;
		margin-inline: -0.5rem 0;
		padding: 0;
		list-style: none;
	}
	.pending li {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-inline-size: 12rem;
		block-size: 3.5rem;
		padding-inline: 0.25rem 0.75rem;
		border-radius: 0.625rem;
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font-size: 0.8125rem;
		animation: rise 200ms var(--ui-ease-out);
	}
	.pending :is(img, video) {
		inline-size: 3rem;
		block-size: 3rem;
		border-radius: 0.375rem;
		object-fit: cover;
	}
	.pending li > :global(svg) {
		margin-inline-start: 0.5rem;
	}
	.file-name {
		overflow: hidden;
		color: var(--ui-fg);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.remove {
		position: absolute;
		inset-block-start: -0.375rem;
		inset-inline-end: -0.375rem;
		display: grid;
		place-items: center;
		inline-size: 1.25rem;
		block-size: 1.25rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-fg);
		color: var(--ui-surface);
		cursor: pointer;
	}
	.remove:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.file-error {
		flex-basis: 100%;
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.8125rem;
	}
	/* Sent media sits above the message's text. */
	.media {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.375rem;
	}
	.assistant .media {
		justify-content: flex-start;
	}
	.media :is(img, video) {
		display: block;
		max-inline-size: min(16rem, 100%);
		max-block-size: 14rem;
		border-radius: 0.875rem;
		object-fit: cover;
	}
	.media audio {
		max-inline-size: 100%;
	}
	.doc {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border-radius: 0.875rem;
		background: var(--ui-subtle);
		font-size: 0.875rem;
	}
	.doc :global(svg) {
		color: var(--ui-danger);
	}
	/* Dragging files over the chat: it says where they'll go. */
	.dropping::after {
		content: 'Drop to attach';
		position: absolute;
		inset: 0.5rem;
		z-index: 2;
		display: grid;
		place-items: center;
		border-radius: 1.25rem;
		background: color-mix(in srgb, var(--ui-accent) 12%, var(--ui-surface));
		color: var(--ui-accent);
		font-weight: 600;
		pointer-events: none;
	}
	textarea::placeholder {
		color: var(--ui-muted);
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.message,
		.pending li,
		.jump {
			animation: none;
		}
		.caret,
		.thinking span {
			animation-duration: 2s;
		}
	}
</style>
