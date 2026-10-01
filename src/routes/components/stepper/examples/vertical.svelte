<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Stepper from '#lib/ui/Stepper.svelte';

	let current = $state(2);
	let problem = $state(true);
	const steps = $derived([
		{ label: 'Request received', description: 'Al-Qarawiyyin, Fez' },
		{ label: 'Copyist assigned', description: 'Lubna of Córdoba' },
		{
			label: 'Paper and ink',
			description: 'From the Samarkand mill',
			error: problem ? 'The paper order was returned. Choose another mill.' : undefined
		},
		{ label: 'Copy made', description: 'About forty days' },
		{ label: 'Sent', description: 'By the Fez caravan' }
	]);
</script>

<div class="demo">
	<Stepper {steps} {current} orientation="vertical" label="Copy of the Book of Optics" />
	<div class="actions">
		{#if problem}
			<Button variant="secondary" onclick={() => (problem = false)}>Choose another mill</Button>
		{:else}
			<Button variant="secondary" disabled={current >= steps.length} onclick={() => current++}
				>Next step</Button
			>
			<Button variant="ghost" onclick={() => ((current = 2), (problem = true))}>Start over</Button>
		{/if}
	</div>
</div>

<style>
	.demo {
		display: grid;
		gap: 1.5rem;
		inline-size: min(22rem, 100%);
	}
	.actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
