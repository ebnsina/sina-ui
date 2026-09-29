<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';
	import server from '#lib/blocks/chat/chat-endpoint.ts.txt?raw';
	import env from '#lib/blocks/chat/env.ts.txt?raw';

	const ex = examples(
		import.meta.glob<Component>('./examples/*.svelte', { eager: true, import: 'default' }),
		import.meta.glob<string>('./examples/*.svelte', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	);
</script>

<svelte:head>
	<title>AI chat — Sina UI</title>
	<meta name="description" content="A streaming AI chat with Claude, built on TanStack AI." />
	<meta property="og:title" content="AI chat — Sina UI" />
	<meta
		property="og:description"
		content="A streaming AI chat with Claude, built on TanStack AI."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>AI chat</h1>
<p class="lede">
	A complete chat with an AI model: replies stream in, you can stop them, copy them, and start over.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="librarian"
	title="Simple"
	description="This demo answers from a small script so it runs without a key; your app streams real replies from Claude. Scroll up while it writes and it leaves you there, with a button back down."
	{...ex('librarian')}
/>
<Example
	id="assistant"
	title="Assistant with history"
	description="Conversations are kept in this browser and listed by day; reload and they're still here. Attach images, audio, video or PDFs with the paperclip, by dropping them on the chat, or by pasting."
	{...ex('assistant')}
/>
<Example
	id="terminal"
	title="Terminal agent"
	description="An agent in a terminal: it thinks, calls tools and shows what each returned, then answers. Try “How did Ibn al-Haytham explain sight?”, then /help. Escape interrupts a run; Up brings back what you sent."
	{...ex('terminal')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/chat">
	<p>
		Copy <code>src/lib/blocks/chat/</code>, and the <code>Button</code>, <code>Icon</code> and
		<code>announce.ts</code> it uses. Then install TanStack AI with its Anthropic adapter:
	</p>
	<Code
		code="pnpm add @tanstack/ai@0.63.0 @tanstack/ai-svelte@0.24.3 @tanstack/ai-anthropic@0.19.3"
		lang="shell"
		label="Install command"
	/>
	<p>
		These are early versions, so they're pinned exactly: a later one may change its API. Upgrade on
		purpose, one at a time.
	</p>
</Install>

<h3 id="endpoint">The endpoint</h3>
<p>Add a route that streams replies from Claude:</p>
<Code code={server} lang="ts" label="src/routes/api/chat/+server.ts" />

<h3 id="key">Your API key</h3>
<p>
	Declare the key, so the app refuses to start without it rather than showing a chat that never
	answers. Set <code>ANTHROPIC_API_KEY</code> in your environment.
</p>
<Code code={env} lang="ts" label="src/env.ts" />
<p>
	Then give the block its connection:
	<code>connection={'{'}fetchServerSentEvents('/api/chat'){'}'}</code>.
</p>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>connection</code></td><td>TanStack AI connection (required)</td><td></td></tr>
		<tr
			><td><code>title</code></td><td><code>string</code></td><td
				><code>'Ask the librarian'</code></td
			></tr
		>
		<tr
			><td><code>suggestions</code></td><td><code>string[]</code>: questions offered when empty</td
			><td></td></tr
		>
		<tr
			><td><code>placeholder</code></td><td><code>string</code></td><td
				><code>'Ask anything…'</code></td
			></tr
		>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Enter</td><td>Send</td></tr>
		<tr><td>Shift + Enter</td><td>A new line</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The conversation is a log: each reply is read once it's complete, never word by word as it
		streams.
	</li>
	<li>
		Stop, Copy, Retry and New chat are named buttons; Send says so, and is unavailable until there's
		something to send.
	</li>
	<li>A failed reply is announced, in plain words, with a way to try again.</li>
	<li>With reduced motion, messages appear without rising and the typing dots slow down.</li>
</ul>
