<script lang="ts">
	import SplitButton from '#lib/ui/SplitButton.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';

	let status = $state('');
</script>

<SplitButton
	variant="secondary"
	menuLabel="More ways to borrow"
	onclick={() => (status = 'Borrowed for two weeks.')}
>
	Borrow
	{#snippet menu()}
		<Dropdown.Item onselect={() => (status = 'Reserved for the reading room.')}>
			Read in the library
		</Dropdown.Item>
		<Dropdown.Item onselect={() => (status = 'A scribe will make you a copy.')}>
			Request a copy
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
