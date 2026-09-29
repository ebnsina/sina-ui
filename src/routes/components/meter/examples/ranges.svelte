<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Meter from '#lib/ui/Meter.svelte';

	// Emptier shelves are better: under 60% is fine, over 85% needs a new room.
	let used = $state(45);
</script>

<div class="stack">
	<Meter label="Reading room shelves" value={used} low={60} high={85} optimum={0} />
	<div class="actions">
		<Button variant="secondary" size="sm" onclick={() => (used = Math.max(0, used - 15))}>
			Move volumes out
		</Button>
		<Button variant="secondary" size="sm" onclick={() => (used = Math.min(100, used + 15))}>
			Shelve a delivery
		</Button>
	</div>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
