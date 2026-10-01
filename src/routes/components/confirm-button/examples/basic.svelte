<script lang="ts">
	import ConfirmButton from '#lib/ui/ConfirmButton.svelte';

	let status = $state('');
</script>

<ConfirmButton onconfirm={() => (status = 'The loan of the Canon of Medicine was withdrawn.')}
	>Withdraw loan</ConfirmButton
>
<p role="status">{status}</p>

<style>
	p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
