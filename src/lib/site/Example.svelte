<script lang="ts">
	import type { Component } from 'svelte';
	import Code from './Code.svelte';

	let {
		id,
		title,
		description,
		component: Preview,
		code,
		stack = false
	}: {
		id: string;
		title: string;
		description?: string;
		component: Component;
		code: string;
		/** Stack the preview vertically (forms, tabs) instead of wrapping in a row. */
		stack?: boolean;
	} = $props();

	// The code starts folded to a few lines under a "View code" button; short code shows whole.
	let open = $state(false);
	let tall = $state(true);
	let full = $state(0);
	let clip = $state<HTMLDivElement>();
	const measure = (node: HTMLDivElement) => {
		const fit = () => {
			full = node.scrollHeight;
			tall = full > 208;
		};
		fit();
		const seen = new ResizeObserver(fit);
		seen.observe(node.firstElementChild ?? node);
		return () => seen.disconnect();
	};
	async function toggle() {
		open = !open;
		// Folding back: bring the example's top into view if the code ran past it.
		if (!open) clip?.closest('.example')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}
</script>

<!-- One example per heading: its own preview and its own code, so each variation stands alone. -->
<div class="example">
	<h3 {id}>{title}</h3>
	{#if description}<p class="desc">{description}</p>{/if}
	<div class={['preview', stack && 'stack']}><Preview /></div>
	<div class={['source', tall && 'tall', open && 'open']} style:--full="{full}px">
		<div class="clip" id="{id}-code" bind:this={clip} {@attach measure}>
			<Code {code} label="{title} code" />
		</div>
		{#if tall}
			<button
				type="button"
				class="toggle"
				aria-expanded={open}
				aria-controls="{id}-code"
				onclick={toggle}>{open ? 'Show less' : 'View code'}</button
			>
		{/if}
	</div>
</div>

<style>
	.example + :global(.example) {
		margin-block-start: 2.5rem;
	}
	.desc {
		margin: -0.25rem 0 0.75rem;
		color: var(--ui-muted);
	}
	.source {
		position: relative;
		margin-block-start: 0.75rem;
	}
	/* Folded: about seven lines, a cover in the code's own colour fading them toward the button. */
	.tall .clip {
		position: relative;
		max-block-size: 13rem;
		overflow: hidden;
		transition: max-block-size 350ms var(--ui-ease-out);
	}
	.tall .clip::after {
		content: '';
		position: absolute;
		inset: 35% 0 0;
		border-radius: 0 0 calc(var(--ui-radius) * 1.5) calc(var(--ui-radius) * 1.5);
		background: linear-gradient(transparent, var(--code-bg) 85%);
		pointer-events: none;
		transition: opacity 250ms ease;
	}
	.tall.open .clip {
		max-block-size: var(--full);
	}
	.tall.open .clip::after {
		opacity: 0;
	}
	.tall .clip :global(pre),
	.tall .clip :global(.code) {
		margin-block: 0;
	}
	.toggle {
		position: absolute;
		inset-block-end: 1.25rem;
		inset-inline-start: 50%;
		translate: -50% 0;
		padding: 0.4375rem 0.875rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 500 0.8125rem/1 var(--ui-font);
		cursor: pointer;
		transition:
			background-color var(--ui-dur) ease,
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.toggle:dir(rtl) {
		translate: 50% 0;
	}
	.toggle:hover {
		background: color-mix(in srgb, var(--ui-fg) 4%, var(--ui-surface));
	}
	.toggle:active {
		scale: 0.97;
	}
	.toggle:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* Open, "Show less" sits under the code instead of over it. */
	.open .toggle {
		position: static;
		display: block;
		margin: 0.5rem auto 0;
		translate: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.tall .clip {
			transition: none;
		}
	}
</style>
