<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTabs } from './context';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Selected tab. Left unset, the first enabled tab is selected. */
		value?: string;
		orientation?: 'horizontal' | 'vertical';
		/** automatic: arrow keys select. manual: arrow keys move focus, Enter/Space select. */
		activation?: 'automatic' | 'manual';
		children: Snippet;
	}

	let {
		value = $bindable(),
		orientation = 'horizontal',
		activation = 'automatic',
		children,
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();

	setTabs({
		get value() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get activation() {
			return activation;
		},
		select: (v) => (value = v),
		ids: (v) => {
			const safe = v.replace(/[^\w-]/g, '_');
			return { tab: `${id}-tab-${safe}`, panel: `${id}-panel-${safe}` };
		}
	});
</script>

<div class={['tabs', className]} data-orientation={orientation} {...rest}>
	{@render children()}
</div>

<style>
	.tabs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font: 0.9375rem/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	.tabs[data-orientation='vertical'] {
		flex-direction: row;
	}
</style>
