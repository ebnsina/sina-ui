<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import RollingNumber from './RollingNumber.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		label: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		hint?: string;
		/** Formats the value for display and for screen readers (aria-valuetext). */
		format?: (value: number) => string;
		/** Locale for the default number format; fixed so server and browser render the same text. */
		locale?: string;
	}

	const uid = $props.id();
	let {
		label,
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		hint,
		format,
		locale = 'en',
		id = uid,
		class: className,
		...rest
	}: Props = $props();

	const text = $derived(format ? format(value) : new Intl.NumberFormat(locale).format(value));
	const percent = $derived(((value - min) / (max - min || 1)) * 100);
</script>

<div class={['field', className]}>
	<div class="head">
		<label for={id}>{label}</label>
		<!-- Shown for sighted users; screen readers get the same text from aria-valuetext. -->
		<output for={id} aria-hidden="true"><RollingNumber value={text} /></output>
	</div>
	<input
		type="range"
		{id}
		{min}
		{max}
		{step}
		bind:value
		aria-valuetext={text}
		aria-describedby={hint ? `${id}-hint` : undefined}
		style:--p="{percent}%"
		{...rest}
	/>
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.25rem;
		font: 0.9375rem/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	label {
		font-weight: 500;
	}
	output {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	input {
		--track: 0.375rem;
		--thumb: 1.125rem;
		--fill: linear-gradient(to right, var(--ui-accent) var(--p), var(--ui-hover) var(--p));
		appearance: none;
		inline-size: 100%;
		/* Tall enough to grab; the track itself stays thin. */
		block-size: 1.75rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		input {
			block-size: 2.75rem;
		}
	}
	input:dir(rtl) {
		--fill: linear-gradient(to left, var(--ui-accent) var(--p), var(--ui-hover) var(--p));
	}
	input::-webkit-slider-runnable-track {
		block-size: var(--track);
		border-radius: 999px;
		background: var(--fill);
	}
	input::-moz-range-track {
		block-size: var(--track);
		border-radius: 999px;
		background: var(--ui-hover);
	}
	input::-moz-range-progress {
		block-size: var(--track);
		border-radius: 999px;
		background: var(--ui-accent);
	}
	input::-webkit-slider-thumb {
		appearance: none;
		inline-size: var(--thumb);
		block-size: var(--thumb);
		margin-block-start: calc((var(--track) - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	input::-moz-range-thumb {
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	/* Pressed: the thumb swells under the finger. */
	input:active::-webkit-slider-thumb {
		scale: 1.2;
	}
	input:active::-moz-range-thumb {
		scale: 1.2;
	}
	input:focus-visible {
		outline: none;
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input:focus-visible::-moz-range-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.hint {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	@media (prefers-reduced-motion: reduce) {
		input:active::-webkit-slider-thumb,
		input:active::-moz-range-thumb {
			scale: none;
		}
	}
</style>
