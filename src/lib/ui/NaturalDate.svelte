<script lang="ts">
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import {
		type CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import Calendar from './Calendar.svelte';
	import Icon from './Icon.svelte';
	import Popover from './Popover.svelte';
	import { bangla } from './calendars/bangla';
	import { parseDate } from './parse-date';

	const WORDS = {
		en: {
			lead: 'Type a date, like',
			or: ' or ',
			unreadable: 'Not a date we can read yet.',
			unavailable: (date: string) => `${date} isn't available.`,
			open: 'Open calendar',
			examples: ['tomorrow', 'next friday', 'in 2 weeks', '15 june']
		},
		bn: {
			lead: 'তারিখ লিখুন, যেমন',
			or: ' বা ',
			unreadable: 'এই লেখা থেকে তারিখ বোঝা যাচ্ছে না।',
			unavailable: (date: string) => `${date} তারিখটি নেওয়া যাবে না।`,
			open: 'ক্যালেন্ডার খুলুন',
			examples: ['আগামীকাল', 'আগামী শুক্রবার', '২ সপ্তাহ পরে', 'পহেলা বৈশাখ']
		}
	};

	interface Props {
		label: string;
		value?: CalendarDate;
		/** 'en' or a Bangla locale ('bn-BD'): the words it reads, its messages and how dates are written. */
		locale?: string;
		/** Phrases offered under the field; clicking one fills it in. */
		examples?: string[];
		/** Form field name: a hidden input carries the date as YYYY-MM-DD. */
		name?: string;
		min?: CalendarDate;
		max?: CalendarDate;
		isUnavailable?: (date: CalendarDate) => boolean;
	}

	let {
		label,
		value = $bindable(),
		locale = 'en',
		examples,
		name,
		min,
		max,
		isUnavailable
	}: Props = $props();

	const id = $props.id();
	const tz = getLocalTimeZone();
	// svelte-ignore state_referenced_locally
	const bn = locale.startsWith('bn');
	const words = bn ? WORDS.bn : WORDS.en;
	// Bangla digits asked for by name (WebKit's default for Bangla is Latin).
	const digits = bn ? { numberingSystem: 'beng' } : {};
	// svelte-ignore state_referenced_locally
	const long = new DateFormatter(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		...digits
	});
	// What the field shows once taken; written so the reader can read it back.
	// svelte-ignore state_referenced_locally
	const short = new DateFormatter(locale, { dateStyle: bn ? 'long' : 'medium', ...digits });
	// In Bangla the reading shows the Bangabda date too: "…২৯ সেপ্টেম্বর ২০২৬ · ১৪ আশ্বিন ১৪৩৩".
	const phrases = $derived(examples ?? words.examples);
	const describe = (d: CalendarDate) =>
		long.format(d.toDate(tz)) + (bn ? ` · ${bangla.format(d, locale)}` : '');

	let text = $state(value ? short.format(value.toDate(tz)) : '');
	let open = $state(false);
	let grid = $state<ReturnType<typeof Calendar>>();

	const guess = $derived(parseDate(text, today(tz)));
	const blocked = $derived(
		!!guess &&
			((min && guess.compare(min) < 0) ||
				(max && guess.compare(max) > 0) ||
				!!isUnavailable?.(guess))
	);
	// Shown under the field as you type: what the words mean, or why they can't be used.
	const reading = $derived(
		!text.trim()
			? ''
			: !guess
				? words.unreadable
				: blocked
					? words.unavailable(long.format(guess.toDate(tz)))
					: describe(guess)
	);

	let input: HTMLInputElement;

	function commit() {
		if (!text.trim()) value = undefined;
		else if (guess && !blocked) {
			value = guess;
			text = short.format(guess.toDate(tz));
		}
	}

	$effect(() => {
		if (open) requestAnimationFrame(() => grid?.focusDay());
	});
</script>

<div class="field">
	<label for="{id}-input">{label}</label>
	<div class="control">
		<input
			id="{id}-input"
			type="text"
			autocomplete="off"
			spellcheck="false"
			bind:this={input}
			bind:value={text}
			aria-describedby="{id}-reading {id}-hint"
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.isComposing) {
					e.preventDefault();
					commit();
				}
			}}
			onblur={commit}
		/>
		<Popover bind:open title="Choose {label.toLowerCase()}" hideTitle class="natural-popover">
			{#snippet trigger(props)}
				<button type="button" class="open" aria-label={words.open} {...props}
					><Icon icon={Calendar03Icon} size={16} /></button
				>
			{/snippet}
			<Calendar
				bind:this={grid}
				{label}
				{locale}
				{min}
				{max}
				{isUnavailable}
				{value}
				onchange={(d) => {
					value = d;
					text = short.format(d.toDate(tz));
					open = false;
				}}
			/>
		</Popover>
	</div>
	<!-- The reading always holds its line, so the page never jumps as it appears. -->
	<p id="{id}-reading" class={['reading', guess && !blocked ? 'ok' : 'bad']} role="status">
		{reading}
	</p>
	<!-- Each example is a button that types itself into the field. -->
	<p id="{id}-hint" class="hint">
		{words.lead}
		{#each phrases as phrase, i (phrase)}{i === phrases.length - 1
				? words.or
				: i
					? ', '
					: ''}<button
				type="button"
				class="example"
				onclick={() => {
					// The same as typing it: the phrase and its reading, taken on Enter or moving on.
					text = phrase;
					input.focus();
				}}>{phrase}</button
			>{/each}{bn ? '।' : '.'}
	</p>
	{#if name}<input type="hidden" {name} value={value?.toString() ?? ''} />{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.25rem;
		font: 0.9375rem/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	label {
		font-weight: 500;
	}
	.control {
		position: relative;
	}
	/* Same box as Input. */
	input {
		box-sizing: border-box;
		appearance: none;
		inline-size: 100%;
		min-block-size: 2.5rem;
		margin: 0;
		padding-block: 0.375rem;
		padding-inline: 0.75rem 2.75rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		font: inherit;
		font-size: max(1rem, 16px);
		box-shadow: none;
	}
	@media (pointer: coarse) {
		input {
			min-block-size: 2.75rem;
		}
	}
	input:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.open {
		position: absolute;
		inset-block: 0.25rem;
		inset-inline-end: 0.25rem;
		display: grid;
		place-items: center;
		inline-size: 2rem;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius-control) - 0.125rem);
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.open:hover {
			background: var(--ui-subtle);
			color: var(--ui-fg);
		}
	}
	.open:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	.control :global(.natural-popover) {
		padding: 0.75rem;
	}
	.reading,
	.hint {
		margin: 0;
		font-size: 0.8125rem;
	}
	/* One line reserved even when empty: no layout shift as the reading comes and goes. */
	.reading {
		min-block-size: 1lh;
		font-weight: 500;
	}
	.reading.ok {
		color: var(--ui-accent);
	}
	.reading.bad {
		color: var(--ui-muted);
	}
	.hint {
		color: var(--ui-muted);
	}
	/* Reads as part of the sentence; the dotted underline says it can be clicked. */
	.example {
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 2px;
		background: none;
		color: var(--ui-fg);
		font: inherit;
		text-decoration: underline dotted;
		text-underline-offset: 0.2em;
		cursor: pointer;
		transition: color var(--ui-dur) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.example:hover {
			color: var(--ui-accent);
			text-decoration-style: solid;
		}
	}
	.example:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 2px;
	}
</style>
