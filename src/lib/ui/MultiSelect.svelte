<script lang="ts" module>
	export interface MultiOption {
		value: string;
		label: string;
		description?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import {
		Cancel01Icon,
		Search01Icon,
		Tick02Icon,
		UnfoldMoreIcon
	} from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import { announce, isApple } from './announce';
	import { anchored, place } from './floating';
	import { glide } from './glide';
	import { pop, reflow } from './motion';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		label: string;
		options: MultiOption[];
		value?: string[];
		placeholder?: string;
		hint?: string;
		error?: string;
		/** At most this many can be chosen. */
		max?: number;
		/** Form field name: each choice is sent as its own value. */
		name?: string;
		disabled?: boolean;
		searchLabel?: string;
		empty?: string;
		class?: string;
	}

	let {
		label,
		options,
		value = $bindable([]),
		placeholder = 'Choose…',
		hint,
		error,
		max,
		name,
		disabled = false,
		searchLabel = 'Search',
		empty = 'No matches',
		class: className
	}: Props = $props();

	const id = $props.id();
	let button: HTMLButtonElement;
	let control: HTMLDivElement;
	let popup: HTMLDivElement;
	let list: HTMLDivElement;
	let search = $state<HTMLInputElement>();
	let highlight: HTMLSpanElement;
	let query = $state('');
	let open = $state(false);
	let active = $state(-1);
	let viaPointer = false;

	const chosen = $derived(new Set(value));
	const full = $derived(max !== undefined && value.length >= max);
	const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
	// Accent- and case-insensitive, so "cordoba" finds Córdoba.
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const visible = $derived(
		options
			.map((_, i) => i)
			.filter((i) => {
				const q = fold(query.trim());
				const o = options[i];
				return !q || fold(`${o.label} ${o.description ?? ''}`).includes(q);
			})
	);
	const blocked = (o: MultiOption) => o.disabled || (full && !chosen.has(o.value));
	const enabled = $derived(visible.filter((i) => !blocked(options[i])));
	const optionId = (i: number) => `${id}-opt-${i}`;
	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);

	const float = anchored(
		() => control,
		() => popup,
		() => (open = false)
	);
	$effect(() => {
		if (!open) {
			if (popup.contains(document.activeElement)) button.focus();
			float.close();
			return;
		}
		popup.style.minInlineSize = `${control.offsetWidth}px`;
		float.open();
		tick().then(() => search?.focus());
	});
	$effect(() => () => float.destroy());
	// Chips wrapping onto a new row grow the field: the open list moves with it.
	$effect(() => {
		if (!open) return;
		const seen = new ResizeObserver(() => place(control, popup));
		seen.observe(control);
		return () => seen.disconnect();
	});
	$effect(() => {
		const item =
			open && active >= 0
				? list.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)
				: null;
		glide(highlight, item, viaPointer);
		item?.scrollIntoView({ block: 'nearest' });
	});
	$effect(() => {
		const o = options[active];
		if (open && o && isApple()) announce(`${o.label}${chosen.has(o.value) ? ', selected' : ''}`);
	});

	function show() {
		if (disabled) return;
		query = '';
		active = enabled[0] ?? -1;
		open = true;
	}
	function toggle(i: number) {
		const o = options[i];
		if (!o || blocked(o)) return;
		const on = !chosen.has(o.value);
		value = on ? [...value, o.value] : value.filter((v) => v !== o.value);
		announce(`${o.label} ${on ? 'added' : 'removed'}, ${value.length} chosen`);
		if (on && max !== undefined && value.length >= max) announce(`That's the most you can choose.`);
	}
	function remove(v: string) {
		value = value.filter((x) => x !== v);
		announce(`${labelOf(v)} removed, ${value.length} chosen`);
		button.focus();
	}
	function selectAll() {
		const room = max === undefined ? Infinity : max - value.length;
		const add = visible
			.map((i) => options[i])
			.filter((o) => !o.disabled && !chosen.has(o.value))
			.slice(0, room)
			.map((o) => o.value);
		value = [...value, ...add];
		announce(`${value.length} chosen`);
	}
	/** From the box, focus goes back to the button; from inside the list it stays where it is. */
	function clear(focusBack = true) {
		value = [];
		announce('All removed');
		if (focusBack) button.focus();
	}
	function step(by: number) {
		if (!enabled.length) return;
		const pos = enabled.indexOf(active);
		const next = pos === -1 ? (by > 0 ? 0 : enabled.length - 1) : pos + by;
		active = enabled[Math.max(0, Math.min(enabled.length - 1, next))];
	}

	function onkeydown(e: KeyboardEvent) {
		viaPointer = false;
		const inSearch = e.currentTarget === search;
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
				e.preventDefault();
				show();
			} else if (e.key === 'Backspace' && value.length) {
				e.preventDefault();
				remove(value.at(-1)!);
			}
			return;
		}
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				step(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				step(-1);
				break;
			case 'Home':
			case 'End':
				if (inSearch) break;
				e.preventDefault();
				active = e.key === 'Home' ? enabled[0] : enabled.at(-1)!;
				break;
			case 'Enter':
				e.preventDefault();
				toggle(active);
				break;
			case ' ':
				if (inSearch && query) break;
				e.preventDefault();
				toggle(active);
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				break;
			case 'Tab':
				open = false;
				break;
		}
	}
