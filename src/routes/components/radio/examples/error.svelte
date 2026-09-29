<script lang="ts">
	import * as Radio from '#lib/ui/radio/index.js';

	let script = $state<string>();
</script>

<Radio.Group
	legend="Script for the copy"
	bind:value={script}
	required
	hint="The copyist can write in one script per manuscript."
	error={script ? undefined : 'Choose a script for the copy.'}
>
	<Radio.Item value="muhaqqaq">Muhaqqaq</Radio.Item>
	<Radio.Item value="rayhani">Rayhani</Radio.Item>
	<Radio.Item value="tawqi">Tawqi‘</Radio.Item>
</Radio.Group>
