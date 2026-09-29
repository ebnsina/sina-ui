<script lang="ts">
	import Pagination from '#lib/ui/Pagination.svelte';

	let page = $state(2);
</script>

<Pagination bind:page count={5} label="Volumes of the Canon" />
