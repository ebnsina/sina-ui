<script lang="ts">
	import { resolve } from '$app/paths';
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';

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
	<title>Chat — Sina UI</title>
	<meta
		name="description"
		content="A message thread that stays at the newest message without pulling you out of history: receipts, retry, replies, reactions, attachments, voice notes, mentions, typing and older pages."
	/>
	<meta property="og:title" content="Chat — Sina UI" />
	<meta
		property="og:description"
		content="A message thread that stays at the newest message without pulling you out of history: receipts, retry, replies, reactions, attachments, voice notes, mentions, typing and older pages."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Chat</h1>
<p class="lede">
	A conversation between people. It follows new messages while you're at the bottom and leaves you
	where you are while you read back, with a button for what arrived meanwhile. Your messages show at
	once and say when they're delivered, read, or need a retry. This is the conversation itself; for a
	whole app with a conversation list, search, threads and details, use the
	<a href={resolve('/blocks/messaging')}>Messaging block</a>.
</p>

<h2 id="installation">Installation</h2>
<Install names="chat">
	<p>
		Copy <code>src/lib/ui/Chat.svelte</code> and <code>chat.ts</code>, with <code>Avatar</code>,
		<code>Button</code>, <code>Icon</code>, <code>Image</code>, <code>MentionInput</code>,
		<code>Popover</code>, <code>Spinner</code>, <code>VoiceNote</code>, the dropdown folder,
		<code>announce.ts</code>, <code>motion.ts</code>, <code>scroll-edges.ts</code> and
		<code>tokens.css</code>. Icons come from <code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="A conversation"
	description="Type and press Enter; Shift+Enter starts a new line. Point at a message, or tab to it, for its actions."
	{...ex('basic')}
/>
<Example
	id="receipts"
	title="Delivered, read, and retry"
	description="Send something: it goes from Sending to Sent, Delivered and Read. Turn on “Fail the next send” to see Retry."
	{...ex('receipts')}
/>
<Example
	id="replies"
	title="Replies and reactions"
	description="Press a quoted message to jump to the original. React from a message's actions; press a reaction to add or take back yours."
	{...ex('replies')}
/>
<Example
	id="attachments"
	title="Pictures and files"
	description="Pictures open larger when pressed; files download. Attach your own with the paper clip."
	{...ex('attachments')}
/>
<Example
	id="history"
	title="Older messages"
	description="500 messages, loaded 40 at a time as you scroll up. What you're reading stays put while each page arrives above it."
	{...ex('history')}
/>
<Example
	id="live"
	title="Typing and new messages"
	description="Send something and Al-Kindi types back. Scroll up first, then press “Thabit writes in”: you stay where you are and a button counts what's new."
	{...ex('live')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>messages</code></td><td><code>ChatMessage[]</code>, oldest first (bindable)</td><td
				><code>[]</code></td
			></tr
		>
		<tr
			><td><code>users</code></td><td><code>ChatUser[]</code>, you included (required)</td><td
			></td></tr
		>
		<tr><td><code>me</code></td><td><code>string</code>: your user id (required)</td><td></td></tr>
		<tr
			><td><code>variant</code></td><td
				><code>'bubbles'</code> (yours on the far side) or <code>'flat'</code> (everyone on one side)</td
			><td><code>'bubbles'</code></td></tr
		>
		<tr
			><td><code>send</code></td><td
				><code>(message, files) =&gt; Promise</code>: resolve to mark it sent, throw to offer Retry</td
			><td></td></tr
		>
		<tr
			><td><code>save</code></td><td
				><code>(message) =&gt; Promise</code>: saves an edit, delete or reaction; throw to undo it</td
			><td></td></tr
		>
		<tr
			><td><code>older</code></td><td
				><code>() =&gt; Promise&lt;ChatMessage[]&gt;</code>: the page before; empty at the start</td
			><td></td></tr
		>
		<tr
			><td><code>unread</code></td><td
				><code>string</code>: the first unread message's id, for the New divider</td
			><td></td></tr
		>
		<tr
			><td><code>typing</code></td><td><code>string[]</code>: who's typing</td><td
				><code>[]</code></td
			></tr
		>
		<tr
			><td><code>thread</code></td><td
				><code>(message) =&gt; void</code>: adds Reply in thread and a replies link</td
			><td></td></tr
		>
		<tr
			><td><code>menu</code></td><td
				><code>{'{ label, icon, run, show? }[]'}</code>: more items for each message's menu</td
			><td><code>[]</code></td></tr
		>
		<tr
			><td><code>hide</code></td><td><code>(message) =&gt; Promise</code>: adds Delete for me</td
			><td></td></tr
		>
		<tr
			><td><code>onread</code></td><td
				><code>(id) =&gt; void</code>: the newest message you've seen</td
			><td></td></tr
		>
		<tr
			><td><code>draft</code></td><td><code>string</code>: keeps unsent text per conversation</td
			><td></td></tr
		>
		<tr
			><td><code>label</code>, <code>placeholder</code></td><td><code>string</code></td><td
			></td></tr
		>
		<tr><td><code>attachments</code></td><td><code>boolean</code></td><td><code>true</code></td></tr
		>
		<tr><td><code>header</code></td><td><code>Snippet</code>: above the messages</td><td></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd></td><td>Sends; while @ suggestions are open, picks one</td></tr>
		<tr><td><kbd>Shift</kbd> <kbd>Enter</kbd></td><td>A new line</td></tr>
		<tr><td><kbd>↑</kbd> in an empty box</td><td>Edits your last message</td></tr>
		<tr
			><td><kbd>↑</kbd> <kbd>↓</kbd> on a message</td><td>Moves to the message before or after</td
			></tr
		>
		<tr
			><td><kbd>Home</kbd> <kbd>End</kbd> on a message</td><td>The first or last loaded message</td
			></tr
		>
		<tr><td><kbd>Tab</kbd> on a message</td><td>Into its actions: react, reply, more</td></tr>
		<tr
			><td><kbd>Escape</kbd></td><td>Cancels an edit or a reply; on a message, back to the box</td
			></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Messages from others are announced as they arrive; yours and older pages aren't.</li>
	<li>
		Each message is read as who sent it and what it says, with the full time as its description.
	</li>
	<li>Only one message is in the tab order; the arrows move between them.</li>
	<li>Delivery, read and failed states are written out, not only shown as ticks.</li>
	<li>Links open in a new tab and message text is never treated as HTML.</li>
	<li>
		With reduced motion, messages appear without sliding and scrolling jumps instead of gliding.
	</li>
</ul>
