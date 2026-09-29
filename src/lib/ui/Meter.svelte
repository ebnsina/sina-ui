<script lang="ts" module>
	/**
	 * How good a value is, by HTML <meter>'s rule: the region holding `optimum` is good, the one next to
	 * it so-so, the far one bad. Without low/high every value is good.
	 */
	export function tone(
		value: number,
		min: number,
		max: number,
		low = min,
		high = max,
		optimum = (min + max) / 2
	) {
		const region = (v: number) => (v < low ? 0 : v > high ? 2 : 1);
		const distance = Math.abs(region(value) - region(optimum));
		return (['good', 'fair', 'poor'] as const)[distance];
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import RollingNumber from './RollingNumber.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		value: number;
		min?: number;
		max?: number;
		/** Below this is the low range. */
		low?: number;
		/** Above this is the high range. */
		high?: number;
		/** The best value: its range shows in the accent, the one beside it in amber, the far one in red. */
		optimum?: number;
		/** Show the formatted value beside the label. */
		showValue?: boolean;
		/** Formats the value for display and for screen readers. Defaults to a percentage of the range. */
		format?: (value: number, min: number, max: number) => string;
		locale?: string;
	}

	const uid = $props.id();
	let {
		label,
		value,
		min = 0,
		max = 100,
		low,
		high,
		optimum,
		showValue = true,
		format,
		locale = 'en',
		class: className,
		...rest
	}: Props = $props();

	const ratio = $derived(Math.min(Math.max((value - min) / (max - min), 0), 1));
	const text = $derived(
		format
			? format(value, min, max)
			: new Intl.NumberFormat(locale, { style: 'percent' }).format(ratio)
	);
	const level = $derived(tone(value, min, max, low, high, optimum));
</script>

<div class={['meter', level, className]} {...rest}>
	<div class="head">
		<span id="{uid}-label">{label}</span>
		{#if showValue}<span class="value" aria-hidden="true"><RollingNumber value={text} /></span>{/if}
	</div>
	<div
		class="track"
		role="meter"
		aria-labelledby="{uid}-label"
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={text}
	>
		<div class="fill" style:transform="scaleX({ratio})"></div>
	</div>
</div>

<style>
	.meter {
		--tone: var(--ui-accent);
		/* Fills its column, so its length never follows the label's. */
		inline-size: 100%;
		display: grid;
		gap: 0.375rem;
		font: 0.875rem/1.4 var(--ui-font);
		color: var(--ui-fg);
	}
	.fair {
		--tone: var(--ui-warning);
	}
	.poor {
		--tone: var(--ui-danger);
	}
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.value {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
		transition: color var(--ui-dur) ease;
	}
	/* Out of the good range, the number takes the colour too, not just the bar. */
	:is(.fair, .poor) .value {
		color: var(--tone);
	}
	.track {
		block-size: 0.5rem;
		overflow: hidden;
		border-radius: 999px;
		background: var(--ui-hover);
	}
	/* scaleX, not width: it fills on the compositor, and grows in from empty the first time. */
	.fill {
		block-size: 100%;
		border-radius: inherit;
		background: var(--tone);
		transform-origin: left;
		transition:
			transform 500ms var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	@starting-style {
		.fill {
			transform: scaleX(0);
		}
	}
	.track:dir(rtl) .fill {
		transform-origin: right;
	}
	@media (prefers-reduced-motion: reduce) {
		.fill {
			transition: background-color var(--ui-dur) ease;
		}
	}
	@media (forced-colors: active) {
		.fill {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
</style>
