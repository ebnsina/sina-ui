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
	<title>Team — Sina UI</title>
	<meta
		name="description"
		content="Manage a team: invite people by email, change roles, remove members, hand over ownership and follow pending invites."
	/>
	<meta property="og:title" content="Team — Sina UI" />
	<meta
		property="og:description"
		content="Manage a team: invite people by email, change roles, remove members, hand over ownership and follow pending invites."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Team</h1>
<p class="lede">
	The people page every product needs: who's on the team, what they can do, and who's been invited.
	Invite several people at once, change a role in place, hand over ownership, and watch your seats.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="library"
	title="The translators of Bayt al-Hikma"
	description="Invite people (paste several addresses at once), change a role, or open a member's menu. Changing Qusta's role fails, to show it going back with a message. On a phone each person becomes a small card."
	{...ex('library')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/team">
	<p>
		Copy <code>src/lib/blocks/team/</code>, with <code>AlertDialog</code>, <code>Avatar</code>,
		<code>Badge</code>, <code>Button</code>, <code>CopyButton</code>, <code>Dialog</code>,
		<code>dropdown/</code>, <code>EmptyState</code>, <code>Icon</code>, <code>Meter</code>,
		<code>RadioCards</code>, <code>SearchField</code>, <code>Segmented</code>, <code>Select</code>,
		<code>TagInput</code>, <code>Textarea</code>, <code>toast/</code>, <code>motion.ts</code>,
		<code>optimistic.ts</code> and <code>tokens.css</code>. No dependencies.
	</p>
</Install>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>members</code></td><td
				><code>{'{ id, name, email, role, avatar?, lastActive?, you? }[]'}</code> (bindable)</td
			><td>required</td></tr
		>
		<tr
			><td><code>invites</code></td><td><code>{'{ id, email, role, sent }[]'}</code> (bindable)</td
			><td><code>[]</code></td></tr
		>
		<tr
			><td><code>seats</code></td><td
				><code>number</code>: members and pending invites each take one</td
			><td>required</td></tr
		>
		<tr
			><td><code>inviteLink</code></td><td><code>string</code>: offered as "Copy invite link"</td
			><td></td></tr
		>
		<tr><td><code>title</code></td><td><code>string</code></td><td><code>'Team'</code></td></tr>
		<tr
			><td><code>oninvite</code></td><td
				><code>(emails, role, message) =&gt; Promise&lt;invites | void&gt;</code></td
			><td></td></tr
		>
		<tr
			><td><code>onrolechange</code></td><td><code>(member, role) =&gt; Promise | void</code></td
			><td></td></tr
		>
		<tr
			><td><code>onremove</code></td><td><code>(member) =&gt; Promise | void</code></td><td
			></td></tr
		>
		<tr
			><td><code>ontransfer</code></td><td><code>(member) =&gt; Promise | void</code></td><td
			></td></tr
		>
		<tr
			><td><code>onresend</code></td><td><code>(invite) =&gt; Promise | void</code></td><td
			></td></tr
		>
		<tr
			><td><code>onrevoke</code></td><td><code>(invite) =&gt; Promise | void</code></td><td
			></td></tr
		>
	</tbody>
</table>
<p>
	Roles are <code>'owner' | 'admin' | 'member' | 'viewer'</code>. A role change and a withdrawn
	invite show at once; if their callback throws, they go back and say so. To show your own wording,
	throw an error with a <code>code</code> and add it to the block's <code>messages</code>; codes
	<code>seat_limit</code>, <code>last_owner</code>, <code>already_member</code>,
	<code>forbidden</code> and <code>network</code> are worded already. Mount
	<code>&lt;Toaster /&gt;</code> once in your layout to show the messages.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Switch between members and pending invites</td></tr>
		<tr
			><td><kbd>Enter</kbd> or <kbd>,</kbd></td><td>Add an email address in the invite form</td></tr
		>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Choose a role in a member's role picker</td></tr>
		<tr><td><kbd>Escape</kbd></td><td>Close a menu or dialog</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Each role picker is named for its person ("Role for Thabit ibn Qurra").</li>
	<li>Each actions menu is named for its person or invite.</li>
	<li>Removing someone and handing over ownership ask first, in an alert dialog.</li>
	<li>Every result, good or bad, is announced through a toast.</li>
	<li>The owner can't be demoted from the list; the row says how to step down.</li>
</ul>
