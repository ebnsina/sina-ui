<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import {
		ArrowDown01Icon,
		Book02Icon,
		Copy01Icon,
		Delete02Icon,
		Edit02Icon,
		Share08Icon
	} from '@hugeicons/core-free-icons';

	let lastAction = $state('');
</script>

<Dropdown.Root>
	{#snippet trigger(props)}
		<Button variant="secondary" {...props}>
			Canon of Medicine <span class="chev"><Icon icon={ArrowDown01Icon} size={16} /></span>
		</Button>
	{/snippet}
	<Dropdown.Item onselect={() => (lastAction = 'Opened the Canon of Medicine.')}>
		<Icon icon={Book02Icon} /> Open
	</Dropdown.Item>
	<Dropdown.Item onselect={() => (lastAction = 'Added a note in the margin.')}>
		<Icon icon={Edit02Icon} /> Annotate
	</Dropdown.Item>
	<Dropdown.Item onselect={() => (lastAction = 'A scribe is making a copy.')}>
		<Icon icon={Copy01Icon} /> Transcribe a copy
	</Dropdown.Item>
	<Dropdown.Item disabled><Icon icon={Share08Icon} /> Send to Córdoba</Dropdown.Item>
	<Dropdown.Separator />
	<Dropdown.Item variant="danger" onselect={() => (lastAction = 'Loan withdrawn.')}>
		<Icon icon={Delete02Icon} /> Withdraw loan
	</Dropdown.Item>
</Dropdown.Root>
<p class="status" role="status">{lastAction}</p>

<style>
	/* The chevron turns over while its menu is open. */
	.chev {
		display: grid;
		transition: rotate var(--ui-dur) var(--ui-ease-out);
	}
	:global([aria-expanded='true']) > :global(.label) > .chev {
		rotate: 180deg;
	}
	.status {
		flex-basis: 100%;
		min-block-size: 1.65em;
		margin: 0;
		color: var(--ui-muted);
	}
</style>
