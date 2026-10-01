<script lang="ts">
	import { ArrowDown01Icon, Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import parsePhoneNumber, {
		AsYouType,
		getCountries,
		getCountryCallingCode,
		type CountryCode
	} from 'libphonenumber-js';
	import { onMount, tick } from 'svelte';
	import Icon from './Icon.svelte';
	import { announce, isApple } from './announce';
	import { anchored } from './floating';
	import { glide } from './glide';
	import { flag, guessCountry, matches } from './phone';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		label: string;
		/** The number in international (E.164) form, e.g. "+8801712345678"; empty until it's valid. */
		value?: string;
		/** Whether the number is a real one for its country. */
		valid?: boolean;
		/** ISO code of the chosen country. Guessed from the browser's language when left out. */
		country?: string;
		/** Countries listed first, e.g. ['BD', 'MY']. */
		preferred?: string[];
		/** Form field name: the international number is sent under it. */
		name?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		hint?: string;
		/** Your own message; replaces the built-in ones. */
		error?: string;
		class?: string;
	}

	let {
		label,
		value = $bindable(''),
		valid = $bindable(false),
		country = $bindable(),
		preferred = [],
		name,
		required = false,
		disabled = false,
		placeholder,
		hint,
		error,
		class: className
	}: Props = $props();

	const id = $props.id();
	const all = getCountries();
	let input = $state<HTMLInputElement>();
	let button: HTMLButtonElement;
	let popup: HTMLDivElement;
	let list = $state<HTMLDivElement>();
	let search = $state<HTMLInputElement>();
	let highlight = $state<HTMLSpanElement>();
	let text = $state('');
	let touched = $state(false);
	let open = $state(false);
	let query = $state('');
	let active = $state(0);
	let viaPointer = false;
	// The flag swaps with a small fade, but not on the first draw.
	let settled = $state(false);

	const iso = $derived((country ?? 'US') as CountryCode);
	// Names in the reader's language, only in the browser (the list renders only when open).
	let names = $state<Intl.DisplayNames>();
	const nameOf = (c: string) => names?.of(c) ?? c;
	const countries = $derived.by(() => {
		if (!names) return [];
		const rows = all.map((c) => ({ iso: c, name: nameOf(c), code: getCountryCallingCode(c) }));
		const collate = new Intl.Collator(names.resolvedOptions().locale).compare;
		rows.sort((a, b) => collate(a.name, b.name));
		const pinned = preferred.flatMap((p) => rows.filter((r) => r.iso === p));
		return [...pinned, ...rows.filter((r) => !preferred.includes(r.iso))];
	});
	const shown = $derived(countries.filter((c) => matches(c, query)));
	const pinnedCount = $derived(query.trim() ? 0 : preferred.length);

	// Plain-language problems, shown once the field has been left (or the form submitted).
	const problem = $derived(
		!text.trim()
			? required
				? 'Enter a phone number.'
				: ''
			: valid
				? ''
				: `That number doesn’t look right for ${nameOf(iso)}.`
	);
	const message = $derived(error ?? (touched ? problem : ''));
	const describedby = $derived(
		[hint && `${id}-hint`, message && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
	// The form won't submit while it's wrong; its invalid event shows the message instead of a bubble.
	$effect(() => input?.setCustomValidity(error ?? problem));

	function check() {
		const parsed = text.trim() ? parsePhoneNumber(text, iso) : undefined;
		valid = !!parsed?.isValid();
		value = valid ? parsed!.number : '';
	}

	onMount(() => {
		const lang = document.documentElement.lang || navigator.language;
		names = new Intl.DisplayNames([lang, navigator.language, 'en'], { type: 'region' });
		// A starting value decides the country and fills the box.
		const start = value ? parsePhoneNumber(value) : undefined;
		if (start?.country) {
			country = start.country;
			text = start.formatNational();
		} else country ??= guessCountry(navigator.language, all);
		check();
		requestAnimationFrame(() => (settled = true));
	});

	function oninput(e: Event & { currentTarget: HTMLInputElement }) {
		const el = e.currentTarget;
		const raw = el.value;
		const deleting = e instanceof InputEvent && e.inputType.startsWith('delete');
		// Reformat only when typing at the end: never move a caret that's mid-number, never undo a deletion.
		if (!deleting && el.selectionStart === raw.length) {
			if (raw.trim().startsWith('+')) {
				// A full international number (usually pasted) switches the country to match.
				const typed = new AsYouType();
				const formatted = typed.input(raw);
				const found = typed.getCountry();
				const parsed = typed.getNumber();
				if (found && parsed?.isPossible()) {
					country = found;
					text = parsed.formatNational();
					announce(nameOf(found));
				} else text = formatted;
			} else text = new AsYouType(iso).input(raw);
			if (el.value !== text) el.value = text;
		} else text = raw;
		check();
	}

	function choose(c: string) {
		country = c;
		// The digits stay; they're reformatted for the new country.
		const digits = text.replace(/\D/g, '');
		text = digits ? new AsYouType(c as CountryCode).input(digits) : '';
		check();
		open = false;
		input?.focus();
	}

	const float = anchored(
		() => button,
		() => popup,
		() => (open = false)
	);
	$effect(() => {
		if (!open) {
			if (popup.contains(document.activeElement)) button.focus();
			float.close();
			return;
		}
		float.open();
		tick().then(() => search?.focus());
	});
	$effect(() => () => float.destroy());

	const optionId = (i: number) => `${id}-opt-${i}`;
	$effect(() => {
		const el = open ? list?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`) : null;
		if (highlight) glide(highlight, el ?? null, viaPointer);
		el?.scrollIntoView({ block: 'nearest' });
		if (el && isApple() && shown[active]) announce(shown[active].name);
	});

	function show() {
		query = '';
		open = true;
		tick().then(
			() =>
				(active = Math.max(
					0,
					shown.findIndex((c) => c.iso === iso)
				))
		);
	}
	function onkeydown(e: KeyboardEvent) {
		viaPointer = false;
		const last = shown.length - 1;
		if (e.key === 'ArrowDown') active = Math.min(last, active + 1);
		else if (e.key === 'ArrowUp') active = Math.max(0, active - 1);
		else if (e.key === 'PageDown') active = Math.min(last, active + 10);
		else if (e.key === 'PageUp') active = Math.max(0, active - 10);
		else if (e.key === 'Enter' && shown[active]) choose(shown[active].iso);
		else if (e.key === 'Escape') open = false;
		else return;
		e.preventDefault();
	}
</script>

<div class={['field', className]}>
	<label for={id}>{label}</label>
	<!-- One box: the country button at the start, the number after it. -->
	<div class="control" class:invalid={!!message} class:off={disabled}>
		<button
			bind:this={button}
			type="button"
			class="country"
			aria-label="Country: {nameOf(iso)} +{getCountryCallingCode(iso)}"
			aria-haspopup="listbox"
			aria-expanded={open}
			{disabled}
			onclick={() => (open ? (open = false) : show())}
			onkeydown={(e) => {
				if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
					e.preventDefault();
					show();
				}
			}}
		>
			{#key iso}
				<span class={['cc', settled && 'swap']} aria-hidden="true">
					<span class="flag">{flag(iso)}</span>
					<span class="code">+{getCountryCallingCode(iso)}</span>
				</span>
			{/key}
			<span class={['chev', open && 'up']} aria-hidden="true"
				><Icon icon={ArrowDown01Icon} size={14} /></span
			>
		</button>
		<input
			bind:this={input}
			{id}
			type="tel"
			dir="ltr"
			inputmode="tel"
			autocomplete="tel-national"
			value={text}
			{placeholder}
			{disabled}
			aria-invalid={message ? true : undefined}
			aria-describedby={describedby}
			{oninput}
			onblur={() => (touched = true)}
			oninvalid={(e) => {
				e.preventDefault();
				touched = true;
			}}
		/>
	</div>
	{#if name}<input type="hidden" {name} {value} />{/if}
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
	{#if message}<p id="{id}-error" class="error">{message}</p>{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={popup}
		popover="manual"
		class="popup"
		onpointerdown={(e) => e.target !== search && e.preventDefault()}
	>
		{#if open}
			<div class="search">
				<Icon icon={Search01Icon} size={16} />
				<input
					bind:this={search}
					type="text"
					role="combobox"
					aria-label="Search countries"
					aria-autocomplete="list"
					aria-expanded="true"
					aria-controls="{id}-list"
					aria-activedescendant={shown[active] ? optionId(active) : undefined}
					autocomplete="off"
					spellcheck="false"
					bind:value={query}
					oninput={() => (active = 0)}
					{onkeydown}
					onblur={(e) => {
						if (!popup.contains(e.relatedTarget as Node | null)) open = false;
					}}
				/>
			</div>
			<div
				bind:this={list}
				id="{id}-list"
				role="listbox"
				aria-label="Countries"
				class="list"
				{@attach scrollEdges}
				data-fade-over
			>
				<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
				{#each shown as c, i (c.iso)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						id={optionId(i)}
						role="option"
						tabindex="-1"
						aria-selected={c.iso === iso}
						class={['option', i === pinnedCount - 1 && 'last-pinned']}
						onpointermove={() => {
							viaPointer = true;
							active = i;
						}}
						onclick={() => choose(c.iso)}
					>
						<span class="flag" aria-hidden="true">{flag(c.iso)}</span>
						<span class="name">{c.name}</span>
						<span class="dial">+{c.code}</span>
						<span class="tick" aria-hidden="true"
							>{#if c.iso === iso}<Icon icon={Tick02Icon} size={16} />{/if}</span
						>
					</div>
				{/each}
			</div>
			{#if !shown.length}<p class="none">No country matches “{query}”</p>{/if}
			<span class="sr-only" role="status"
				>{query.trim()
					? `${shown.length} ${shown.length === 1 ? 'country' : 'countries'}`
					: ''}</span
			>
		{/if}
	</div>
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
	/* The same box as Input: height, radius and border. */
	.control {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		min-inline-size: 0;
		min-block-size: 2.5rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
	}
	@media (pointer: coarse) {
		.control {
			min-block-size: 2.75rem;
		}
	}
	.control:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.invalid {
		border-color: var(--ui-danger);
		outline-color: var(--ui-danger);
	}
	.off {
		background: var(--ui-subtle);
		opacity: 0.55;
	}
	.country {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.25rem;
		align-self: stretch;
		margin: 0.1875rem;
		margin-inline-end: 0;
		padding-inline: 0.5rem 0.375rem;
		border: 0;
		border-radius: calc(var(--ui-radius-control) - 0.1875rem);
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition: background-color var(--ui-dur-press) ease;
	}
	@media (hover: hover) {
		.country:hover {
			background: var(--ui-subtle);
		}
	}
	.country:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	.country:disabled {
		cursor: not-allowed;
	}
	.cc {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.swap {
		animation: swap var(--ui-dur) var(--ui-ease-out);
	}
	@keyframes swap {
		from {
			opacity: 0;
			translate: 0 0.25em;
		}
	}
	.flag {
		font-size: 1.125rem;
		line-height: 1;
	}
	.code {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.chev {
		display: grid;
		color: var(--ui-muted);
		transition: rotate var(--ui-dur) var(--ui-ease-out);
	}
	.up {
		rotate: 180deg;
	}
	input[type='tel'] {
		box-sizing: border-box;
		appearance: none;
		flex: 1;
		min-inline-size: 0;
		align-self: stretch;
		margin: 0;
		padding: 0.375rem 0.75rem 0.375rem 0.5rem;
		border: 0;
		border-radius: inherit;
		outline: none;
		background: none;
		color: inherit;
		font: inherit;
		/* 16px minimum: iOS Safari zooms the page into any smaller input on focus. */
		font-size: max(1rem, 16px);
		font-variant-numeric: tabular-nums;
		box-shadow: none;
	}
	/* The number reads left to right in every language; in RTL it sits on the right like any text. */
	input[type='tel']:dir(ltr) {
		text-align: left;
	}
	:global([dir='rtl']) input[type='tel'] {
		text-align: right;
	}
	input::placeholder {
		color: var(--ui-muted);
		opacity: 1;
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

	.popup {
		position: fixed;
		inset: auto;
		flex-direction: column;
		box-sizing: border-box;
		inline-size: min(20rem, calc(100vw - 16px));
		max-block-size: min(22rem, calc(100dvh - 16px));
		margin: 0;
		padding: 0;
		overflow: hidden;
		/* Invisible normally; outlines the list in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: var(--ui-surface-overlay);
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
	}
	.popup:popover-open {
		display: flex;
	}
	.search {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.5rem;
		margin: 0.375rem 0.375rem 0;
		padding: 0 0.625rem;
		border-radius: calc(var(--ui-radius) - 0.125rem);
		background: var(--ui-subtle);
		color: var(--ui-muted);
	}
	.search:focus-within {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.search input {
		flex: 1;
		min-inline-size: 0;
		block-size: 2.25rem;
		margin: 0;
		padding: 0;
		border: 0;
		outline: none;
		background: none;
		color: var(--ui-fg);
		font: inherit;
		font-size: max(1rem, 16px);
	}
	.list {
		position: relative;
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: 0.25rem;
	}
	.list:not(:has([role='option'])) {
		display: none;
	}
	.option {
		position: relative;
		display: flex;
		box-sizing: border-box;
		align-items: center;
		gap: 0.625rem;
		min-block-size: 2.25rem;
		padding: 0.375rem 0.625rem;
		border-radius: calc(var(--ui-radius) - 0.25rem);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.option {
			min-block-size: 2.75rem;
		}
	}
	/* The preferred countries end with a little space before the rest. */
	.last-pinned {
		margin-block-end: 0.5rem;
	}
	.highlight {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: calc(var(--ui-radius) - 0.25rem);
		background: var(--ui-subtle);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}
	.name {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.dial {
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
	.tick {
		display: grid;
		flex: none;
		inline-size: 1rem;
		color: var(--ui-accent);
	}
	.none {
		margin: 0;
		padding: 1rem 0.75rem 1.25rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.swap {
			animation: none;
		}
		.chev {
			transition: none;
		}
	}
	@media (forced-colors: active) {
		.option[aria-selected='true'] {
			outline: 2px solid Highlight;
		}
	}
</style>
