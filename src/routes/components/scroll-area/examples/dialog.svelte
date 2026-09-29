<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import ScrollArea from '#lib/ui/ScrollArea.svelte';

	let open = $state(false);
</script>

<Button variant="secondary" onclick={() => (open = true)}>Get a reader’s card</Button>
<Dialog bind:open title="Reader’s card" description="What the House of Wisdom keeps about you.">
	<ScrollArea label="What we keep" maxHeight="10rem">
		<div class="body">
			<p><strong>Your name and city.</strong> Printed on the card, so librarians can greet you.</p>
			<p><strong>What you borrow.</strong> Kept until each work is returned, then deleted.</p>
			<p><strong>Your reading list.</strong> Only you can see it. Clear it any time.</p>
			<p><strong>Nothing else.</strong> No tracking, no selling, no sharing with anyone.</p>
			<p>
				You can ask for everything we keep, or for all of it to be deleted, at the front desk or by
				letter.
			</p>
		</div>
	</ScrollArea>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (open = false)}>Not now</Button>
		<Button onclick={() => (open = false)}>Get my card</Button>
	{/snippet}
</Dialog>

<style>
	.body {
		display: grid;
		gap: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
	}
	strong {
		color: var(--ui-fg);
	}
</style>
