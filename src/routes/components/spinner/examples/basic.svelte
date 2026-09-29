<script lang="ts">
	import Spinner from '#lib/ui/Spinner.svelte';
</script>

<div class="row">
	<Spinner label="Loading" />
	<Spinner size={24} label="Loading" />
	<Spinner size={32} label="Loading" />
	<span class="accent"><Spinner size={32} label="Loading" /></span>
	<!-- Beside its own words, it's decoration: the text says what's happening. -->
	<p class="status" role="status"><Spinner /> Fetching manuscripts…</p>
</div>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
	}
	.accent {
		display: contents;
		color: var(--ui-accent);
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--ui-muted);
	}
</style>
