<script lang="ts">
	import SignaturePad from '#lib/ui/SignaturePad.svelte';

	let empty = $state(true);
</script>

<div class="demo">
	<div class="terms">
		<strong>Loan of the Canon of Medicine</strong>
		<span>Bayt al-Hikma, Baghdad · returned within 40 days</span>
	</div>
	<SignaturePad label="Borrower's signature" signer="Maryam al-Asturlabi" bind:empty />
	<p class="status" role="status">{empty ? 'Not signed yet.' : 'Signed. Ready to borrow.'}</p>
</div>

<style>
	.demo {
		display: grid;
		gap: 0.75rem;
		inline-size: min(28rem, 100%);
	}
	.terms {
		display: grid;
	}
	.terms span,
	.status {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
