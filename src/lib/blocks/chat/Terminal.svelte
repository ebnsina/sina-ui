<script lang="ts">
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { tick } from 'svelte';
	import { createChat, type ConnectionAdapter } from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import { now } from '#lib/ui/now.svelte.js';

	interface Props {
		/** An agent endpoint: fetchServerSentEvents('/api/agent'), or your own adapter. */
		connection: ConnectionAdapter;
		/** Shown in the title bar and the welcome line. */
		name?: string;
		/** Where the agent works, shown as a path. */
		cwd?: string;
		model?: string;
		class?: string;
	}

	let {
		connection,
		name = 'Librarian',
		cwd = '~/house-of-wisdom',
		model = 'claude-sonnet-5',
		class: className
	}: Props = $props();

	const uid = $props.id();
	// svelte-ignore state_referenced_locally
	const chat = createChat({
		connection,
		onFinish: (m) =>
			announce(
				m.parts
					.map((p) => (p.type === 'text' ? p.content : ''))
					.join('')
					.slice(0, 280)
			)
	});

	const COMMANDS = [
		{ name: '/clear', hint: 'Start a fresh conversation' },
		{ name: '/help', hint: 'Show commands and keys' }
	];
	let input = $state('');
	let box = $state<HTMLTextAreaElement>();
	let log = $state<HTMLDivElement>();
	let help = $state(false);
	let notice = $state('');
	const matches = $derived(
		input.startsWith('/') && !input.includes(' ')
			? COMMANDS.filter((c) => c.name.startsWith(input))
			: []
	);

	// Up and Down walk back through what you've sent, as in a shell.
	const history: string[] = [];
	let back = -1;

	function run(line: string) {
		const text = line.trim();
		notice = '';
		if (!text) return;
		history.unshift(text);
		back = -1;
		input = '';
		if (text.startsWith('/')) {
			if (text === '/clear') {
				chat.clear();
				help = false;
				announce('Conversation cleared');
			} else if (text === '/help') help = !help;
			else notice = `Unknown command ${text}. Try /help.`;
			return;
		}
		if (chat.isLoading) return;
		help = false;
		chat.sendMessage(text);
	}

	function keys(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			run(input);
		} else if (e.key === 'Escape' && chat.isLoading) {
			e.preventDefault();
			chat.stop();
			announce('Interrupted');
		} else if (e.key === 'Tab' && matches.length) {
			e.preventDefault();
			input = matches[0].name;
		} else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !input.includes('\n')) {
			const next = back + (e.key === 'ArrowUp' ? 1 : -1);
			if (next < -1 || next >= history.length) return;
			e.preventDefault();
			back = next;
			input = next === -1 ? '' : history[next];
		}
	}

	// Always follows the output, as a terminal does.
	$effect(() => {
		void JSON.stringify(chat.messages);
		void help;
		tick().then(() => log && (log.scrollTop = log.scrollHeight));
	});

	// While it works: a turning glyph, what it's doing, and for how long.
	const GLYPHS = ['·', '✢', '✳', '✶', '✻', '✽'];
	let frame = $state(0);
	let started = $state(0);
	$effect(() => {
		if (!chat.isLoading) return;
		started = Date.now();
		const t = setInterval(() => (frame = (frame + 1) % GLYPHS.length), 120);
		return () => clearInterval(t);
	});
	const elapsed = $derived(chat.isLoading ? Math.max(0, Math.floor((now() - started) / 1000)) : 0);
	const doing = $derived.by(() => {
		const parts = chat.messages.at(-1)?.parts ?? [];
		const running = parts.find(
			(p) => p.type === 'tool-call' && p.state !== 'complete' && !('output' in p && p.output)
		);
		if (running && running.type === 'tool-call') return `Running ${running.name}`;
		if (parts.at(-1)?.type === 'text') return 'Writing';
		return 'Thinking';
	});

	// search_catalogue {"query":"optics"} reads as search_catalogue("optics").
	function call(name: string, args: string) {
		try {
			const values = Object.values(JSON.parse(args || '{}')).map((v) => JSON.stringify(v));
			return `${name}(${values.join(', ')})`;
		} catch {
			return `${name}(…)`;
		}
	}
	const summary = (output: unknown) =>
		typeof output === 'object' && output && 'summary' in output
			? String(output.summary)
			: typeof output === 'string'
				? output
				: 'Done';
