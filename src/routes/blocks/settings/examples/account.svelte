<script lang="ts">
	import Settings, {
		type NotificationData,
		type PreferencesData,
		type ProfileData,
		type Session
	} from '#lib/blocks/settings/Settings.svelte';

	// Demo stand-ins for your API: a little latency, and the errors it would send.
	const wait = (ms = 600) => new Promise<void>((r) => setTimeout(r, ms));
	const fail = (code: string) => Object.assign(new Error(code), { code });

	let profile = $state<ProfileData>({
		name: 'Maryam al-Asturlabi',
		username: 'maryam',
		email: 'maryam@bayt-al-hikma.org',
		phone: '+963211234567',
		bio: 'Astrolabe maker in Aleppo. Instruments for the observatory and the court.'
	});
	let preferences = $state<PreferencesData>({
		theme: 'system',
		language: 'en',
		timeZone: 'Asia/Damascus'
	});
	let notifications = $state<NotificationData>({
		channels: {
			loans: { email: true, push: true },
			mentions: { email: false, push: true },
			lectures: { email: true, push: false }
		},
		digest: 'weekly',
		pausedUntil: null
	});
	const categories = [
		{ id: 'loans', label: 'Loans', description: 'Due dates and returns' },
		{ id: 'mentions', label: 'Mentions', description: 'When someone tags you in a note' },
		{ id: 'lectures', label: 'Lectures', description: 'New talks in the reading room' },
		{ id: 'news', label: 'Library news' }
	];
	const hour = 3600_000;
	let sessions = $state<Session[]>([
		{
			id: 'a',
			device: 'MacBook · Safari',
			location: 'Aleppo',
			lastActive: new Date(),
			current: true
		},
		{
			id: 'b',
			device: 'iPhone · Bayt app',
			location: 'Aleppo',
			lastActive: new Date(Date.now() - 2 * hour),
			kind: 'phone'
		},
		{
			id: 'c',
			device: 'Windows · Firefox',
			location: 'Damascus',
			lastActive: new Date(Date.now() - 50 * hour)
		}
	]);
	let notificationTries = 0;
</script>

<div class="frame">
	<Settings
		bind:profile
		bind:preferences
		bind:notifications
		bind:sessions
		{categories}
		checkUsername={async (u) => {
			await wait(400);
			return !['ibn-sina', 'admin', 'khwarizmi'].includes(u);
		}}
		onsaveprofile={async (p) => {
			await wait();
			if (p.username === 'ibn-sina') throw fail('username_taken');
		}}
		onsavepreferences={() => wait()}
		onsavenotifications={async () => {
			await wait();
			// The first save fails, to show the message and a second try.
			if (notificationTries++ === 0) throw fail('network');
		}}
		onchangepassword={async (current) => {
			await wait();
			if (current !== 'aleppo-1000') throw fail('wrong_password');
		}}
		onstarttwofactor={async () => {
			await wait(500);
			return { secret: 'JBSW Y3DP EHPK 3PXP' };
		}}
		onenabletwofactor={async (code) => {
			await wait();
			if (code !== '123456') throw fail('invalid_code');
			return ['7KQ2-M9XD', 'P4TR-8HWN', 'C6VB-2LZE', 'Y3NF-5QJA', 'H8GS-4UKM', 'R2DW-9TXC'];
		}}
		ondisabletwofactor={() => wait()}
		onsignout={() => wait()}
		onsignoutothers={() => wait()}
		onexport={() => wait(900)}
		ondelete={() => wait(800)}
	/>
</div>

<style>
	/* A framed page for the example; in your app, give it the page. */
	.frame {
		inline-size: 100%;
		padding: 1rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-bg);
	}
</style>
