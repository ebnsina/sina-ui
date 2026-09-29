<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import {
		ArrowDown01Icon,
		Book02Icon,
		Download04Icon,
		Share08Icon
	} from '@hugeicons/core-free-icons';

	let lastAction = $state('');
</script>

<Dropdown.Root>
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>
			Book of Optics <Icon icon={ArrowDown01Icon} size={16} />
		</Button>
	{/snippet}
	<Dropdown.Item onselect={() => (lastAction = 'Opened the Book of Optics.')}>
		<Icon icon={Book02Icon} /> Open
	</Dropdown.Item>
	<Dropdown.Sub label="Download as">
		{#snippet start()}<Icon icon={Download04Icon} />{/snippet}
		<Dropdown.Item onselect={() => (lastAction = 'Downloading a PDF.')}>PDF</Dropdown.Item>
		<Dropdown.Item onselect={() => (lastAction = 'Downloading the page images.')}
			>Page images</Dropdown.Item
		>
		<Dropdown.Item onselect={() => (lastAction = 'Downloading the plain text.')}
			>Plain text</Dropdown.Item
		>
	</Dropdown.Sub>
	<Dropdown.Sub label="Send to">
		{#snippet start()}<Icon icon={Share08Icon} />{/snippet}
		<Dropdown.Item onselect={() => (lastAction = 'Sent to Baghdad.')}>Baghdad</Dropdown.Item>
		<Dropdown.Item onselect={() => (lastAction = 'Sent to Cairo.')}>Cairo</Dropdown.Item>
		<Dropdown.Item onselect={() => (lastAction = 'Sent to Córdoba.')}>Córdoba</Dropdown.Item>
	</Dropdown.Sub>
</Dropdown.Root>
<p class="status" role="status">{lastAction}</p>

<style>
	.status {
		flex-basis: 100%;
		min-block-size: 1.65em;
		margin: 0;
		color: var(--ui-muted);
	}
</style>
