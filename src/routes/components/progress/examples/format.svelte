<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Progress from '#lib/ui/Progress.svelte';

	let folios = $state(12);
</script>

<Progress
	label="Folios copied"
	value={folios}
	max={40}
	format={(v, max) => `${v} of ${max} folios`}
/>
<Button size="sm" variant="secondary" onclick={() => (folios = Math.min(40, folios + 7))}>
	Copy seven more
</Button>
