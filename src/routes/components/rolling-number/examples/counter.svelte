<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import RollingNumber from '#lib/ui/RollingNumber.svelte';

	let copies = $state(1_240);
</script>

<div class="stat">
	<span class="n"><RollingNumber value={copies} /></span>
	<span class="label">manuscripts copied</span>
	<div class="row">
		<Button variant="secondary" size="sm" onclick={() => (copies -= 17)}>−17</Button>
		<Button size="sm" onclick={() => (copies += 83)}>+83</Button>
	</div>
</div>

<style>
	.stat {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
	}
	.n {
		font: 600 2.5rem/1.1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	.label {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	.row {
		display: flex;
		gap: 0.5rem;
		margin-block-start: 0.75rem;
	}
</style>
