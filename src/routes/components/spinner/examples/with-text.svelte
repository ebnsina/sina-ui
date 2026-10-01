<script lang="ts">
	import Spinner from '#lib/ui/Spinner.svelte';
</script>

<!-- Beside its own words, it's decoration: the text says what's happening. -->
<p class="status" role="status"><Spinner /> Fetching manuscripts…</p>

<style>
	.status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-muted);
	}
</style>
