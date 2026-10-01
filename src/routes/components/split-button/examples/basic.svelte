<script lang="ts">
	import SplitButton from '#lib/ui/SplitButton.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';

	let status = $state('');
</script>

<SplitButton onclick={() => (status = 'Translation saved.')}>
	Save
	{#snippet menu()}
		<Dropdown.Item onselect={() => (status = 'Saved as a new copy.')}>Save as copy</Dropdown.Item>
		<Dropdown.Item onselect={() => (status = 'Saved and sent to Córdoba.')}>
			Save and send to Córdoba
		</Dropdown.Item>
	{/snippet}
</SplitButton>
<p class="status" role="status">{status}</p>

<style>
	.status {
		min-block-size: 1.5em;
		margin: 0;
		color: var(--ui-muted);
	}
</style>
