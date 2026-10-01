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
	<title>Messaging — Sina UI</title>
	<meta
		name="description"
		content="A complete messaging app: direct messages, groups and channels, threads, search with filters, forward, pin, save, edit history, voice notes, read receipts, typing and presence, on any screen."
	/>
	<meta property="og:title" content="Messaging — Sina UI" />
	<meta
		property="og:description"
		content="A complete messaging app: direct messages, groups and channels, threads, search with filters, forward, pin, save, edit history, voice notes, read receipts, typing and presence, on any screen."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Messaging</h1>
<p class="lede">
	Everything people expect from a messaging app, in one block: direct messages, groups and channels
	in one list, threads, search across everything, and the small things like drafts, receipts and
	"typing…". On a phone it becomes list, conversation, details, with a way back from each.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="workspace"
	title="A workspace"
	description="Open a conversation and send something: people type back, and your message goes from Sent to Read. Try a thread in #translation, the voice note in Observatory crew, search with filters, and Forward, Pin or Save from a message's menu. Narrow the window to see the phone layout."
	{...ex('workspace')}
/>
<Example
	id="empty"
	title="A new workspace"
	description="Before anyone has written: start a direct message or a named group."
	{...ex('empty')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/messaging">
	<p>
		Copy <code>src/lib/blocks/messaging/</code>, with the
		<a href={resolve('/components/chat')}>Chat</a>
		component and what it needs, plus <code>Checkbox</code>, <code>Dialog</code>,
		<code>EmptyState</code>, <code>Input</code>, <code>SearchField</code>, <code>Segmented</code>,
		<code>Select</code>, <code>Skeleton</code> and <code>Switch</code>. Icons come from
		<code>@hugeicons/core-free-icons</code>.
	</p>
	<p>
		<code>mock.ts</code> is a pretend backend for trying it out. Write the
		<code>MessagingApi</code> interface in <code>api.ts</code> over your own server and pass that to
		<code>&lt;Messaging api=&#123;…&#125; /&gt;</code> instead.
	</p>
</Install>

<h2 id="included">What's included</h2>
<ul>
	<li>
		One list for direct messages, groups and channels: pinned first, unread in bold with counts, an
		@ for mentions, muted ones quieter, and archived ones out of the way.
	</li>
	<li>
		Search every message, or one conversation, by words, person, date, or whether it has a picture,
		file or link. A result opens its conversation at that message.
	</li>
	<li>Threads beside the conversation, or full screen on a phone.</li>
	<li>
		Forward to another conversation, pin, save for later, edit with a visible history, and delete
		for yourself or for everyone.
	</li>
	<li>
		Pictures, files, voice messages and link previews; read receipts, "seen by" in groups, typing
		and last seen.
	</li>
	<li>
		Details for each conversation: members and who's online, pinned messages, shared pictures and
		files, notifications, pin and archive.
	</li>
	<li>Unsent text is kept per conversation while you move between them.</li>
	<li>Loading, empty and error states everywhere, with a way to try again.</li>
</ul>

<h2 id="keyboard">Keyboard</h2>
<p>
	Everything in <a href="{resolve('/components/chat')}#keyboard">Chat's keyboard table</a>, plus Tab
	through the list, the conversation and its details, and <kbd>Escape</kbd> to close a dialog.
</p>
