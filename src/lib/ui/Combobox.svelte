<script lang="ts" module>
	export interface ComboboxOption<V extends string = string> {
		value: V;
		label: string;
		/** Secondary line under the label. */
		description?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts" generics="T extends string">
	import { Tick02Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';
	import { announce, isApple } from './announce';
	import { anchored } from './floating';
	import { scrollEdges } from './scroll-edges';
	import { glide } from './glide';

	interface Props {
		label: string;
		options: ComboboxOption<T>[];
		value?: T | '';
		placeholder?: string;
		hint?: string;
		error?: string;
		/** Form field name: a hidden native select carries the value, so forms, autofill and required work. */
		name?: string;
		required?: boolean;
		disabled?: boolean;
		/** Shown when nothing matches what was typed. */
		empty?: string;
		/** You filter (on a server, say): called with the text as it's typed; options are shown as given. */
		onsearch?: (query: string) => void;
		/** Called when the list is scrolled near its end: load the next page into options. */
		onloadmore?: () => void;
		/** Options are on their way: shown at the end of the list. */
		loading?: boolean;
		class?: string;
	}

	let {
		label,
		options,
		value = $bindable(''),
		placeholder,
		hint,
		error,
		name,
		required = false,
		disabled = false,
		empty = 'No matches',
		onsearch,
		onloadmore,
		loading = false,
		class: className
	}: Props = $props();

	const id = $props.id();
	let input: HTMLInputElement;
	let popup: HTMLDivElement;
	let highlight: HTMLSpanElement;
	// Pointer moves glide the highlight; keyboard moves and typing snap it.
	let viaPointer = false;
	let open = $state(false);
	// Index into `options`, so option ids stay stable while the list filters.
	let active = $state(-1);
	// True once the user types; opening by click or arrow shows the whole list again.
	let filtering = $state(false);

	// Remembered, so the choice keeps its label when a search replaces the options it came from.
	let chosen = $state<ComboboxOption<T>>();
	const selected = $derived(
		options.find((o) => o.value === value) ??
			(value && chosen?.value === value ? chosen : undefined)
	);
	// A string, so new option objects with the same label don't reset what's being typed.
	const selectedLabel = $derived(selected?.label ?? '');
	// The text in the box follows the chosen option until the user types over it.
	let query = $derived(selectedLabel);
	let searched = '';
	const search = (q: string) => {
		if (onsearch && q !== searched) onsearch((searched = q));
	};

	// Accent- and case-insensitive, so "cordoba" finds Córdoba and "sina" finds Ibn Sīnā.
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const shown = $derived.by(() => {
		const all = options.map((o, i) => ({ o, i }));
		const q = fold(query.trim());
		return filtering && q && !onsearch ? all.filter(({ o }) => fold(o.label).includes(q)) : all;
	});
	const enabled = $derived(shown.filter(({ o }) => !o.disabled).map(({ i }) => i));
	const optionId = (i: number) => `${id}-opt-${i}`;
	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);

	const float = anchored(
		() => input,
		() => popup,
		() => cancel()
	);
	$effect(() => {
		if (!open) {
			float.close();
			return;
		}
		popup.style.minInlineSize = `${input.offsetWidth}px`;
		float.open();
	});
	$effect(() => () => float.destroy());

	$effect(() => {
		const item =
			open && enabled.includes(active)
				? popup.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)
				: null;
		glide(highlight, item, viaPointer);
		item?.scrollIntoView({ block: 'nearest' });
	});

	function show(at: number) {
		search('');
		filtering = false;
		active = at;
		open = true;
	}
	function choose(i: number) {
		if (i < 0 || options[i].disabled) return;
		value = options[i].value;
		chosen = options[i];
		if (isApple()) announce(`${options[i].label}, selected`);
		// Set directly too: choosing the option already chosen doesn't change `selected`.
		query = options[i].label;
		filtering = false;
		open = false;
	}
	/** Closes and puts the box back to the chosen option's label, like the typing never happened. */
	function cancel() {
		open = false;
		filtering = false;
		query = selected?.label ?? '';
	}

	// Near the end of what's loaded, ask for more; checked on scroll and whenever a page arrives,
	// since a short page may not fill the list enough to scroll at all.
	function nearEnd() {
		if (!open || loading || !onloadmore) return;
		if (popup.scrollHeight - popup.scrollTop - popup.clientHeight < 120) onloadmore();
	}
	$effect(() => {
		void [options.length, open, loading];
		requestAnimationFrame(nearEnd);
	});
	function step(by: number) {
		const pos = enabled.indexOf(active);
		const next = pos === -1 ? (by > 0 ? 0 : enabled.length - 1) : pos + by;
		active = enabled[Math.max(0, Math.min(enabled.length - 1, next))] ?? -1;
	}
	const current = () => (selected ? options.indexOf(selected) : -1);

	// VoiceOver ignores aria-activedescendant, so on Apple devices the highlighted option is spoken.
	$effect(() => {
		const o = options[active];
		if (open && o && isApple()) announce(o.label);
	});

	function onkeydown(e: KeyboardEvent) {
		// Enter and arrows while composing (Bangla, Chinese, Japanese input) belong to the input method.
		if (e.isComposing) return;
		viaPointer = false;
		switch (e.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				e.preventDefault();
				if (!open)
					show(
						current() >= 0 || e.altKey
							? current()
							: e.key === 'ArrowUp'
								? enabled.at(-1)!
								: enabled[0]
					);
				else if (e.altKey && e.key === 'ArrowUp') choose(active);
				else step(e.key === 'ArrowDown' ? 1 : -1);
				break;
			case 'Enter':
				// Closed, Enter stays with the form (submits it); open, it never submits.
				if (open) {
					e.preventDefault();
					if (active >= 0) choose(active);
				}
				break;
			case 'Escape':
				// Open: close and undo the typing. Closed: clear the field. Nothing to do: let it through,
				// so an Escape meant for a surrounding dialog still closes it.
				if (open) cancel();
				else if (query || value) {
					value = '';
					query = '';
				} else return;
				e.preventDefault();
				break;
			case 'Tab':
				if (open && active >= 0) choose(active);
				break;
		}
	}
