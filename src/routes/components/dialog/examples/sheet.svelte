<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';

	let open = $state(false);
</script>

<Button variant="secondary" onclick={() => (open = true)}>Open reading rooms</Button>
<Dialog bind:open side="start" title="Reading rooms" description="Where the manuscripts are kept.">
	<ul>
		<li>Bayt al-Hikma, Baghdad</li>
		<li>Library of Córdoba</li>
		<li>Al-Qarawiyyin, Fez</li>
	</ul>
</Dialog>
