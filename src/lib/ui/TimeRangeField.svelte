<script lang="ts" module>
	import type { Time } from '@internationalized/date';

	export interface TimeRange {
		start: Time;
		end: Time;
	}
</script>

<script lang="ts">
	import { Clock01Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import TimeField from './TimeField.svelte';

	interface Props {
		label: string;
		value?: TimeRange;
		locale?: string;
		hourCycle?: 12 | 24;
		minuteStep?: number;
		listStep?: number;
		hint?: string;
		/** Overrides the built-in "ends before it starts" message. */
		error?: string;
		startName?: string;
		endName?: string;
		disabled?: boolean;
	}

	let {
		label,
		value = $bindable(),
		locale = 'en',
		hourCycle,
		minuteStep = 1,
		listStep,
		hint,
		error,
		startName,
		endName,
		disabled = false
	}: Props = $props();

	const id = $props.id();
	// svelte-ignore state_referenced_locally
	let start = $state(value?.start);
	// svelte-ignore state_referenced_locally
	let end = $state(value?.end);
	const minutesOf = (t: Time) => t.hour * 60 + t.minute;
	let startBox = $state<HTMLElement>();
	let endBox = $state<HTMLElement>();
	let startField = $state<ReturnType<typeof TimeField>>();
	let endField = $state<ReturnType<typeof TimeField>>();
	let last = $state<ReturnType<typeof TimeField>>();

	// Checked once both are whole: a half-typed time isn't an error yet.
	const backwards = $derived(!!start && !!end && end.compare(start) <= 0);
	const shownError = $derived(
		error ?? (backwards ? 'The end has to be after the start.' : undefined)
	);
	const describedby = $derived(shownError ? `${id}-error` : hint ? `${id}-hint` : undefined);

	// Moving the start carries the end with it, keeping the length (as calendars do).
	// svelte-ignore state_referenced_locally
	let prevStart = start;
	function onstart(next: Time | undefined) {
		if (next && prevStart && end) {
			const moved = end.add({ minutes: minutesOf(next) - minutesOf(prevStart) });
			// Past midnight it would wrap to the morning: leave it for the person to fix instead.
			if (minutesOf(moved) > minutesOf(next)) end = moved;
		}
		prevStart = next;
	}

	$effect(() => {
		const next = start && end && !backwards ? { start, end } : undefined;
		if (next?.start !== value?.start || next?.end !== value?.end) value = next;
	});
</script>

<div class="range">
	<span id="{id}-label" class="label">{label}</span>
	<!-- One box for both times; each half is its own group of parts ("Start", "End"). -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class={['control', disabled && 'disabled']}
		role="group"
		aria-labelledby="{id}-label"
		aria-describedby={describedby}
		data-invalid={shownError ? true : undefined}
		onfocusin={(e) => {
			// Only the halves count: focusing the clock button mustn't forget which half was in use.
			const t = e.target as Node;
			if (endBox?.contains(t)) last = endField;
			else if (startBox?.contains(t)) last = startField;
		}}
		onclick={(e) =>
			e.target === e.currentTarget &&
			startBox?.querySelector<HTMLElement>('[role="spinbutton"]')?.focus()}
	>
		<span bind:this={startBox} class="half">
			<TimeField
				bind:this={startField}
				bare
				label="Start"
				onpick={() => endField?.show()}
				describedBy={describedby}
				bind:value={() => start, (v) => (onstart(v), (start = v))}
				{locale}
				{hourCycle}
				{minuteStep}
				{listStep}
				name={startName}
				{disabled}
			/>
		</span>
		<span class="to" aria-hidden="true">–</span>
		<span bind:this={endBox} class="half">
			<TimeField
				bind:this={endField}
				bare
				label="End"
				describedBy={describedby}
				bind:value={end}
				from={start}
				{locale}
				{hourCycle}
				{minuteStep}
				{listStep}
				error={shownError}
				name={endName}
				{disabled}
			/>
		</span>
		<!-- One button for both: it opens the list for the half you were last in. -->
		<button
			type="button"
			class="clock"
			tabindex="-1"
			aria-label="Choose a time"
			aria-haspopup="listbox"
			{disabled}
			onclick={() => (last ?? startField)?.show()}
		>
			<Icon icon={Clock01Icon} size={16} />
		</button>
	</div>
	{#if shownError}<p id="{id}-error" class="error">{shownError}</p>
	{:else if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
</div>

<style>
	.range {
		display: grid;
		gap: 0.25rem;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.label {
		font-weight: 500;
	}
	/* Same box as Input and TimeField, stretching with its field; the clock sits at the end. */
	.control {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		box-sizing: border-box;
		min-block-size: 2.5rem;
		padding: 0.25rem 0.625rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		font-size: max(1rem, 16px);
		cursor: text;
	}
	@media (pointer: coarse) {
		.control {
			min-block-size: 2.75rem;
		}
	}
	.control:focus-within {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.control[data-invalid] {
		border-color: var(--ui-danger);
		outline-color: var(--ui-danger);
	}
	.disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.half {
		display: inline-flex;
	}
	.to {
		color: var(--ui-muted);
	}
	.clock {
		display: grid;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		margin-block: 0;
		margin-inline: auto -0.25rem;
		padding: 0;
		border: 0;
		border-radius: calc(var(--ui-radius) * 0.75);
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.clock:hover {
			background: var(--ui-subtle);
			color: var(--ui-fg);
		}
	}
	.clock:active {
		transform: scale(0.92);
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
