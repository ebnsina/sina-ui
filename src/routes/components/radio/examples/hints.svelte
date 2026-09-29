<script lang="ts">
	import * as Radio from '#lib/ui/radio/index.js';

	let copy = $state('scribe');
</script>

<Radio.Group legend="How should we copy it?" bind:value={copy}>
	<Radio.Item value="scribe" hint="Hand-copied on paper from the Samarkand mills."
		>Scribe</Radio.Item
	>
	<Radio.Item value="illuminated" hint="With gold leaf and lapis. Takes a season.">
		Illuminated
	</Radio.Item>
	<Radio.Item value="summary" hint="The key chapters only." disabled>Summary</Radio.Item>
</Radio.Group>
