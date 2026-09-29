<script lang="ts">
	import CustomSelect from '#lib/ui/CustomSelect.svelte';

	let ink = $state('lapis');
	const inks = [
		{ value: 'lapis', label: 'Lapis blue', color: '#26619c' },
		{ value: 'gall', label: 'Oak-gall black', color: '#1f1b16' },
		{ value: 'vermilion', label: 'Vermilion', color: '#d0402b' },
		{ value: 'gold', label: 'Gold leaf', color: '#c9a227' }
	];
	const colorOf = (v: string) => inks.find((i) => i.value === v)?.color;
</script>

<CustomSelect label="Ink" options={inks} bind:value={ink}>
	{#snippet item(option)}
		<span class="row">
			<span class="swatch" style:background={colorOf(option.value)}></span>
			{option.label}
		</span>
	{/snippet}
</CustomSelect>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.swatch {
		inline-size: 0.875rem;
		block-size: 0.875rem;
		border-radius: 50%;
	}
</style>
