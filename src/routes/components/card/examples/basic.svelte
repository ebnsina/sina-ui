<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
</script>

<Card title="The Canon of Medicine" description="Ibn Sina, completed 1025. Five books.">
	The standard medical text in the Islamic world and in Europe for centuries.
	{#snippet footer()}
		<Button size="sm" variant="ghost">Preview</Button>
		<Button size="sm">Borrow</Button>
	{/snippet}
</Card>