</script>

<div class={['field', className]}>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<label id="{id}-label" for="{id}-button" onclick={(e) => (e.preventDefault(), button.focus())}>
		{label}
	</label>
	<!-- The box: chosen items as chips, then the button that opens the list. A press on empty space opens it too. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		bind:this={control}
		class={['control', error && 'invalid', disabled && 'disabled', open && 'open']}
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				button.focus();
				if (!open) show();
			}
		}}
	>
		<!-- Always in the page, so the last chip's exit plays too; hidden once it has none. -->
		<ul class="chips" aria-label="{label}, {value.length} chosen">
			{#each value as v (v)}
				<li transition:pop={{ start: 0.85, duration: 180 }} animate:reflow={{ duration: 220 }}>
					<span class="text">{labelOf(v)}</span>
					<button
						type="button"
						class="remove"
						aria-label="Remove {labelOf(v)}"
						tabindex="-1"
						{disabled}
						onclick={() => remove(v)}
					>
						<Icon icon={Cancel01Icon} size={12} strokeWidth={2} />
					</button>
				</li>
			{/each}
		</ul>
		<button
			bind:this={button}
			type="button"
			id="{id}-button"
			role="combobox"
			class="trigger"
			aria-labelledby="{id}-label"
			aria-haspopup="listbox"
			aria-expanded={open}
			aria-controls="{id}-list"
			aria-invalid={error ? true : undefined}
			aria-describedby={describedby}
			{disabled}
			onclick={() => (open ? (open = false) : show())}
			{onkeydown}
			onblur={(e) => {
				if (!popup.contains(e.relatedTarget as Node | null)) open = false;
			}}
		>
			<span class={['value', value.length && 'sr-only']}
				>{value.length ? `${value.length} chosen` : placeholder}</span
			>
		</button>
		{#if value.length && !disabled}
			<button
				type="button"
				class="clear"
				aria-label="Remove all"
				transition:pop={{ start: 0.8, duration: 160 }}
				onclick={() => clear()}><Icon icon={Cancel01Icon} size={14} /></button
			>
		{/if}
		<span class="chev" aria-hidden="true"><Icon icon={UnfoldMoreIcon} size={16} /></span>
	</div>
	{#if name}
		{#each value as v (v)}<input type="hidden" {name} value={v} />{/each}
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={popup}
		popover="manual"
		class="popup"
		onpointerdown={(e) => e.target !== search && e.preventDefault()}
	>
		<div class="search">
			<Icon icon={Search01Icon} size={16} />
			<input
				bind:this={search}
				type="text"
				role="combobox"
				aria-label={searchLabel}
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls="{id}-list"
				aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
				autocomplete="off"
				spellcheck="false"
				value={query}
				oninput={(e) => {
					query = e.currentTarget.value;
					active = enabled[0] ?? -1;
				}}
				{onkeydown}
				onblur={(e) => {
					const to = e.relatedTarget as Node | null;
					if (!popup.contains(to) && to !== button) open = false;
				}}
			/>
		</div>
		<div class="bulk">
			<button type="button" onclick={selectAll} disabled={full || !enabled.length}
				>Select all</button
			>
			<button type="button" onclick={() => clear(false)} disabled={!value.length}>Clear</button>
			{#if max !== undefined}<span class="count">{value.length} of {max}</span>{/if}
		</div>
		<div
			bind:this={list}
			id="{id}-list"
			role="listbox"
			aria-multiselectable="true"
			aria-labelledby="{id}-label"
			{@attach scrollEdges}
			data-fade-over
			class="list"
		>
			<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
			{#each options as o, i (o.value)}
				{#if visible.includes(i)}
					{@const on = chosen.has(o.value)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						id={optionId(i)}
						role="option"
						tabindex="-1"
						aria-selected={on}
						aria-disabled={blocked(o) || undefined}
						class="option"
						onpointermove={() => {
							viaPointer = true;
							if (!blocked(o)) active = i;
						}}
						onclick={() => toggle(i)}
					>
						<span class={['box', on && 'on']} aria-hidden="true"
							><Icon icon={Tick02Icon} size={12} strokeWidth={2.5} /></span
						>
						<span class="text">
							<span>{o.label}</span>
							{#if o.description}<span class="description">{o.description}</span>{/if}
						</span>
					</div>
				{/if}
			{/each}
		</div>
		{#if query.trim() && !visible.length}<p class="none">{empty}</p>{/if}
		<span class="sr-only" role="status"
			>{query.trim()
				? `${visible.length} ${visible.length === 1 ? 'result' : 'results'}`
				: ''}</span
		>
	</div>

	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="error">{error}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.25rem;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	label {
		font-weight: 500;
		cursor: default;
	}
	/* One box like Input; chips wrap inside it before the button. */
	.control {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		box-sizing: border-box;
		min-block-size: 2.5rem;
		padding: 0.3125rem 0.5rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.control {
			min-block-size: 2.75rem;
		}
	}
	.control:has(.trigger:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.invalid {
		border-color: var(--ui-danger);
	}
	.invalid:has(.trigger:focus-visible) {
		outline-color: var(--ui-danger);
	}
	.disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.chips:not(:has(li)) {
		display: none;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		max-inline-size: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chips li {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		max-inline-size: 100%;
		padding-inline: 0.5rem 0.125rem;
		border-radius: calc(var(--ui-radius-control) * 0.75);
		background: var(--ui-subtle);
		font-size: 0.875rem;
		line-height: 1.75rem;
	}
	.chips .text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.remove,
	.clear {
		display: grid;
		flex: none;
		place-items: center;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur) ease;
	}
	.remove {
		inline-size: 1.375rem;
		block-size: 1.375rem;
		border-radius: calc(var(--ui-radius-control) * 0.5);
	}
	.clear {
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border-radius: calc(var(--ui-radius-control) * 0.75);
	}
	@media (pointer: coarse) {
		.remove {
			inline-size: 2rem;
			block-size: 2rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.remove:hover,
		.clear:hover {
			background: var(--ui-hover);
			color: var(--ui-fg);
		}
	}
	.clear:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	.trigger {
		flex: 1;
		min-inline-size: 4rem;
		block-size: 1.75rem;
		margin: 0;
		padding: 0 0.25rem;
		border: 0;
		outline: none;
		background: none;
		color: var(--ui-muted);
		font: inherit;
		font-size: max(1rem, 16px);
		text-align: start;
		cursor: pointer;
	}
	.trigger:disabled {
		cursor: not-allowed;
	}
	.chev {
		display: grid;
		flex: none;
		color: var(--ui-muted);
	}

	.popup {
		position: fixed;
		inset: auto;
		flex-direction: column;
		margin: 0;
		box-sizing: border-box;
		max-block-size: min(22rem, calc(100dvh - 16px));
		padding: 0;
		overflow: hidden;
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
	.bulk {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.375rem 0;
	}
	.bulk button {
		padding: 0.25rem 0.5rem;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) - 0.25rem);
		background: none;
		color: var(--ui-accent);
		font: 500 0.8125rem/1.4 var(--ui-font);
		cursor: pointer;
		transition: background-color var(--ui-dur-press) ease;
	}
	.bulk button:disabled {
		color: var(--ui-muted);
		opacity: 0.6;
		cursor: default;
	}
	@media (hover: hover) and (pointer: fine) {
		.bulk button:not(:disabled):hover {
			background: var(--ui-subtle);
		}
	}
	.bulk button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	.count {
		margin-inline-start: auto;
		padding-inline-end: 0.375rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}
	.list:not(:has([role='option'])) {
		display: none;
	}
	.list {
		position: relative;
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: 0.25rem;
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
	.option[aria-disabled='true'] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	/* A checkbox look: the box fills and the tick pops in on the spring. */
	.box {
		display: grid;
		flex: none;
		place-items: center;
		box-sizing: border-box;
		inline-size: 1rem;
		block-size: 1rem;
		border: 1.5px solid var(--ui-control-line);
		border-radius: 0.3125rem;
		color: var(--ui-on-accent);
		transition:
			background-color var(--ui-dur) ease,
			border-color var(--ui-dur) ease;
	}
	.box :global(svg) {
		opacity: 0;
		scale: 0.5;
		transition:
			opacity var(--ui-dur-exit) ease,
			scale var(--ui-dur-exit) ease;
	}
	.box.on {
		border-color: var(--ui-accent);
		background: var(--ui-accent);
	}
	.box.on :global(svg) {
		opacity: 1;
		scale: 1;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			scale var(--ui-dur-spring) var(--ui-ease-spring);
	}
	.option .text {
		display: grid;
		flex: 1;
		min-inline-size: 0;
	}
	.description {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.none {
		margin: 0;
		padding: 1rem 0.75rem 1.25rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
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
	@media (prefers-reduced-motion: reduce) {
		.box :global(svg),
		.box.on :global(svg) {
			scale: 1;
		}
	}
</style>
