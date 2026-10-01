<script lang="ts">
	import HoldToConfirm from '#lib/ui/HoldToConfirm.svelte';

	let status = $state('');
</script>

<HoldToConfirm
	onconfirm={() => (status = 'The draft of the Book of Optics was removed.')}
	done="Removed">Hold to remove the draft</HoldToConfirm
>
<p role="status">{status}</p>

<style>
	p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
