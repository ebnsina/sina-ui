<script lang="ts" module>
	export type ProfileData = {
		name: string;
		username: string;
		email: string;
		phone: string;
		bio: string;
		photo?: string;
	};
	export type PreferencesData = {
		theme: 'system' | 'light' | 'dark';
		/** A BCP 47 language tag, e.g. "en-GB" or "ar". */
		language: string;
		/** An IANA time zone, e.g. "Asia/Dhaka". */
		timeZone: string;
	};
	export type NotificationData = {
		/** Per category id: which channels it uses. */
		channels: Record<string, { email: boolean; push: boolean }>;
		digest: 'off' | 'daily' | 'weekly';
		/** When a pause ends (ISO date), or null. */
		pausedUntil?: string | null;
	};
	export type Session = {
		id: string;
		device: string;
		location: string;
		lastActive: Date | string;
		kind?: 'desktop' | 'phone';
		current?: boolean;
	};
</script>

<script lang="ts">
	import { Download04Icon } from '@hugeicons/core-free-icons';
	import ActionButton from '#lib/ui/ActionButton.svelte';
	import HoldToConfirm from '#lib/ui/HoldToConfirm.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Tabs from '#lib/ui/tabs/index.js';
	import { toast } from '#lib/ui/toast/index.js';
	import { messageOf } from './errors';
	import Notifications from './Notifications.svelte';
	import Preferences from './Preferences.svelte';
	import Profile from './Profile.svelte';
	import Security from './Security.svelte';

	interface Props {
		profile: ProfileData;
		preferences: PreferencesData;
		notifications: NotificationData;
		/** Topics people can be told about. */
		categories: { id: string; label: string; description?: string }[];
		languages?: { value: string; label: string }[];
		twoFactor?: boolean;
		recoveryCodes?: string[];
		sessions?: Session[];
		/** Which section shows (bindable): profile, preferences, notifications, security or account. */
		section?: string;
		checkUsername?: (username: string) => Promise<boolean>;
		onphoto?: (file: File) => Promise<string> | string;
		onsaveprofile?: (profile: ProfileData) => Promise<void> | void;
		onsavepreferences?: (preferences: PreferencesData) => Promise<void> | void;
		onsavenotifications?: (notifications: NotificationData) => Promise<void> | void;
		onchangepassword?: (current: string, next: string) => Promise<void> | void;
		onstarttwofactor?: () => Promise<{ secret: string }> | { secret: string };
		onenabletwofactor?: (code: string) => Promise<string[]> | string[];
		ondisabletwofactor?: () => Promise<void> | void;
		onsignout?: (id: string) => Promise<void> | void;
		onsignoutothers?: () => Promise<void> | void;
		onexport?: () => Promise<void> | void;
		ondelete?: () => Promise<void> | void;
		class?: string;
	}

	let {
		profile = $bindable(),
		preferences = $bindable(),
		notifications = $bindable(),
		categories,
		languages = [
			{ value: 'en', label: 'English' },
			{ value: 'ar', label: 'العربية' },
			{ value: 'bn', label: 'বাংলা' },
			{ value: 'fa', label: 'فارسی' },
			{ value: 'tr', label: 'Türkçe' },
			{ value: 'ms', label: 'Bahasa Melayu' }
		],
		twoFactor = $bindable(false),
		recoveryCodes = $bindable([]),
		sessions = $bindable([]),
		section = $bindable('profile'),
		checkUsername,
		onphoto,
		onsaveprofile,
		onsavepreferences,
		onsavenotifications,
		onchangepassword,
		onstarttwofactor,
		onenabletwofactor,
		ondisabletwofactor,
		onsignout,
		onsignoutothers,
		onexport,
		ondelete,
		class: className
	}: Props = $props();

	const sections = [
		{ value: 'profile', label: 'Profile' },
		{ value: 'preferences', label: 'Preferences' },
		{ value: 'notifications', label: 'Notifications' },
		{ value: 'security', label: 'Security' },
		{ value: 'account', label: 'Account' }
	];

	// Wide enough: the sections list runs down the side; narrower, it scrolls across the top.
	let wide = $state(false);
	const measure = (node: HTMLElement) => {
		const seen = new ResizeObserver(([e]) => (wide = e.contentRect.width >= 640));
		seen.observe(node);
		return () => seen.disconnect();
	};

	let deleted = $state(false);
