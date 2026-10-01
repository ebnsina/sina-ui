<script lang="ts" module>
	export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
	export interface TeamMember {
		id: string;
		name: string;
		email: string;
		role: TeamRole;
		avatar?: string;
		lastActive?: Date | string | number;
		/** The person looking at the page. */
		you?: boolean;
	}
	export interface TeamInvite {
		id: string;
		email: string;
		role: TeamRole;
		sent: Date | string | number;
	}
</script>

<script lang="ts">
	import {
		CrownIcon,
		Delete02Icon,
		MoreHorizontalIcon,
		SentIcon,
		UserAdd01Icon
	} from '@hugeicons/core-free-icons';
	import AlertDialog from '#lib/ui/AlertDialog.svelte';
	import Avatar from '#lib/ui/Avatar.svelte';
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import CopyButton from '#lib/ui/CopyButton.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Meter from '#lib/ui/Meter.svelte';
	import { pop, reflow } from '#lib/ui/motion.js';
	import { optimistic } from '#lib/ui/optimistic.js';
	import RadioCards from '#lib/ui/RadioCards.svelte';
	import SearchField from '#lib/ui/SearchField.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Select from '#lib/ui/Select.svelte';
	import TagInput from '#lib/ui/TagInput.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	interface Props {
		members: TeamMember[];
		invites?: TeamInvite[];
		/** Seats the plan includes: members and pending invites both take one. */
		seats: number;
		/** A link anyone can use to join, offered beside the invite button. */
		inviteLink?: string;
		title?: string;
		/** Send invites. Return the invites the server made, or nothing to have them made here. */
		oninvite?: (
			emails: string[],
			role: TeamRole,
			message: string
		) => Promise<TeamInvite[] | void> | TeamInvite[] | void;
		onrolechange?: (member: TeamMember, role: TeamRole) => Promise<unknown> | unknown;
		onremove?: (member: TeamMember) => Promise<unknown> | unknown;
		ontransfer?: (member: TeamMember) => Promise<unknown> | unknown;
		onresend?: (invite: TeamInvite) => Promise<unknown> | unknown;
		onrevoke?: (invite: TeamInvite) => Promise<unknown> | unknown;
		class?: string;
	}

	let {
		members = $bindable(),
		invites = $bindable([]),
		seats,
		inviteLink,
		title = 'Team',
		oninvite,
		onrolechange,
		onremove,
		ontransfer,
		onresend,
		onrevoke,
		class: className
	}: Props = $props();

	const roles: { value: TeamRole; label: string; description: string }[] = [
		{ value: 'admin', label: 'Admin', description: 'Manages people, settings and billing' },
		{
			value: 'member',
			label: 'Member',
			description: 'Works on everything, changes nothing about the team'
		},
		{ value: 'viewer', label: 'Viewer', description: 'Reads and comments, edits nothing' }
	];
	const roleName = (r: TeamRole) =>
		r === 'owner' ? 'Owner' : roles.find((x) => x.value === r)!.label;

	// Errors carry a stable code from your API; the words people see are decided here. Add your own codes.
	const messages: Record<string, string> = {
		seat_limit: 'There are no seats left on your plan.',
		last_owner: 'A team needs an owner. Make someone else the owner first.',
		already_member: 'They’re already on the team.',
		forbidden: 'You don’t have permission to do that.',
		network: 'Couldn’t reach the server. Check your connection and try again.'
	};
	const messageOf = (e: unknown) =>
		messages[(e as { code?: string })?.code ?? ''] ?? 'That didn’t work. Try again.';

	const rel = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	function ago(when: Date | string | number) {
		const s = (new Date(when).getTime() - Date.now()) / 1000;
		for (const [unit, size] of [
			['year', 31536000],
			['month', 2592000],
			['week', 604800],
			['day', 86400],
			['hour', 3600],
			['minute', 60]
		] as const)
			if (Math.abs(s) >= size) return rel.format(Math.round(s / size), unit);
		return 'just now';
	}

	let view = $state<'members' | 'pending'>('members');
	let query = $state('');
	const match = (...fields: string[]) =>
		fields.some((f) => f.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
	const shownMembers = $derived(members.filter((m) => match(m.name, m.email)));
	const shownInvites = $derived(invites.filter((i) => match(i.email)));
	const used = $derived(members.length + invites.length);
	const free = $derived(Math.max(0, seats - used));

	// Invite dialog
	let inviting = $state(false);
	let emails = $state<string[]>([]);
	let role = $state<TeamRole>('member');
	let note = $state('');
	let sending = $state(false);
	let tried = $state(false);
	// Pasting "a@x.org b@y.org" arrives as one chip: split it on spaces and semicolons too.
	$effect(() => {
		if (emails.some((e) => /[\s;]/.test(e)))
			emails = [...new Set(emails.flatMap((e) => e.split(/[\s;]+/)).filter(Boolean))];
	});
	const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
	const known = (e: string) =>
		[...members.map((m) => m.email), ...invites.map((i) => i.email)].some(
			(x) => x.toLocaleLowerCase() === e.toLocaleLowerCase()
		);
	const inviteError = $derived.by(() => {
		const bad = emails.filter((e) => !isEmail(e));
		if (bad.length)
			return `${bad.length === 1 ? 'This doesn’t' : 'These don’t'} look like an email address: ${bad.join(', ')}.`;
		const dup = emails.filter(known);
		if (dup.length) return `Already on the team or invited: ${dup.join(', ')}.`;
		if (emails.length > free)
			return free
				? `Only ${free} ${free === 1 ? 'seat is' : 'seats are'} left.`
				: 'There are no seats left.';
		if (tried && !emails.length) return 'Add at least one email address.';
	});

	function openInvite() {
		emails = [];
		role = 'member';
		note = '';
		tried = false;
		inviting = true;
	}
	async function sendInvites(e: SubmitEvent) {
		e.preventDefault();
		tried = true;
		if (inviteError || !emails.length || sending) return;
		sending = true;
		try {
			const made = await oninvite?.(emails, role, note.trim());
			const added =
				made || emails.map((email) => ({ id: crypto.randomUUID(), email, role, sent: Date.now() }));
			invites = [...added, ...invites];
			toast.success(
				added.length === 1 ? `Invite sent to ${added[0].email}.` : `${added.length} invites sent.`
			);
			inviting = false;
			view = 'pending';
		} catch (err) {
			toast.error(messageOf(err));
		} finally {
			sending = false;
		}
	}

	// optimistic() swallows the error; keep it so the message can say why.
	let lastError: unknown;
	const tracked =
		<A extends unknown[]>(fn: ((...a: A) => unknown) | undefined) =>
		async (...a: A) => {
			try {
				return await fn?.(...a);
			} catch (e) {
				lastError = e;
				throw e;
			}
		};
	const roleSave = tracked((m: TeamMember, r: TeamRole) => onrolechange?.(m, r));
	async function setRole(m: TeamMember, next: TeamRole) {
		const prev = m.role;
		if (prev === next) return;
		const ok = await optimistic(
			() => (m.role = next),
			() => roleSave(m, next),
			() => (m.role = prev)
		);
		if (ok) toast(`${m.name} is now ${roleName(next).toLowerCase()}.`);
		else toast.error(`${m.name} is still ${roleName(prev).toLowerCase()}. ${messageOf(lastError)}`);
	}

	let removing = $state<TeamMember>();
	let transferring = $state<TeamMember>();
	async function remove() {
		const m = removing!;
		try {
			await onremove?.(m);
		} catch (e) {
			throw new Error(messageOf(e), { cause: e });
		}
		members = members.filter((x) => x.id !== m.id);
		removing = undefined;
		toast(`${m.name} was removed from the team.`);
	}
	async function transfer() {
		const m = transferring!;
		try {
			await ontransfer?.(m);
		} catch (e) {
			throw new Error(messageOf(e), { cause: e });
		}
		for (const x of members) if (x.role === 'owner') x.role = 'admin';
		m.role = 'owner';
		transferring = undefined;
		toast(`${m.name} is now the owner.`);
	}

	async function resend(i: TeamInvite) {
		try {
			await onresend?.(i);
			i.sent = Date.now();
			toast.success(`Invite sent again to ${i.email}.`);
		} catch (e) {
			toast.error(messageOf(e));
		}
	}
	async function revoke(i: TeamInvite) {
		const at = invites.indexOf(i);
		const ok = await optimistic(
			() => (invites = invites.filter((x) => x !== i)),
			tracked(() => onrevoke?.(i)),
			() => invites.splice(at, 0, i)
		);
		if (ok) toast(`The invite to ${i.email} was withdrawn.`);
		else toast.error(messageOf(lastError));
	}
</script>

<section class={['team', className]} aria-labelledby="team-title">
	<header class="head">
		<div class="intro">
			<h2 id="team-title">{title}</h2>
			<Meter
				label="Seats"
				value={used}
				max={seats}
				showValue
				low={Math.ceil(seats * 0.75)}
				high={seats}
				optimum={0}
				format={(v, _, max) => `${v} of ${max} seats`}
			/>
		</div>
		<div class="actions">
			{#if inviteLink}<CopyButton value={inviteLink} variant="secondary" copied="Link copied"
					>Copy invite link</CopyButton
				>{/if}
			<Button onclick={openInvite}><Icon icon={UserAdd01Icon} size={16} /> Invite people</Button>
		</div>
	</header>

	<div class="tools">
		<Segmented
			label="Show"
			hideLabel
			options={[
				{ value: 'members', label: `Members (${members.length})` },
				{ value: 'pending', label: `Pending (${invites.length})` }
			]}
			bind:value={view}
		/>
		<SearchField label="Search people" bind:value={query} class="search" />
	</div>

	{#if view === 'members'}
		{#if shownMembers.length}
			<ul class="rows" aria-label="Members">
				{#each shownMembers as m (m.id)}
					{@const soleOwner = m.role === 'owner'}
					<li class="row" animate:reflow in:pop out:pop>
						<Avatar name={m.name} src={m.avatar} decorative />
						<div class="who">
							<span class="name">
								{m.name}
								{#if m.you}<Badge icon={false}>You</Badge>{/if}
							</span>
							<span class="muted">{m.email}</span>
						</div>
						<div class="role">
							{#if soleOwner || m.you}
								<Badge
									tone={m.role === 'owner' ? 'accent' : 'neutral'}
									icon={m.role === 'owner' ? CrownIcon : false}>{roleName(m.role)}</Badge
								>
								{#if soleOwner && m.you}<span class="note"
										>Make someone else the owner to step down.</span
									>{/if}
							{:else}
								<Select
									label="Role for {m.name}"
									class="pick"
									value={m.role}
									onchange={(e: Event) =>
										setRole(m, (e.currentTarget as HTMLSelectElement).value as TeamRole)}
								>
									{#each roles as r (r.value)}<option value={r.value}>{r.label}</option>{/each}
								</Select>
							{/if}
						</div>
						<span class="muted active"
							>{m.lastActive ? `Active ${ago(m.lastActive)}` : 'Not active yet'}</span
						>
						<div class="menu">
							{#if !m.you && m.role !== 'owner'}
								<Dropdown.Root>
									{#snippet trigger(props)}
										<Button
											variant="ghost"
											size="sm"
											square
											aria-label="Actions for {m.name}"
											{...props}
										>
											<Icon icon={MoreHorizontalIcon} size={18} />
										</Button>
									{/snippet}
									<Dropdown.Item onselect={() => (transferring = m)}>
										<Icon icon={CrownIcon} /> Make owner
									</Dropdown.Item>
									<Dropdown.Separator />
									<Dropdown.Item variant="danger" onselect={() => (removing = m)}>
										<Icon icon={Delete02Icon} /> Remove from team
									</Dropdown.Item>
								</Dropdown.Root>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<EmptyState title="No one matches “{query.trim()}”" level={3}>
				Check the spelling, or search by email instead.
				{#snippet actions()}<Button variant="secondary" onclick={() => (query = '')}
						>Clear search</Button
					>{/snippet}
			</EmptyState>
		{/if}
	{:else if shownInvites.length}
		<ul class="rows" aria-label="Pending invites">
			{#each shownInvites as i (i.id)}
				<li class="row" animate:reflow in:pop out:pop>
					<Avatar name={i.email} decorative />
					<div class="who">
						<span class="name">{i.email}</span>
						<span class="muted">Invited {ago(i.sent)}</span>
					</div>
					<div class="role"><Badge icon={false}>{roleName(i.role)}</Badge></div>
					<span class="muted active">Waiting to join</span>
					<div class="menu">
						<Dropdown.Root>
							{#snippet trigger(props)}
								<Button
									variant="ghost"
									size="sm"
									square
									aria-label="Actions for the invite to {i.email}"
									{...props}
								>
									<Icon icon={MoreHorizontalIcon} size={18} />
								</Button>
							{/snippet}
							<Dropdown.Item onselect={() => resend(i)}
								><Icon icon={SentIcon} /> Send again</Dropdown.Item
							>
							<Dropdown.Separator />
							<Dropdown.Item variant="danger" onselect={() => revoke(i)}>
								<Icon icon={Delete02Icon} /> Withdraw invite
							</Dropdown.Item>
						</Dropdown.Root>
					</div>
				</li>
			{/each}
		</ul>
	{:else if query.trim()}
		<EmptyState title="No invite matches “{query.trim()}”" level={3}>
			{#snippet actions()}<Button variant="secondary" onclick={() => (query = '')}
					>Clear search</Button
				>{/snippet}
		</EmptyState>
	{:else}
		<EmptyState title="No pending invites" level={3}>
			Everyone you’ve invited has joined.
			{#snippet actions()}<Button onclick={openInvite}>Invite people</Button>{/snippet}
		</EmptyState>
	{/if}
</section>

<Dialog
	bind:open={inviting}
	title="Invite people"
	description="They’ll get an email with a link to join. Each takes a seat until they join or the invite is withdrawn."
>
	<form id="team-invite" class="invite" novalidate onsubmit={sendInvites}>
		<TagInput
			label="Email addresses"
			bind:value={emails}
			placeholder="name@example.com"
			hint="Separate them with commas or spaces. {free} {free === 1 ? 'seat' : 'seats'} left."
			error={inviteError}
		/>
		<RadioCards
			legend="Role"
			layout="list"
			options={roles.map((r) => ({ value: r.value, label: r.label, description: r.description }))}
			bind:value={role}
		/>
		<Textarea label="Message (optional)" bind:value={note} rows={2} />
	</form>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (inviting = false)}>Cancel</Button>
		<Button type="submit" form="team-invite" loading={sending}>
			{emails.length > 1 ? `Send ${emails.length} invites` : 'Send invite'}
		</Button>
	{/snippet}
</Dialog>

<AlertDialog
	open={!!removing}
	title="Remove {removing?.name} from the team?"
	description="They lose access straight away and their seat is freed. What they made stays."
	confirmLabel="Remove"
	onconfirm={remove}
/>
<AlertDialog
	open={!!transferring}
	tone="primary"
	title="Make {transferring?.name} the owner?"
	description="They’ll manage billing and the team, and the current owner becomes an admin."
	confirmLabel="Make owner"
	onconfirm={transfer}
/>

<style>
	.team {
		container-type: inline-size;
		display: grid;
		gap: 1rem;
		inline-size: 100%;
		color: var(--ui-fg);
		font-family: var(--ui-font);
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
	}
	.intro {
		display: grid;
		flex: 1 1 16rem;
		gap: 0.5rem;
		max-inline-size: 22rem;
	}
	h2 {
		margin: 0;
		font-size: 1.25rem;
	}
	.actions,
	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.tools {
		justify-content: space-between;
	}
	.tools :global(.search) {
		flex: 0 1 16rem;
	}
	.rows {
		display: grid;
		margin: 0;
		padding: 0.25rem;
		list-style: none;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	/* Avatar, who, role, last active, menu. */
	.row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) 9.5rem 9rem 2.25rem;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--ui-radius);
	}
	.who {
		display: grid;
		min-inline-size: 0;
	}
	.name,
	.who .muted {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}
	.muted {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.role {
		display: grid;
		justify-items: start;
		gap: 0.25rem;
	}
	.note {
		color: var(--ui-muted);
		font-size: 0.75rem;
		line-height: 1.3;
	}
	/* The row already says whose role it is; the label is for screen readers. */
	.role :global(.pick label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.role :global(.pick) {
		inline-size: 100%;
	}
	.menu {
		display: grid;
		justify-items: end;
	}
	.invite {
		display: grid;
		gap: 1rem;
	}
	/* Phones: each person becomes a small card, the role and activity under the name. */
	@container (width < 40rem) {
		.row {
			grid-template-columns: auto minmax(0, 1fr) 2.25rem;
			grid-template-areas: 'face who menu' 'face role role' 'face active active';
			row-gap: 0.375rem;
		}
		.row > :global(.avatar) {
			grid-area: face;
			align-self: start;
		}
		.who {
			grid-area: who;
		}
		.role {
			grid-area: role;
		}
		.active {
			grid-area: active;
		}
		.menu {
			grid-area: menu;
		}
		.role :global(.pick) {
			inline-size: min(12rem, 100%);
		}
	}
</style>
