<script lang="ts">
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import { type CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import Calendar, { type DateRange } from './Calendar.svelte';
	import Icon from './Icon.svelte';
	import Popover from './Popover.svelte';
	import { scrollEdges } from './scroll-edges';
	import type { CustomCalendar } from './calendars/bangla';

	interface Props {
		label: string;
		value?: DateRange;
		placeholder?: string;
		hint?: string;
		error?: string;
		/** Form field names: hidden inputs carry each end as YYYY-MM-DD. */
		startName?: string;
		endName?: string;
		/** Quick picks shown beside the calendar ("Next 7 days"). */
		presets?: ({ label: string } & DateRange)[];
		/** Months side by side; they stack on narrow screens. */
		months?: number;
		locale?: string;
		calendar?: string | CustomCalendar;
		min?: CalendarDate;
		max?: CalendarDate;
		isUnavailable?: (date: CalendarDate) => boolean;
		disabled?: boolean;
	}

	let {
		label,
		value = $bindable(),
		placeholder = 'Choose dates',
		hint,
		error,
		startName,
		endName,
		presets,
		months = 2,
		locale = 'en',
		calendar = 'gregory',
		min,
		max,
		isUnavailable,
		disabled = false
	}: Props = $props();

	const id = $props.id();
	const tz = getLocalTimeZone();
	let open = $state(false);
	let grid = $state<ReturnType<typeof Calendar>>();
	// Intl writes ranges compactly ("12 – 18 Mar 2026"); a custom calendar joins its two dates.
	const text = $derived(
		!value
			? undefined
			: typeof calendar === 'string'
				? new DateFormatter(locale, { dateStyle: 'medium', calendar }).formatRange(
						value.start.toDate(tz),
						value.end.toDate(tz)
					)
				: `${calendar.format(value.start, locale)} – ${calendar.format(value.end, locale)}`
	);
	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
	const same = (p: DateRange) =>
		!!value && p.start.compare(value.start) === 0 && p.end.compare(value.end) === 0;

	$effect(() => {
		if (open) requestAnimationFrame(() => grid?.focusDay());
	});
</script>

<div class="field">
	<span id="{id}-label" class="label">{label}</span>
	<Popover bind:open title={label} hideTitle class="range-popover">
		{#snippet trigger(props)}
			<button
				type="button"
				class={['trigger', !text && 'placeholder']}
				aria-labelledby="{id}-label {id}-value"
				aria-describedby={describedby}
				data-invalid={error ? true : undefined}
				{disabled}
				{...props}
			>
				<span id="{id}-value">{text ?? placeholder}</span>
				<Icon icon={Calendar03Icon} size={16} />
			</button>
		{/snippet}
		<div class="body">
			{#if presets?.length}
				<ul class="presets" aria-label="Quick picks" {@attach scrollEdges} data-fade="x">
					{#each presets as p (p.label)}
						<li>
							<button
								type="button"
								class="preset"
								aria-current={same(p) || undefined}
								onclick={() => {
									value = { start: p.start, end: p.end };
									open = false;
								}}>{p.label}</button
							>
						</li>
					{/each}
				</ul>
			{/if}
			<Calendar
				bind:this={grid}
				mode="range"
				bind:range={value}
				{months}
				{label}
				{locale}
				{calendar}
				{min}
				{max}
				{isUnavailable}
				onrangechange={() => (open = false)}
			/>
		</div>
	</Popover>
	{#if startName}<input type="hidden" name={startName} value={value?.start.toString() ?? ''} />{/if}
	{#if endName}<input type="hidden" name={endName} value={value?.end.toString() ?? ''} />{/if}
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="error">{error}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.25rem;
		font: 0.9375rem/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	.label {
		font-weight: 500;
	}
	.field :global(.range-popover) {
		max-inline-size: calc(100vw - 16px);
		max-block-size: calc(100dvh - 16px);
		overflow: auto;
		padding: 0.75rem;
	}
	.body {
		display: flex;
		gap: 1rem;
	}
	.presets {
		display: grid;
		align-content: start;
		gap: 0.125rem;
		min-inline-size: 8rem;
		margin: 0;
		padding-block: 0;
		padding-inline: 0 0.75rem;
		list-style: none;
		box-shadow: inset -1px 0 var(--ui-line);
	}
	.preset {
		inline-size: 100%;
		min-block-size: 2rem;
		margin: 0;
		padding: 0 0.625rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-muted);
		font: inherit;
		font-size: 0.875rem;
		text-align: start;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.preset:hover {
			background: var(--ui-subtle);
			color: var(--ui-fg);
		}
	}
	.preset:active {
		transform: scale(0.97);
	}
	.preset[aria-current] {
		color: var(--ui-fg);
		font-weight: 500;
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
	}
	.preset:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	/* Narrow: quick picks become a scrolling row above the calendar. */
	@media (max-width: 40rem) {
		.body {
			flex-direction: column;
		}
		.presets {
			display: flex;
			overflow-x: auto;
			padding: 0 0 0.5rem;
			box-shadow: inset 0 -1px var(--ui-line);
			scrollbar-width: none;
		}
		.preset {
			inline-size: auto;
		}
	}
	/* Same box as Input and DatePicker. */
	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		box-sizing: border-box;
		inline-size: 100%;
		min-block-size: 2.5rem;
		margin: 0;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		font: inherit;
		font-size: max(1rem, 16px);
		font-variant-numeric: tabular-nums;
		text-align: start;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.trigger {
			min-block-size: 2.75rem;
		}
	}
	.trigger :global(svg) {
		flex: none;
		color: var(--ui-muted);
	}
	.placeholder {
		color: var(--ui-muted);
	}
	.trigger:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.trigger[data-invalid] {
		border-color: var(--ui-danger);
	}
	.trigger[data-invalid]:focus-visible {
		outline-color: var(--ui-danger);
	}
	.trigger:disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.hint,
	.error {
		margin: 0;
		font-size: 0.8125rem;
	}
	.hint {
		color: var(--ui-muted);
	}
	.error {
		color: var(--ui-danger);
	}
</style>
