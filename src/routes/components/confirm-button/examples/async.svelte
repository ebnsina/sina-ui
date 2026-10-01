<script lang="ts">
	import ConfirmButton from '#lib/ui/ConfirmButton.svelte';

	const remove = () => new Promise((resolve) => setTimeout(resolve, 1000));
</script>

<ConfirmButton onconfirm={remove} confirm="Delete for everyone?" done="Deleted" timeout={5000}
	>Delete the draft</ConfirmButton
>
