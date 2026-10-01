<script lang="ts">
	import MultiSelect, { type MultiOption } from '#lib/ui/MultiSelect.svelte';

	const translators: MultiOption[] = [
		{ value: 'hunayn', label: 'Hunayn ibn Ishaq', description: 'Greek and Syriac' },
		{ value: 'thabit', label: 'Thabit ibn Qurra', description: 'Greek, mathematics' },
		{ value: 'qusta', label: 'Qusta ibn Luqa', description: 'Greek, medicine' },
		{ value: 'ishaq', label: 'Ishaq ibn Hunayn', description: 'Greek, philosophy' },
		{ value: 'ibn-muqaffa', label: 'Ibn al-Muqaffa', description: 'Middle Persian' },
		{
			value: 'yahya',
			label: 'Yahya ibn al-Bitriq',
			description: 'Greek, unavailable',
			disabled: true
		}
	];
	let team = $state<string[]>([]);
</script>

<form class="demo" onsubmit={(e) => e.preventDefault()}>
	<MultiSelect
		label="Translators"
		options={translators}
		bind:value={team}
		max={3}
		name="translators"
		placeholder="Choose up to three"
	/>
	<p class="out">Sends: {team.length ? team.join(', ') : 'nothing yet'}</p>
</form>

<style>
	.demo {
		inline-size: min(24rem, 100%);
	}
	.out {
		margin: 0.5rem 0 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
</style>
