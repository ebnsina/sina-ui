<script lang="ts">
	import Avatar from '../../ui/Avatar.svelte';
	import Button from '../../ui/Button.svelte';
	import type { ChatUser } from '../../ui/chat';
	import Checkbox from '../../ui/Checkbox.svelte';
	import Dialog from '../../ui/Dialog.svelte';
	import Input from '../../ui/Input.svelte';
	import SearchField from '../../ui/SearchField.svelte';
	import { messageOf } from './api';

	interface Props {
		open?: boolean;
		users: ChatUser[];
		me: string;
		/** One person: a direct conversation. More: a group with this name. Throw to show an error. */
		create: (members: string[], name?: string) => Promise<unknown>;
	}

	let { open = $bindable(false), users, me, create }: Props = $props();

	let query = $state('');
	let picked = $state<string[]>([]);
	let name = $state('');
	let nameError = $state('');
	let error = $state('');
	let busy = $state(false);
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const shown = $derived(
		users.filter((u) => u.id !== me && fold(u.name).includes(fold(query.trim())))
	);
	const group = $derived(picked.length > 1);

	// Fresh each time it opens.
	$effect(() => {
		if (open) {
			query = '';
			picked = [];
			name = '';
			nameError = '';
			error = '';
		}
	});

	async function submit() {
		error = '';
		nameError = group && !name.trim() ? 'Give the group a name.' : '';
		if (!picked.length || nameError) return;
		busy = true;
		try {
			await create(picked, group ? name.trim() : undefined);
			open = false;
		} catch (e) {
			error = messageOf(e);
		} finally {
			busy = false;
		}
	}
</script>

<Dialog
	bind:open
	title="New conversation"
	description="Pick one person for a direct message, or several for a group."
>
	<form
		id="new-conversation"
		class="form"
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
	>
		<SearchField label="Find people" bind:value={query} />
		<fieldset>
			<legend class="sr">People</legend>
			{#each shown as u (u.id)}
				<label class="person">
					<Avatar name={u.name} src={u.avatar} size="sm" decorative />
					<span class="who">
						{u.name}
						<small>{u.online ? 'Online' : 'Offline'}</small>
					</span>
					<Checkbox
						aria-label="Add {u.name}"
						checked={picked.includes(u.id)}
						onchange={(e) =>
							(picked = e.currentTarget.checked
								? [...picked, u.id]
								: picked.filter((id) => id !== u.id))}
					/>
				</label>
			{:else}
				<p class="none">No one by that name.</p>
			{/each}
		</fieldset>
		{#if group}
			<Input
				label="Group name"
				bind:value={name}
				error={nameError}
				placeholder="Observatory crew"
			/>
		{/if}
		{#if error}<p class="error" role="alert">{error}</p>{/if}
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
		<Button type="submit" form="new-conversation" loading={busy} disabled={!picked.length}>
			{group ? `Start a group of ${picked.length + 1}` : 'Start conversation'}
		</Button>
	{/snippet}
</Dialog>

<style>
	.form {
		display: grid;
		gap: 1rem;
	}
	fieldset {
		display: grid;
		gap: 0.125rem;
		max-block-size: 16rem;
		overflow-y: auto;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.person {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.375rem 0.5rem;
		border-radius: var(--ui-radius-control);
		cursor: pointer;
	}
	.person:hover {
		background: var(--ui-hover);
	}
	.who {
		display: grid;
		flex: 1;
		font-weight: 500;
	}
	small {
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 400;
	}
	.none {
		margin: 0;
		padding: 0.75rem 0.5rem;
		color: var(--ui-muted);
	}
	.error {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
