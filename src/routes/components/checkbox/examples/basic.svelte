<script lang="ts">
	import Checkbox from '#lib/ui/Checkbox.svelte';

	let agreed = $state(false);
</script>

<Checkbox bind:checked={agreed} hint="Manuscripts must be back within forty days.">
	I'll return the manuscript to the House of Wisdom
</Checkbox>
