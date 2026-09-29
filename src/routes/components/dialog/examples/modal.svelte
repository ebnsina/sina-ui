<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Input from '#lib/ui/Input.svelte';

	let open = $state(false);
</script>

<Button variant="secondary" onclick={() => (open = true)}>Edit scholar</Button>
<Dialog
	bind:open
	title="Edit scholar"
	description="Changes appear in the House of Wisdom catalogue right away."
>
	<Input
		label="Name"
		name="name"
		value="Maryam al-Ijliya"
		autocomplete="off"
		hint="Astrolabe maker, Aleppo, 10th century."
	/>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
		<Button onclick={() => (open = false)}>Save changes</Button>
	{/snippet}
</Dialog>
