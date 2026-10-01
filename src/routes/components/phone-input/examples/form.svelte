<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import PhoneInput from '#lib/ui/PhoneInput.svelte';

	let sent = $state('');
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		sent = String(new FormData(e.currentTarget).get('phone'));
	}}
>
	<PhoneInput label="Phone for the reading room" name="phone" country="TR" required />
	<Button type="submit">Book a desk</Button>
	<p class="out" role="status">{sent ? `Would send phone=${sent}` : ''}</p>
</form>

<style>
	form {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
	}
	form > :global(.field) {
		justify-self: stretch;
	}
	.out {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
