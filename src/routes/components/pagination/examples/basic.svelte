<script lang="ts">
	import Pagination from '#lib/ui/Pagination.svelte';

	let page = $state(1);
</script>

<Pagination bind:page count={24} label="Catalogue pages" />
<p>Showing page {page} of the Bayt al-Ḥikma catalogue.</p>
