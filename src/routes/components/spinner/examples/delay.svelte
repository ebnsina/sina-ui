<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Spinner from '#lib/ui/Spinner.svelte';

	let loading = $state(false);
	let result = $state('');

	function load(ms: number) {
		loading = true;
		result = '';
		setTimeout(() => {
			loading = false;
			result = `Loaded in ${new Intl.NumberFormat('en', { style: 'unit', unit: 'millisecond' }).format(ms)}.`;
		}, ms);
	}
</script>

<div class="stack">
	<div class="actions">
		<Button variant="secondary" disabled={loading} onclick={() => load(150)}>Quick load</Button>
		<Button variant="secondary" disabled={loading} onclick={() => load(2000)}>Slow load</Button>
	</div>
	<!-- Fixed height: the spinner and the result swap without moving anything. -->
	<div class="out" aria-busy={loading}>
		{#if loading}<Spinner size={20} delay={300} label="Loading" />{:else}{result}{/if}
	</div>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
	}
	.out {
		display: flex;
		align-items: center;
		block-size: 1.5rem;
		color: var(--ui-muted);
	}
</style>
