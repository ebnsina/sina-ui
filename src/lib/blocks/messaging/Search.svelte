<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Avatar from '../../ui/Avatar.svelte';
	import Button from '../../ui/Button.svelte';
	import type { ChatUser } from '../../ui/chat';
	import SearchField from '../../ui/SearchField.svelte';
	import Select from '../../ui/Select.svelte';
	import Spinner from '../../ui/Spinner.svelte';
	import { scrollEdges } from '../../ui/scroll-edges';
	import { messageOf, type Hit, type MessagingApi, type SearchQuery } from './api';

	interface Props {
		api: MessagingApi;
		users: ChatUser[];
		/** Conversation id → its name. */
		titles: Map<string, string>;
		/** Starts limited to one conversation. */
		within?: string;
		text?: string;
		/** A result was chosen: open its conversation at that message. */
		onopen: (hit: Hit) => void;
	}

	let { api, users, titles, within, text = $bindable(''), onopen }: Props = $props();

	let from = $state('');
	let has = $state('');
	let days = $state('');
	let place = $state(untrack(() => within ?? ''));
	let hits = $state<Hit[]>();
	let busy = $state(false);
	let error = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;
	let asked = 0;
	let attempt = $state(0);
	const byId = $derived(new Map(users.map((u) => [u.id, u])));
	const time = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	// Searches a moment after you stop typing; only the latest answer is shown.
	$effect(() => {
		const query: SearchQuery = {
			text,
			from: from || undefined,
			has: (has || undefined) as SearchQuery['has'],
			within: days ? +days : undefined,
			in: place || undefined
		};
		void attempt;
		clearTimeout(timer);
		if (!text.trim() && !query.from && !query.has) {
			hits = undefined;
			return;
		}
		timer = setTimeout(async () => {
			const id = ++asked;
			busy = true;
			error = '';
			try {
				const found = await api.search(query);
				if (id === asked) hits = found;
			} catch (e) {
				if (id === asked) error = messageOf(e);
			} finally {
				if (id === asked) busy = false;
			}
		}, 250);
	});
	onMount(() => () => clearTimeout(timer));

	// The words you searched for, marked in each result: as text, never as HTML.
	function marked(s: string) {
		const words = text.trim().split(/\s+/).filter(Boolean);
		if (!words.length) return [{ text: s, hit: false }];
		const re = new RegExp(
			`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
			'gi'
		);
		return s.split(re).map((part, i) => ({ text: part, hit: i % 2 === 1 }));
	}
</script>

<div class="search">
	<SearchField label="Search messages" bind:value={text} placeholder="Words, names, file names" />
	<div class="filters">
		<Select label="From" bind:value={from}>
			<option value="">Anyone</option>
			{#each users as u (u.id)}<option value={u.id}>{u.name}</option>{/each}
		</Select>
		<Select label="Has" bind:value={has}>
			<option value="">Anything</option>
			<option value="image">A picture</option>
			<option value="file">A file</option>
			<option value="link">A link</option>
		</Select>
		<Select label="When" bind:value={days}>
			<option value="">Any time</option>
			<option value="1">Today</option>
			<option value="7">Past week</option>
			<option value="30">Past month</option>
		</Select>
		<Select label="In" bind:value={place}>
			<option value="">Every conversation</option>
			{#each [...titles] as [id, title] (id)}<option value={id}>{title}</option>{/each}
		</Select>
	</div>

	<div class="results" {@attach scrollEdges} data-fade aria-busy={busy}>
		<p class="status" role="status">
			{#if busy}<Spinner size={14} /> Searching…
			{:else if error}{error}
			{:else if hits}{hits.length
					? `${hits.length} ${hits.length === 1 ? 'message' : 'messages'}`
					: 'Nothing matches. Try fewer words or another filter.'}
			{:else}Type to search every message you can see.{/if}
		</p>
		{#if error}<Button variant="secondary" size="sm" onclick={() => attempt++}>Try again</Button
			>{/if}
		{#if hits?.length}
			<ul>
				{#each hits as hit (hit.conversation + hit.message.id)}
					{@const user = byId.get(hit.message.author)}
					<li>
						<button type="button" class="hit" onclick={() => onopen(hit)}>
							<Avatar name={user?.name ?? 'Someone'} size="sm" decorative />
							<span class="body">
								<span class="top">
									<strong>{user?.name ?? 'Someone'}</strong>
									<span class="where">in {titles.get(hit.conversation) ?? 'a conversation'}</span>
									<time datetime={new Date(hit.message.at).toISOString()}
										>{time.format(hit.message.at)}</time
									>
								</span>
								<span class="text"
									>{#each marked(hit.message.text || hit.message.attachments
												?.map((a) => a.name)
												.join(', ') || '') as p, i (i)}{#if p.hit}<mark>{p.text}</mark
											>{:else}{p.text}{/if}{/each}</span
								>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.search {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		gap: 0.75rem;
		block-size: 100%;
		min-block-size: 0;
		padding: 1rem;
		box-sizing: border-box;
	}
	.filters {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		font-size: 0.875rem;
	}
	.results {
		display: grid;
		align-content: start;
		gap: 0.5rem;
		overflow-y: auto;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	ul {
		display: grid;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.hit {
		display: flex;
		gap: 0.625rem;
		inline-size: 100%;
		padding: 0.5rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.hit:hover {
		background: var(--ui-hover);
	}
	.hit:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.body {
		display: grid;
		gap: 0.125rem;
		min-inline-size: 0;
		font-size: 0.875rem;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 0.375rem;
	}
	.where,
	time {
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.text {
		display: -webkit-box;
		overflow: hidden;
		color: var(--ui-muted);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	mark {
		border-radius: 0.1875rem;
		background: color-mix(in srgb, var(--ui-warning) 35%, transparent);
		color: var(--ui-fg);
	}
</style>
