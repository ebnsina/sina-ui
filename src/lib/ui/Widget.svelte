<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Names the widget for screen readers ("Study timer"). */
		label: string;
		/** Its color: text, lit parts and tinted buttons; plain text color by default. */
		tone?: string;
		/** The widest it grows ("36rem"); it fills the space it's given up to this. */
		max?: string;
		children: Snippet;
		class?: string;
	}

	let { label, tone, max = '36rem', children, class: className }: Props = $props();
</script>

<!-- A card on the system's surface, rounded well past a regular card as iOS widgets are. -->
<!-- A size container: what's inside lays itself out for the room it has (phone, tablet, desktop). -->
<section
	class={['widget', className]}
	aria-label={label}
	style:--tone={tone}
	style:max-inline-size={max}
>
	{@render children()}
</section>

<style>
	.widget {
		--tone: var(--ui-fg);
		container: widget / inline-size;
		box-sizing: border-box;
		inline-size: 100%;
		padding: 1.5rem 1.25rem 1.25rem;
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--tone);
		font: 0.9375rem/1.4 var(--ui-font);
	}
</style>
