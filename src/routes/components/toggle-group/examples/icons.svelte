<script lang="ts">
	import {
		TextBoldIcon,
		TextItalicIcon,
		TextStrikethroughIcon,
		TextUnderlineIcon
	} from '@hugeicons/core-free-icons';
	import ToggleGroup from '#lib/ui/ToggleGroup.svelte';

	let style = $state(['bold']);
</script>

<div class="stack">
	<ToggleGroup
		label="Text style"
		bind:value={style}
		items={[
			{ value: 'bold', label: 'Bold', icon: TextBoldIcon },
			{ value: 'italic', label: 'Italic', icon: TextItalicIcon },
			{ value: 'underline', label: 'Underline', icon: TextUnderlineIcon },
			{ value: 'strike', label: 'Strikethrough', icon: TextStrikethroughIcon }
		]}
	/>
	<p
		class:bold={style.includes('bold')}
		class:italic={style.includes('italic')}
		class:underline={style.includes('underline')}
		class:strike={style.includes('strike')}
	>
		Medicine is the science by which we learn the states of the human body.
	</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
	}
	p {
		margin: 0;
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
	.strike {
		text-decoration: line-through;
	}
	.underline.strike {
		text-decoration: underline line-through;
	}
</style>
