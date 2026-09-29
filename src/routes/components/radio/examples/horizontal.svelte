<script lang="ts">
	import * as Radio from '#lib/ui/radio/index.js';

	let script = $state('naskh');
</script>

<Radio.Group legend="Script" orientation="horizontal" bind:value={script}>
	<Radio.Item value="kufic">Kufic</Radio.Item>
	<Radio.Item value="naskh">Naskh</Radio.Item>
	<Radio.Item value="thuluth">Thuluth</Radio.Item>
</Radio.Group>
