<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		width?: string;
		height?: string;
		circle?: boolean;
	}

	let {
		width = '100%',
		height = '1rem',
		circle = false,
		class: className,
		...rest
	}: Props = $props();
</script>

<!-- Decorative: mark the loading region itself with aria-busy="true" and a text status instead. -->
<span
	class={['skeleton', circle && 'circle', className]}
	style:inline-size={width}
	style:block-size={circle ? width : height}
	aria-hidden="true"
	{...rest}
></span>

<style>
	.skeleton {
		position: relative;
		display: block;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-hover);
	}
	.circle {
		border-radius: 50%;
	}
	/* A soft sheen sweeps across; transform only. */
	.skeleton::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, var(--ui-subtle), transparent);
		translate: -100%;
		animation: shimmer 1.6s ease-in-out infinite;
	}
	@keyframes shimmer {
		to {
			translate: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton::after {
			animation: none;
			display: none;
		}
	}
</style>
