<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';
	import Select from '#lib/ui/Select.svelte';
	import Switch from '#lib/ui/Switch.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { messageOf } from './errors';
	import SaveBar from './SaveBar.svelte';
	import type { NotificationData } from './Settings.svelte';

	interface Props {
		notifications: NotificationData;
		categories: { id: string; label: string; description?: string }[];
		onsave?: (notifications: NotificationData) => Promise<void> | void;
	}
	let { notifications = $bindable(), categories, onsave }: Props = $props();

	// Every category gets both channels, off unless saved on.
	const copy = (n: NotificationData): NotificationData => ({
		...n,
		channels: Object.fromEntries(
			categories.map((c) => [
				c.id,
				{ email: n.channels[c.id]?.email ?? false, push: n.channels[c.id]?.push ?? false }
			])
		)
	});
	let draft = $state(copy(notifications));
	let saving = $state(false);
	let error = $state<string>();
	const dirty = $derived(JSON.stringify(draft) !== JSON.stringify(copy(notifications)));

	// "Pause" is picked as a length; stored as the moment it ends.
	let pause = $state('');
	const until = new Intl.DateTimeFormat(undefined, {
		weekday: 'long',
		hour: 'numeric',
		minute: '2-digit'
	});
	const pausedNow = $derived(
		!!draft.pausedUntil && new Date(draft.pausedUntil).getTime() > Date.now()
	);
	function setPause(v: string) {
		pause = v;
		const hours = { day: 24, week: 24 * 7 }[v];
		draft.pausedUntil = hours ? new Date(Date.now() + hours * 3600_000).toISOString() : null;
	}

	async function save() {
		error = undefined;
		saving = true;
		try {
			await onsave?.(copy(draft));
			notifications = copy(draft);
			toast('Notification settings saved.');
		} catch (e) {
			error = messageOf(e);
		}
		saving = false;
	}
</script>

<div class="top">
	<Select
		label="Pause all"
		value={pause}
		onchange={(e: Event) => setPause((e.currentTarget as HTMLSelectElement).value)}
		hint={pausedNow ? `Paused until ${until.format(new Date(draft.pausedUntil!))}.` : undefined}
	>
		<option value="">Not paused</option>
		<option value="day">For 1 day</option>
		<option value="week">For 1 week</option>
	</Select>
	<Segmented
		label="Email digest"
		options={[
			{ value: 'off', label: 'Off' },
			{ value: 'daily', label: 'Daily' },
			{ value: 'weekly', label: 'Weekly' }
		]}
		bind:value={draft.digest}
	/>
</div>

<table class={['grid', pausedNow && 'paused']}>
	<caption class="sr">What to be told about, and how</caption>
	<thead>
		<tr
			><th scope="col"><span class="sr">Topic</span></th><th scope="col">Email</th><th scope="col"
				>Push</th
			></tr
		>
	</thead>
	<tbody>
		{#each categories as c (c.id)}
			<tr>
				<th scope="row">
					<span class="label">{c.label}</span>
					{#if c.description}<span class="desc">{c.description}</span>{/if}
				</th>
				<td><Switch bind:checked={draft.channels[c.id].email} aria-label="{c.label} by email" /></td
				>
				<td><Switch bind:checked={draft.channels[c.id].push} aria-label="{c.label} as push" /></td>
			</tr>
		{/each}
	</tbody>
</table>

<SaveBar
	{dirty}
	{saving}
	{error}
	onsave={save}
	ondiscard={() => {
		draft = copy(notifications);
		pause = '';
		error = undefined;
	}}
/>

<style>
	.top {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
		gap: 1.25rem;
		max-inline-size: 36rem;
		margin-block-end: 1.5rem;
	}
	.grid {
		inline-size: 100%;
		max-inline-size: 36rem;
		border-collapse: collapse;
		transition: opacity var(--ui-dur) ease;
	}
	/* While paused, the choices are kept but read as on hold. */
	.paused {
		opacity: 0.6;
	}
	thead th {
		padding-block-end: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
		text-align: center;
	}
	tbody th {
		display: grid;
		padding-block: 0.625rem;
		font-weight: 400;
		text-align: start;
	}
	.label {
		font-weight: 500;
	}
	.desc {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	td {
		inline-size: 4.5rem;
		text-align: center;
	}
	td > :global(*) {
		display: inline-flex;
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
