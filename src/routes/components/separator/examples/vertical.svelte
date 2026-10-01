<script lang="ts">
	import Separator from '#lib/ui/Separator.svelte';
</script>

<nav aria-label="Manuscript" class="links">
	<a href="#vertical">Read</a>
	<Separator orientation="vertical" />
	<a href="#vertical">Cite</a>
	<Separator orientation="vertical" />
	<a href="#vertical">Share</a>
</nav>

<style>
	.links {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}
</style>
