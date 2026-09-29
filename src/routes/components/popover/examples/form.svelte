<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Popover from '#lib/ui/Popover.svelte';

	let open = $state(false);
	let days = $state('40');
</script>

<Popover bind:open title="Extend the loan">
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>Loan: {days} days</Button>
	{/snippet}
	<form
		class="form"
		onsubmit={(e) => {
			e.preventDefault();
			open = false;
		}}
	>
		<Input label="Days" type="number" min="1" max="90" bind:value={days} />
		<Button type="submit" size="sm">Save</Button>
	</form>
</Popover>

<style>
	.form {
		display: grid;
		gap: 0.75rem;
		inline-size: 14rem;
	}
	.form > :global(button) {
		justify-self: end;
	}
</style>
