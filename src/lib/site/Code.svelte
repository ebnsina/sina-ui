<script lang="ts">
	import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import Icon from '#lib/ui/Icon.svelte';
	import { highlighter } from './highlight';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';

	let {
		code,
		lang = 'svelte',
		label = 'Code example'
	}: { code: string; lang?: 'svelte' | 'ts' | 'css' | 'shell'; label?: string } = $props();

	// The highlighter escapes all source text; its only markup is its own token spans.
	const html = $derived(highlighter.highlight(code, { lang }).html);
	let copied = $state(false);
	let status = $state('');
	let region: HTMLDivElement;
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		clearTimeout(timer);
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			status = 'Copied to clipboard';
		} catch {
			// Clipboard blocked (insecure page or permission denied): select the code so one keypress copies it.
			getSelection()?.selectAllChildren(region.querySelector('code') ?? region);
			status = 'Code selected. Press Ctrl+C or Cmd+C to copy.';
		}
		timer = setTimeout(() => ((copied = false), (status = '')), 2500);
	}
</script>

<div class="code">
	<!-- Scrollable region pattern: long lines scroll sideways, so keyboard users must be able to focus it. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="scroll"
		{@attach scrollEdges}
		data-fade="x"
		role="region"
		tabindex="0"
		aria-label={label}
		bind:this={region}
	>
		{@html html}
	</div>
	<button type="button" class="copy" aria-label={copied ? 'Copied' : 'Copy code'} onclick={copy}>
		<span class="icon" class:shown={!copied}><Icon icon={Copy01Icon} size={16} /></span>
		<span class="icon" class:shown={copied}><Icon icon={Tick02Icon} size={16} /></span>
	</button>
	<!-- Visible and announced; absolutely placed beside the button so it never shifts the layout. -->
	<span class="status" aria-live="polite">{status}</span>
</div>

<style>
	/* The background lives here so only the code (not the block) fades at the scroll edges. */
	.code {
		position: relative;
		margin-block-start: 0.75rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--code-bg);
	}
	.scroll {
		overflow-x: auto;
		border-radius: inherit;
	}
	.scroll:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.scroll :global(pre) {
		margin: 0;
		padding-block: 1rem;
		padding-inline: 1.25rem 3.5rem;
		background: none;
		font-size: 0.875rem;
		line-height: 1.6;
		tab-size: 2;
	}
	.copy {
		box-sizing: border-box;
		position: absolute;
		inset-block-start: 0.5rem;
		inset-inline-end: 0.5rem;
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (pointer: coarse) {
		.copy {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.copy:hover {
			color: var(--ui-fg);
		}
	}
	.copy:active {
		transform: scale(0.94);
	}
	.copy:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* Copy and tick cross-fade in place: same box, no layout change. */
	.icon {
		grid-area: 1 / 1;
		display: grid;
		opacity: 0;
		scale: 0.6;
		transition:
			opacity var(--ui-dur-press) var(--ui-ease-out),
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.icon.shown {
		opacity: 1;
		scale: 1;
	}
	.status {
		position: absolute;
		inset-block-start: 0.5rem;
		inset-inline-end: 3rem;
		max-inline-size: calc(100% - 4rem);
		color: var(--ui-muted);
		font: 0.75rem/2rem var(--ui-font);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.icon {
			scale: 1;
		}
		.copy:active {
			transform: none;
		}
	}
</style>
