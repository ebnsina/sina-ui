<script lang="ts">
	import Switch from '#lib/ui/Switch.svelte';

	let notify = $state(true);
</script>

<form method="post">
	<Switch name="notify" bind:checked={notify}>Notify me of new translations</Switch>
</form>
