<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Drawer from '#lib/ui/Drawer.svelte';

	let open = $state(false);
	const hours = [
		['Saturday – Wednesday', '8:00 – 20:00'],
		['Thursday', '8:00 – 14:00'],
		['Friday', 'Closed for Jumuʿah']
	];
</script>

<Button variant="secondary" onclick={() => (open = true)}>Reading room hours</Button>

<Drawer bind:open title="Bayt al-Ḥikma, Baghdad" description="Reading room hours this week.">
	<dl>
		{#each hours as [days, time] (days)}
			<div>
				<dt>{days}</dt>
				<dd>{time}</dd>
			</div>
		{/each}
	</dl>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Not now</Button>
		<Button onclick={() => (open = false)}>Book a seat</Button>
	{/snippet}
</Drawer>

<style>
	dl {
		display: grid;
		gap: 0.5rem;
		margin: 0;
	}
	dl div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	dd {
		margin: 0;
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