</script>

<div class={['settings', className]} {@attach measure}>
	<Tabs.Root bind:value={section} orientation={wide ? 'vertical' : 'horizontal'}>
		<Tabs.List label="Settings">
			{#each sections as s (s.value)}<Tabs.Tab value={s.value}>{s.label}</Tabs.Tab>{/each}
		</Tabs.List>

		<Tabs.Panel value="profile">
			<div class="card">
				<h2>Profile</h2>
				<p class="lede">How you appear to others.</p>
				<Profile bind:profile onsave={onsaveprofile} {checkUsername} {onphoto} />
			</div>
		</Tabs.Panel>
		<Tabs.Panel value="preferences">
			<div class="card">
				<h2>Preferences</h2>
				<p class="lede">How things look and read for you.</p>
				<Preferences bind:preferences {languages} onsave={onsavepreferences} />
			</div>
		</Tabs.Panel>
		<Tabs.Panel value="notifications">
			<div class="card">
				<h2>Notifications</h2>
				<p class="lede">What to be told about, and where.</p>
				<Notifications bind:notifications {categories} onsave={onsavenotifications} />
			</div>
		</Tabs.Panel>
		<Tabs.Panel value="security">
			<div class="card">
				<h2>Security</h2>
				<p class="lede">Your password, two-step sign-in and devices.</p>
				<Security
					bind:twoFactor
					bind:recoveryCodes
					bind:sessions
					{onchangepassword}
					{onstarttwofactor}
					{onenabletwofactor}
					{ondisabletwofactor}
					{onsignout}
					{onsignoutothers}
				/>
			</div>
		</Tabs.Panel>
		<Tabs.Panel value="account">
			<div class="card">
				<h2>Account</h2>
				<p class="lede">Take your data with you, or close your account.</p>
				<div class="row">
					<div class="grow">
						<strong>Export your data</strong>
						<span>Everything you’ve made, as files. We email a link when it’s ready.</span>
					</div>
					<ActionButton
						variant="secondary"
						action={() => onexport?.()}
						done="Export started"
						onerror={(e) => toast.error(messageOf(e))}
					>
						<Icon icon={Download04Icon} size={16} /> Export
					</ActionButton>
				</div>
				<div class="row danger">
					<div class="grow">
						<strong>Delete your account</strong>
						<span>Removes your profile and everything in it. This can’t be undone.</span>
					</div>
					{#if deleted}
						<span class="gone" role="status">Your account is being deleted.</span>
					{:else}
						<HoldToConfirm
							done="Deleted"
							onconfirm={async () => {
								try {
									await ondelete?.();
									deleted = true;
								} catch (e) {
									toast.error(messageOf(e));
									throw e;
								}
							}}>Hold to delete</HoldToConfirm
						>
					{/if}
				</div>
			</div>
		</Tabs.Panel>
	</Tabs.Root>
</div>

<style>
	.settings {
		inline-size: 100%;
		font-family: var(--ui-font);
		color: var(--ui-fg);
	}
	.settings :global(.tabs[data-orientation='vertical'] > [role='tablist']) {
		inline-size: 11rem;
	}
	.card {
		margin-block-start: 1rem;
		padding: 1.5rem;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	:global(.tabs[data-orientation='vertical']) .card {
		margin-block-start: 0;
	}
	h2 {
		margin: 0;
		font-size: 1.125rem;
	}
	.lede {
		margin: 0.25rem 0 1.5rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		padding: 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.row + .row {
		margin-block-start: 0.75rem;
	}
	.danger {
		background: color-mix(in srgb, var(--ui-danger) 6%, transparent);
	}
	.grow {
		display: grid;
		flex: 1 1 16rem;
		gap: 0.125rem;
	}
	.grow span,
	.gone {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	@media (max-width: 30rem) {
		.card {
			padding: 1.125rem;
		}
	}
</style>
