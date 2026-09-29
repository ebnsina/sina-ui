<script lang="ts">
	import * as Radio from '#lib/ui/radio/index.js';

	let room = $state('baghdad');
</script>

<Radio.Group legend="Reading room" bind:value={room}>
	<Radio.Item value="baghdad">Bayt al-Hikma, Baghdad</Radio.Item>
	<Radio.Item value="cordoba">Library of Córdoba</Radio.Item>
	<Radio.Item value="fez">Al-Qarawiyyin, Fez</Radio.Item>
</Radio.Group>
