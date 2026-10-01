<script lang="ts">
	import Spinner from '#lib/ui/Spinner.svelte';
</script>

<!-- It takes the text color around it. -->
<span class="accent"><Spinner size={32} label="Loading" /></span>

<style>
	.accent {
		display: contents;
		color: var(--ui-accent);
	}
</style>