</script>

<section class={['term', className]} aria-label="{name} terminal">
	<header>
		<span class="path">{name} — {cwd}</span>
	</header>

	<div
		bind:this={log}
		class="log"
		{@attach scrollEdges}
		data-fade
		role="log"
		aria-label="Session"
		aria-busy={chat.isLoading}
		tabindex="-1"
		onpointerup={() => {
			// A click in the output puts you back at the prompt, unless you were selecting text.
			if (!getSelection()?.toString()) box?.focus();
		}}
	>
		<div class="welcome">
			<p><span class="accent">✻</span> Welcome to <strong>{name}</strong></p>
			<p class="dim">/help for commands · cwd: {cwd}</p>
		</div>

		{#each chat.messages as m (m.id)}
			{#if m.role === 'user'}
				<p class="line user">
					<span class="accent" aria-hidden="true">›</span>
					{m.parts.map((p) => (p.type === 'text' ? p.content : '')).join('')}
				</p>
			{:else}
				{#each m.parts as part, i (i)}
					{#if part.type === 'thinking' && part.content}
						<p class="line thinking"><span aria-hidden="true">✻</span> {part.content}</p>
					{:else if part.type === 'tool-call'}
						{@const done = 'output' in part && part.output !== undefined}
						<div class="tool">
							<p class="line">
								<span
									class={['dot', done ? 'ok' : 'busy', part.state === 'error' && 'bad']}
									aria-hidden="true">⏺</span
								>
								<strong>{call(part.name, part.arguments)}</strong>
							</p>
							{#if done}
								<p class="line result"><span aria-hidden="true">⎿</span> {summary(part.output)}</p>
							{/if}
						</div>
					{:else if part.type === 'text' && part.content}
						<div class="line answer">
							<span class="dot fg" aria-hidden="true">⏺</span>
							<div>
								{#each part.content.split(/\n{2,}/) as para, p (p)}<p>{para}</p>{/each}
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		{/each}

		{#if chat.isLoading}
			<p class="line status" aria-hidden="true">
				<span class="accent glyph">{GLYPHS[frame]}</span>
				{doing}… <span class="dim">({elapsed}s · esc to interrupt)</span>
			</p>
		{/if}
		{#if chat.error}
			<p class="line error" role="alert">
				⏺ The run failed. Check your connection, then send again.
			</p>
		{/if}
		{#if help}
			<div class="help">
				{#each COMMANDS as c (c.name)}
					<p><span class="accent">{c.name}</span> <span class="dim">{c.hint}</span></p>
				{/each}
				<p><span class="accent">esc</span> <span class="dim">Interrupt a run</span></p>
				<p><span class="accent">↑ ↓</span> <span class="dim">Earlier messages</span></p>
				<p><span class="accent">shift ↵</span> <span class="dim">New line</span></p>
			</div>
		{/if}
	</div>

	<div class="prompt">
		<span class="accent" aria-hidden="true">›</span>
		<label class="sr-only" for="{uid}-input">Message</label>
		<textarea
			bind:this={box}
			bind:value={input}
			id="{uid}-input"
			rows="1"
			placeholder={chat.messages.length ? '' : 'Ask about a manuscript…'}
			spellcheck="false"
			autocomplete="off"
			aria-describedby="{uid}-keys"
			onkeydown={keys}></textarea>
	</div>
	{#if matches.length}
		<ul class="commands" aria-label="Commands">
			{#each matches as c (c.name)}
				<li><span class="accent">{c.name}</span> <span class="dim">{c.hint}</span></li>
			{/each}
		</ul>
	{/if}
	<footer>
		<span id="{uid}-keys">{notice || '↵ send · esc interrupt · ↑ history · /help'}</span>
		<span>{model}</span>
	</footer>
</section>

<style>
	/* A terminal in the system's own colours: mono type, the accent for prompts and status. */
	.term {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto auto auto;
		inline-size: 100%;
		block-size: 32rem;
		max-block-size: 80dvh;
		overflow: hidden;
		/* Concentric with the prompt: its 0.75rem corners + its 0.75rem inset. */
		border-radius: 1.5rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.8125rem/1.6 var(--ui-font-mono);
	}
	header {
		padding: 0.625rem 1rem;
		box-shadow: inset 0 -1px var(--ui-line);
		color: var(--ui-muted);
		font-size: 0.75rem;
		text-align: center;
	}
	.log {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		outline: none;
		cursor: text;
	}
	p {
		margin: 0;
	}
	.accent {
		color: var(--ui-accent);
	}
	.dim {
		color: var(--ui-muted);
	}
	.welcome {
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--ui-accent) 8%, transparent);
	}
	.line {
		display: flex;
		gap: 0.625rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		animation: in 180ms var(--ui-ease-out);
	}
	@keyframes in {
		from {
			opacity: 0;
		}
	}
	.user {
		margin-block-start: 0.5rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.5rem;
		background: var(--ui-subtle);
	}
	.thinking {
		color: var(--ui-muted);
		font-style: italic;
	}
	.dot {
		flex: none;
	}
	.dot.fg {
		color: var(--ui-fg);
	}
	.dot.ok {
		color: var(--ui-accent);
	}
	.dot.busy {
		color: var(--ui-muted);
		animation: pulse 1s ease-in-out infinite;
	}
	.dot.bad {
		color: var(--ui-danger);
	}
	@keyframes pulse {
		50% {
			opacity: 0.25;
		}
	}
	.tool strong {
		font-weight: 600;
	}
	.result {
		padding-inline-start: 0.5rem;
		color: var(--ui-muted);
	}
	.answer p + p {
		margin-block-start: 0.5rem;
	}
	.status {
		color: var(--ui-muted);
	}
	.glyph {
		display: inline-block;
		inline-size: 1ch;
	}
	.error {
		color: var(--ui-danger);
	}
	.help {
		display: grid;
		gap: 0.125rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
	}
	.help .accent {
		display: inline-block;
		min-inline-size: 8ch;
	}
	/* The prompt: the only field, so it's the one place with an edge. */
	.prompt {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		margin: 0 0.75rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--ui-field-line);
		border-radius: 0.75rem;
	}
	.prompt:focus-within {
		border-color: var(--ui-accent);
	}
	.prompt > .accent {
		line-height: 1.6;
	}
	textarea {
		flex: 1;
		min-inline-size: 0;
		max-block-size: 8rem;
		margin: 0;
		padding: 0;
		border: 0;
		outline: none;
		background: none;
		color: inherit;
		font: inherit;
		/* 16px stops phones zooming in on focus. */
		font-size: max(0.8125rem, 16px);
		resize: none;
		field-sizing: content;
		caret-color: var(--ui-accent);
	}
	@media (pointer: fine) {
		textarea {
			font-size: inherit;
		}
	}
	textarea::placeholder {
		color: var(--ui-muted);
	}
	.commands {
		display: grid;
		gap: 0.125rem;
		margin: 0.375rem 0.75rem 0;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
		list-style: none;
	}
	.commands .accent {
		display: inline-block;
		min-inline-size: 8ch;
	}
	footer {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 1.25rem 0.75rem;
		color: var(--ui-muted);
		font-size: 0.6875rem;
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
		.line {
			animation: none;
		}
		.dot.busy {
			animation-duration: 2s;
		}
	}
</style>
