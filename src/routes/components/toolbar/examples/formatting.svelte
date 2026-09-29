<script lang="ts">
	import {
		ArrowDown01Icon,
		TextAlignCenterIcon,
		TextAlignLeftIcon,
		TextAlignRightIcon,
		TextBoldIcon,
		TextItalicIcon,
		TextUnderlineIcon,
		ArrowTurnBackwardIcon,
		ArrowTurnForwardIcon
	} from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Toolbar from '#lib/ui/Toolbar.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';

	let bold = $state(true);
	let italic = $state(false);
	let underline = $state(false);
	let align = $state<'left' | 'center' | 'right'>('left');
	const aligns = [
		{ value: 'left', label: 'Align left', icon: TextAlignLeftIcon },
		{ value: 'center', label: 'Centre', icon: TextAlignCenterIcon },
		{ value: 'right', label: 'Align right', icon: TextAlignRightIcon }
	] as const;
</script>

<Toolbar label="Formatting">
	<Button
		variant="ghost"
		size="sm"
		square
		aria-label="Bold"
		aria-pressed={bold}
		onclick={() => (bold = !bold)}
	>
		<Icon icon={TextBoldIcon} size={18} />
	</Button>
	<Button
		variant="ghost"
		size="sm"
		square
		aria-label="Italic"
		aria-pressed={italic}
		onclick={() => (italic = !italic)}
	>
		<Icon icon={TextItalicIcon} size={18} />
	</Button>
	<Button
		variant="ghost"
		size="sm"
		square
		aria-label="Underline"
		aria-pressed={underline}
		onclick={() => (underline = !underline)}
	>
		<Icon icon={TextUnderlineIcon} size={18} />
	</Button>
	<span role="separator"></span>
	{#each aligns as a (a.value)}
		<Button
			variant="ghost"
			size="sm"
			square
			aria-label={a.label}
			aria-pressed={align === a.value}
			onclick={() => (align = a.value)}
		>
			<Icon icon={a.icon} size={18} />
		</Button>
	{/each}
	<span role="separator"></span>
	<Button variant="ghost" size="sm" square aria-label="Undo"
		><Icon icon={ArrowTurnBackwardIcon} size={18} /></Button
	>
	<Button variant="ghost" size="sm" square aria-label="Redo" disabled
		><Icon icon={ArrowTurnForwardIcon} size={18} /></Button
	>
	<span role="separator"></span>
	<Dropdown.Root>
		{#snippet trigger(props)}
			<Button variant="ghost" size="sm" {...props}
				>Insert <Icon icon={ArrowDown01Icon} size={14} /></Button
			>
		{/snippet}
		<Dropdown.Item>Marginal note</Dropdown.Item>
		<Dropdown.Item>Diagram</Dropdown.Item>
		<Dropdown.Item>Table of stars</Dropdown.Item>
	</Dropdown.Root>
</Toolbar>
<p class="sample" class:bold class:italic class:underline style:text-align={align}>
	Light travels in straight lines from every point of a lit object.
</p>

<style>
	.sample {
		inline-size: min(26rem, 100%);
		margin: 1rem 0 0;
		font-size: 0.9375rem;
	}
	.bold {
		font-weight: 600;
	}
	.italic {
		font-style: italic;
	}
	.underline {
		text-decoration: underline;
	}
</style>
