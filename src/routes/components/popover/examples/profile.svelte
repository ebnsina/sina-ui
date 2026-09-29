<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Popover from '#lib/ui/Popover.svelte';
</script>

<Popover title="Muhammad ibn Musa al-Khwarizmi">
	{#snippet trigger(props)}
		<Button variant="link" {...props}>al-Khwarizmi</Button>
	{/snippet}
	<p class="bio">
		Mathematician and astronomer at the House of Wisdom, Baghdad, around 820. His book on restoring
		and balancing gave algebra its name.
	</p>
	<Button href="#profile" variant="secondary" size="sm">Read more</Button>
</Popover>

<style>
	.bio {
		margin: 0 0 0.75rem;
		color: var(--ui-muted);
	}
</style>
