<script lang="ts">
	import * as Accordion from '#lib/ui/accordion/index.js';
</script>

<!-- One open at a time, using the browser's native <details name> grouping. -->
<Accordion.Root exclusive>
	<Accordion.Item title="Algebra" open>
		From al-Khwarizmi's al-Jabr, about restoring and balancing equations.
	</Accordion.Item>
	<Accordion.Item title="Algorithm">From the Latin form of al-Khwarizmi's own name.</Accordion.Item>
	<Accordion.Item title="Alchemy">
		From Arabic al-kimiya, itself borrowed from Greek.
	</Accordion.Item>
</Accordion.Root>
