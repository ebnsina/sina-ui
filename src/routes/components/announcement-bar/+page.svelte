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
	<title>Announcement bar — Sina UI</title>
	<meta
		name="description"
		content="A slim bar for news at the top of a page: one message or several taking turns, and dismissed for good."
	/>
	<meta property="og:title" content="Announcement bar — Sina UI" />
	<meta
		property="og:description"
		content="A slim bar for news at the top of a page: one message or several taking turns, and dismissed for good."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Announcement bar</h1>
<p class="lede">
	A slim bar for news at the top of a page: one message or several taking turns. Dismissed, it folds
	shut and can stay gone on the next visit.
</p>

<h2 id="installation">Installation</h2>
<Install names="announcement-bar">
	<p>
		Copy <code>src/lib/ui/AnnouncementBar.svelte</code>, with <code>Icon.svelte</code>,
		<code>RollingNumber.svelte</code>, <code>motion.ts</code>, <code>stored.ts</code> and
		<code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="rotating"
	title="Taking turns"
	description="Several messages rise in one after another; the ring round the pause button shows how long until the next. Pointing at the bar or focusing a link holds it. Dismiss it and the page closes up."
	{...ex('rotating')}
/>
<Example
	id="countdown"
	title="With a countdown"
	description="A live countdown to a moment you give it, its digits rolling as they change. It disappears once the time has passed."
	{...ex('countdown')}
/>
<Example
	id="warning"
	title="Remembered"
	description="With persist, a dismissal is kept in this browser: reload and it stays gone. Change the key to show a new notice."
	{...ex('warning')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>messages</code></td><td
				><code>{'{ text, link?, href?, onclick?, countdown?: { to, label? } }[]'}</code> (required)</td
			><td></td></tr
		>
		<tr
			><td><code>tone</code></td><td><code>'inverted' | 'accent' | 'neutral' | 'warning'</code></td
			><td><code>'inverted'</code></td></tr
		>
		<tr
			><td><code>interval</code></td><td><code>number</code>: milliseconds per message</td><td
				><code>6000</code></td
			></tr
		>
		<tr
			><td><code>persist</code></td><td><code>string</code>: remember a dismissal under this key</td
			><td></td></tr
		>
		<tr><td><code>dismissible</code></td><td><code>boolean</code></td><td><code>true</code></td></tr
		>
		<tr
			><td><code>label</code></td><td><code>string</code>: the bar's name for screen readers</td><td
				><code>'Announcements'</code></td
			></tr
		>
		<tr><td><code>ondismiss</code></td><td><code>() =&gt; void</code></td><td></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr
			><td><kbd>Tab</kbd></td><td
				>Moves to the link, the pause button and Dismiss; focus holds the rotation</td
			></tr
		>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Pause or play, dismiss</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>A labeled region, so screen reader users can find it or skip it.</li>
	<li>Changing messages aren't announced; only the one showing can be reached.</li>
	<li>Rotation stops while pointed at or focused, and the pause button stops it for good.</li>
	<li>A countdown is read as the moment it ends ("Ends Oct 3, 5:00 PM"), not ticking seconds.</li>
	<li>With reduced motion, messages swap and the bar closes without sliding.</li>
</ul>
