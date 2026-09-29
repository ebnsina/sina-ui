<script lang="ts">
	import Pagination from '#lib/ui/Pagination.svelte';

	// Real links: each page has a URL, and it works before JavaScript loads.
	let page = $state(4);
</script>

<Pagination bind:page count={9} href={(p) => `?page=${p}#links`} label="Manuscript pages" />
