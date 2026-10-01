<script lang="ts">
	import { Archive02Icon, File01Icon, PinIcon } from '@hugeicons/core-free-icons';
	import Avatar from '../../ui/Avatar.svelte';
	import Button from '../../ui/Button.svelte';
	import { fileSize, type ChatMessage, type ChatUser } from '../../ui/chat';
	import Icon from '../../ui/Icon.svelte';
	import Image from '../../ui/Image.svelte';
	import { scrollEdges } from '../../ui/scroll-edges';
	import Switch from '../../ui/Switch.svelte';
	import type { Conversation } from './api';

	interface Props {
		conversation: Conversation;
		title: string;
		/** What's under the name: online, last seen, members, topic. */
		subtitle: string;
		users: Map<string, ChatUser>;
		me: string;
		/** The messages loaded so far: pinned messages, pictures and files come from these. */
		messages: ChatMessage[];
		/** Show this message in the conversation. */
		onshow: (id: string) => void;
		onchange: (change: Partial<Pick<Conversation, 'pinned' | 'muted' | 'archived'>>) => void;
		seen: (user: ChatUser) => string;
	}

	let { conversation, title, subtitle, users, me, messages, onshow, onchange, seen }: Props =
		$props();

	const pinned = $derived(messages.filter((m) => m.pinned && !m.deleted));
	const pictures = $derived(
		messages.flatMap((m) =>
			(m.attachments ?? [])
				.filter((a) => a.type.startsWith('image/'))
				.map((a) => ({ ...a, id: m.id }))
		)
	);
	const files = $derived(
		messages.flatMap((m) =>
			(m.attachments ?? [])
				.filter((a) => !a.type.startsWith('image/') && !a.type.startsWith('audio/'))
				.map((a) => ({ ...a, id: m.id }))
		)
	);
	const members = $derived(
		conversation.members
			.map((id) => users.get(id))
			.filter((u): u is ChatUser => !!u)
			.sort((a, b) => Number(b.online ?? 0) - Number(a.online ?? 0))
	);
</script>

<div class="info" {@attach scrollEdges} data-fade>
	<div class="who">
		<Avatar name={title} size="lg" decorative />
		<h3>{conversation.kind === 'channel' ? `#${title}` : title}</h3>
		{#if subtitle}<p>{subtitle}</p>{/if}
	</div>

	<section aria-label="Settings" class="card">
		<Switch
			checked={!conversation.muted}
			onchange={(e) => onchange({ muted: !e.currentTarget.checked })}
		>
			Notifications
		</Switch>
		<Switch
			checked={!!conversation.pinned}
			onchange={(e) => onchange({ pinned: e.currentTarget.checked })}
		>
			Pin to the top of the list
		</Switch>
	</section>

	{#if pinned.length}
		<section aria-labelledby="pinned-h">
			<h4 id="pinned-h">Pinned</h4>
			<ul class="list">
				{#each pinned as m (m.id)}
					<li>
						<button type="button" class="row" onclick={() => onshow(m.id)}>
							<Icon icon={PinIcon} size={16} />
							<span class="clip">{m.text || 'An attachment'}</span>
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if conversation.kind !== 'direct'}
		<section aria-labelledby="members-h">
			<h4 id="members-h">{members.length} members</h4>
			<ul class="list">
				{#each members as u (u.id)}
					<li class="member">
						<span class="avatar">
							<Avatar name={u.name} src={u.avatar} size="sm" decorative />
							{#if u.online}<span class="online"></span>{/if}
						</span>
						<span>
							{u.name}{u.id === me ? ' (you)' : ''}<br /><small>{seen(u)}</small>
						</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section aria-labelledby="media-h">
		<h4 id="media-h">Pictures</h4>
		{#if pictures.length}
			<div class="media">
				{#each pictures as p (p.url)}
					<Image src={p.url} alt={p.name} ratio="1 / 1" zoom />
				{/each}
			</div>
		{:else}<p class="none">Pictures shared here will show up here.</p>{/if}
	</section>

	<section aria-labelledby="files-h">
		<h4 id="files-h">Files</h4>
		{#if files.length}
			<ul class="list">
				{#each files as f (f.url)}
					<li>
						<a class="row" href={f.url} download={f.name}>
							<Icon icon={File01Icon} size={16} />
							<span class="clip">{f.name}</span>
							<small>{fileSize(f.size)}</small>
						</a>
					</li>
				{/each}
			</ul>
		{:else}<p class="none">No files yet.</p>{/if}
	</section>

	<Button variant="secondary" onclick={() => onchange({ archived: !conversation.archived })}>
		<Icon icon={Archive02Icon} size={16} />
		{conversation.archived ? 'Move back to the list' : 'Archive conversation'}
	</Button>
</div>

<style>
	.info {
		display: grid;
		align-content: start;
		gap: 1.25rem;
		block-size: 100%;
		overflow-y: auto;
		padding: 1.25rem 1rem;
		box-sizing: border-box;
	}
	.who {
		display: grid;
		justify-items: center;
		gap: 0.375rem;
		text-align: center;
	}
	h3 {
		margin: 0.25rem 0 0;
		font-size: 1.0625rem;
	}
	.who p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.card {
		display: grid;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	section {
		display: grid;
		gap: 0.5rem;
	}
	h4 {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.list {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		inline-size: 100%;
		padding: 0.375rem 0.5rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: inherit;
		font: inherit;
		font-size: 0.875rem;
		text-align: start;
		text-decoration: none;
		cursor: pointer;
	}
	.row:hover {
		background: var(--ui-hover);
	}
	.row:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.clip {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.member {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
	.avatar {
		position: relative;
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
	small {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.media {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.25rem;
	}
	.media :global(img),
	.media :global(figure) {
		border-radius: 0.5rem;
	}
	.none {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
</style>
