<script lang="ts">
	import Team, { type TeamInvite, type TeamMember } from '#lib/blocks/team/Team.svelte';

	const day = 86_400_000;
	let members = $state<TeamMember[]>([
		{
			id: 'm1',
			name: 'Hunayn ibn Ishaq',
			email: 'hunayn@bayt-al-hikma.org',
			role: 'owner',
			lastActive: Date.now() - 5 * 60_000,
			you: true
		},
		{
			id: 'm2',
			name: 'Thabit ibn Qurra',
			email: 'thabit@bayt-al-hikma.org',
			role: 'admin',
			lastActive: Date.now() - 3 * 3_600_000
		},
		{
			id: 'm3',
			name: 'Hubaysh al-Asam',
			email: 'hubaysh@bayt-al-hikma.org',
			role: 'member',
			lastActive: Date.now() - 2 * day
		},
		{
			id: 'm4',
			name: 'Ishaq ibn Hunayn',
			email: 'ishaq@bayt-al-hikma.org',
			role: 'member',
			lastActive: Date.now() - 9 * day
		},
		{ id: 'm5', name: 'Qusta ibn Luqa', email: 'qusta@bayt-al-hikma.org', role: 'viewer' }
	]);
	let invites = $state<TeamInvite[]>([
		{ id: 'i1', email: 'al-kindi@bayt-al-hikma.org', role: 'member', sent: Date.now() - day }
	]);

	// Stand-ins for your API, with a little latency. Changing Qusta's role fails, to show the rollback.
	const wait = () => new Promise<void>((r) => setTimeout(r, 500));
	const fail = (code: string) => Object.assign(new Error(code), { code });
</script>

<Team
	bind:members
	bind:invites
	seats={8}
	inviteLink="https://bayt-al-hikma.org/join/translators-7f3a"
	title="Translators"
	oninvite={wait}
	onrolechange={async (m) => {
		await wait();
		if (m.id === 'm5') throw fail('network');
	}}
	onremove={wait}
	ontransfer={wait}
	onresend={wait}
	onrevoke={wait}
/>
