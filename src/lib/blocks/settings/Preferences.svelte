<script lang="ts">
	import Segmented from '#lib/ui/Segmented.svelte';
	import Select from '#lib/ui/Select.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { messageOf } from './errors';
	import SaveBar from './SaveBar.svelte';
	import type { PreferencesData } from './Settings.svelte';

	interface Props {
		preferences: PreferencesData;
		languages: { value: string; label: string }[];
		onsave?: (preferences: PreferencesData) => Promise<void> | void;
	}
	let { preferences = $bindable(), languages, onsave }: Props = $props();

	let draft = $state({ ...preferences });
	let saving = $state(false);
	let error = $state<string>();
	const dirty = $derived(
		draft.theme !== preferences.theme ||
			draft.language !== preferences.language ||
			draft.timeZone !== preferences.timeZone
	);

	const zones = Intl.supportedValuesOf('timeZone');
	// A live preview of how dates will read with these choices.
	const now = new Date();
	const preview = $derived.by(() => {
		try {
			return new Intl.DateTimeFormat(draft.language, {
				dateStyle: 'full',
				timeStyle: 'short',
				timeZone: draft.timeZone
			}).format(now);
		} catch {
			return '';
		}
	});

	async function save() {
		error = undefined;
		saving = true;
		try {
			await onsave?.({ ...draft });
			preferences = { ...draft };
			toast('Preferences saved.');
		} catch (e) {
			error = messageOf(e);
		}
		saving = false;
	}
</script>

<div class="fields">
	<Segmented
		label="Theme"
		options={[
			{ value: 'system', label: 'System' },
			{ value: 'light', label: 'Light' },
			{ value: 'dark', label: 'Dark' }
		]}
		bind:value={draft.theme}
	/>
	<Select label="Language" bind:value={draft.language}>
		{#each languages as l (l.value)}<option value={l.value}>{l.label}</option>{/each}
	</Select>
	<Select label="Time zone" bind:value={draft.timeZone}>
		{#each zones as z (z)}<option value={z}>{z.replaceAll('_', ' ')}</option>{/each}
	</Select>
	<div class="preview">
		<span>Dates will read</span>
		<strong>{preview}</strong>
	</div>
</div>

<SaveBar
	{dirty}
	{saving}
	{error}
	onsave={save}
	ondiscard={() => {
		draft = { ...preferences };
		error = undefined;
	}}
/>

<style>
	.fields {
		display: grid;
		gap: 1.25rem;
		max-inline-size: 32rem;
	}
	.preview {
		display: grid;
		gap: 0.125rem;
		padding: 0.75rem 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		font-size: 0.875rem;
	}
	.preview span {
		color: var(--ui-muted);
	}
	.preview strong {
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
</style>
