<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		/** The page being shown. */
		current?: boolean;
		children: Snippet;
	}

	let { href, current = false, children, ...rest }: Props = $props();
</script>

<!-- A plain link in the bar, beside the items with panels. -->
<li>
	<a {href} class="link" aria-current={current ? 'page' : undefined} {...rest}
		>{@render children()}</a
	>
</li>

<style>
	.link {
		display: inline-flex;
		align-items: center;
		min-block-size: 2.25rem;
		padding: 0 0.75rem;
		border-radius: var(--ui-radius);
		color: inherit;
		font: 500 0.9375rem/1 var(--ui-font);
		text-decoration: none;
		transition: background-color var(--ui-dur-press) ease;
	}
	@media (pointer: coarse) {
		.link {
			min-block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.link:hover {
			background: var(--ui-subtle);
		}
	}
	.link[aria-current='page'] {
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
	}
	.link:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
