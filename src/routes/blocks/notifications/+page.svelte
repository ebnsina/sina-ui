<script lang="ts">
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
	<title>Notifications — Sina UI</title>
	<meta
		name="description"
		content="A notification bell with an unread count and an inbox: grouped by day, filters, mark as read, mute, and load older."
	/>
	<meta property="og:title" content="Notifications — Sina UI" />
	<meta
		property="og:description"
		content="A notification bell with an unread count and an inbox: grouped by day, filters, mark as read, mute, and load older."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Notifications</h1>
<p class="lede">
	A bell for your header with the unread count on it, opening an inbox. The inbox works on its own
	page too: grouped by day, filtered to unread or mentions, with read, mute and older pages.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="bell"
	title="A bell in the header"
	description="Open it, filter, or point at a row for its quick actions. Simulate a new one and watch the count go up."
	{...ex('bell')}
/>
<Example
	id="inbox"
	title="An inbox page"
	description="“Fail the next save”, then Mark all as read: the change shows at once, then goes back and says so. Reload to see the loading and error states."
	{...ex('inbox')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/notifications">
	<p>
		Copy <code>src/lib/blocks/notifications/</code>, with <code>Avatar</code>, <code>Button</code>,
		<code>EmptyState</code>, <code>Icon</code>, <code>Popover</code>, <code>RollingNumber</code>,
		<code>Segmented</code>, <code>Skeleton</code>, the toast folder, <code>announce.ts</code>,
		<code>motion.ts</code>, <code>now.svelte.ts</code>, <code>optimistic.ts</code>,
		<code>scroll-edges.ts</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="props">Props</h2>
<p>
	<code>NotificationBell</code> takes everything <code>Inbox</code> does, plus a bindable
	<code>open</code>.
</p>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>items</code></td><td
				><code>{'{ id, actor: { name, src? }, text, at, read?, mention?, muted? }[]'}</code>
				(bindable, newest first)</td
			><td>required</td></tr
		>
		<tr
			><td><code>title</code></td><td><code>string</code></td><td><code>'Notifications'</code></td
			></tr
		>
		<tr
			><td><code>loading</code></td><td><code>boolean</code>: shows placeholders</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>error</code></td><td
				><code>string</code>: a message, with Try again calling <code>onretry</code></td
			><td></td></tr
		>
		<tr
			><td><code>onopen</code></td><td><code>(item) =&gt; void</code>; it's marked read first</td
			><td></td></tr
		>
		<tr
			><td><code>onread</code></td><td
				><code>(ids, read) =&gt; Promise | void</code>: save; if it throws, the change goes back</td
			><td></td></tr
		>
		<tr
			><td><code>onmute</code></td><td><code>(item, muted) =&gt; Promise | void</code></td><td
			></td></tr
		>
		<tr
			><td><code>more</code>, <code>onmore</code></td><td
				><code>boolean</code>, <code>() =&gt; Promise | void</code>: "Load older"</td
			><td></td></tr
		>
	</tbody>
</table>
<p>
	Mount <code>&lt;Toaster /&gt;</code> once in your layout to show the messages when saving fails.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Move between notifications</td></tr>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>First and last</td></tr>
		<tr><td><kbd>Enter</kbd></td><td>Open it</td></tr>
		<tr><td><kbd>Tab</kbd></td><td>To its mark-as-read and mute buttons, then on</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Close the inbox and return to the bell</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>The bell is named with the unread count: “Notifications, 3 unread”.</li>
	<li>Each day is a labeled list; unread ones say so after the time.</li>
	<li>New notifications are announced politely, without moving focus.</li>
	<li>Only one notification is in the Tab order at a time; arrows move between them.</li>
	<li>Quick actions show on hover or focus, and always on touch screens.</li>
	<li>With reduced motion, rows and the count appear without growing.</li>
</ul>