</script>

<div class={['field', className]}>
	<label id="{id}-label" for="{id}-input">{label}</label>
	<div class="control">
		<input
			bind:this={input}
			id="{id}-input"
			type="text"
			role="combobox"
			autocomplete="off"
			spellcheck="false"
			aria-autocomplete="list"
			aria-expanded={open}
			aria-controls="{id}-list"
			aria-activedescendant={open && enabled.includes(active) ? optionId(active) : undefined}
			aria-invalid={error ? true : undefined}
			aria-describedby={describedby}
			{placeholder}
			{disabled}
			value={query}
			oninput={(e) => {
				query = e.currentTarget.value;
				// Emptying the box clears the choice: the way to clear it by touch or mouse.
				if (!query) value = '';
				filtering = true;
				search(query);
				active = enabled[0] ?? -1;
				open = true;
			}}
			onclick={() => !open && show(current())}
			{onkeydown}
			onblur={cancel}
		/>
		<span class="chev" aria-hidden="true"><Icon icon={UnfoldMoreIcon} size={16} /></span>
	</div>
	{#if name}
		<!-- React Aria's HiddenSelect: a real field for forms, autofill and required, out of sight. -->
		<select
			class="sr-only"
			tabindex="-1"
			aria-hidden="true"
			{name}
			{required}
			{disabled}
			bind:value
			onfocus={() => input.focus()}
		>
			<option value=""></option>
			{#each options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
			{#if chosen && !options.some((o) => o.value === chosen?.value)}
				<option value={chosen.value}>{chosen.label}</option>
			{/if}
		</select>
	{/if}

	<!-- Focus never enters the popup: the text box keeps it and points at the highlighted option. -->
	<!-- Presses inside keep focus in the text box, the scrollbar included. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={popup}
		popover="manual"
		{@attach scrollEdges}
		data-fade-over
		class="popup"
		onpointerdown={(e) => e.preventDefault()}
		onscroll={nearEnd}
	>
		<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
		<div
			id="{id}-list"
			role="listbox"
			aria-labelledby="{id}-label"
			aria-busy={loading || undefined}
		>
			{#each shown as { o, i } (o.value)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					id={optionId(i)}
					role="option"
					tabindex="-1"
					aria-selected={o.value === value}
					aria-disabled={o.disabled || undefined}
					class={['option', i === active && 'active']}
					onpointermove={() => {
						viaPointer = true;
						if (!o.disabled) active = i;
					}}
					onpointerdown={(e) => e.preventDefault()}
					onclick={() => choose(i)}
				>
					<span class="text">
						<span>{o.label}</span>
						{#if o.description}<span class="description">{o.description}</span>{/if}
					</span>
					<span class="tick" aria-hidden="true">
						{#if o.value === value}<Icon icon={Tick02Icon} size={16} />{/if}
					</span>
				</div>
			{/each}
		</div>
		{#if loading}
			<p class="empty loading"><Spinner size={14} /> Loading{shown.length ? ' more' : ''}…</p>
		{:else if !shown.length}<p class="empty">{empty}</p>{/if}
	</div>
	<!-- Screen readers hear how many options are left while typing. -->
	<p role="status" class="sr-only">
		{open && filtering ? `${shown.length} ${shown.length === 1 ? 'result' : 'results'}` : ''}
	</p>

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
		padding-inline: 0.75rem 2.25rem;
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
	input::placeholder {
		color: var(--ui-muted);
		opacity: 1;
	}
	input:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	input[aria-invalid='true'] {
		border-color: var(--ui-danger);
	}
	input[aria-invalid='true']:focus-visible {
		outline-color: var(--ui-danger);
	}
	input:disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.chev {
		position: absolute;
		inset-block: 0;
		inset-inline-end: 0.75rem;
		display: grid;
		place-items: center;
		color: var(--ui-muted);
		pointer-events: none;
	}

	.popup {
		position: fixed;
		inset: auto;
		margin: 0;
		box-sizing: border-box;
		max-block-size: min(20rem, calc(100dvh - 16px));
		overflow: auto;
		overscroll-behavior: contain;
		padding: 0.25rem;
		/* Invisible normally; outlines the list in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
	}
	.option {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-sizing: border-box;
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
	.option[aria-disabled='true'] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.text {
		display: grid;
		flex: 1;
		min-inline-size: 0;
	}
	.tick {
		display: grid;
		flex: none;
		inline-size: 1rem;
		color: var(--ui-accent);
	}
	.description {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	/* One highlight glides between options (see glide.ts); options stay transparent above it. */
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
	.empty {
		margin: 0;
		padding: 0.5rem 0.625rem;
		color: var(--ui-muted);
	}
	.loading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
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
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (forced-colors: active) {
		.option.active {
			outline: 2px solid Highlight;
		}
	}
</style>
