<script lang="ts" module>
	export interface Person {
		id: string;
		name: string;
		/** A second line: a role, a city. */
		detail?: string;
		avatar?: string;
	}
</script>

<script lang="ts">
	import { flushSync } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { announce, isApple } from './announce';
	import { anchored } from './floating';
	import { glide } from './glide';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		label: string;
		value?: string;
		/** Ids of the people mentioned in the text, kept in step as mentions are added or deleted. */
		mentions?: string[];
		/** Everyone who can be mentioned; or pass search to look them up as you type. */
		people?: Person[];
		search?: (query: string) => Promise<Person[]>;
		placeholder?: string;
		hint?: string;
		error?: string;
		name?: string;
		rows?: number;
		disabled?: boolean;
		empty?: string;
		class?: string;
	}

	let {
		label,
		value = $bindable(''),
		mentions = $bindable([]),
		people = [],
		search,
		placeholder,
		hint,
		error,
		name,
		rows = 3,
		disabled = false,
		empty = 'No one by that name',
		class: className
	}: Props = $props();

	const id = $props.id();
	let area: HTMLTextAreaElement;
	let backdrop: HTMLDivElement;
	let caret: HTMLSpanElement;
	let popup: HTMLDivElement;
	let list = $state<HTMLDivElement>();
	let highlight = $state<HTMLSpanElement>();

	// The mention being typed: where its "@" is, and what follows it.
	let at = $state(-1);
	let query = $state('');
	let open = $state(false);
	let active = $state(0);
	let found = $state<Person[]>([]);
	let loading = $state(false);
	// Escape closes the list for this "@" until the caret leaves it.
	let dismissed = -1;
	let viaPointer = false;
	// Everyone inserted so far; a mention counts while its "@Name" is still in the text.
	let known = $state<Person[]>([]);

	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const optionId = (i: number) => `${id}-opt-${i}`;
	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);

	$effect(() => {
		const inText = known.filter((p) => value.includes(`@${p.name}`));
		const ids = [...new Set(inText.map((p) => p.id))];
		if (ids.join() !== mentions.join()) mentions = ids;
	});

	// Local lists filter at once; a search function is asked for each query, latest answer wins.
	let asked = 0;
	$effect(() => {
		if (!open) return;
		const q = query;
		if (!search) {
			const f = fold(q);
			found = people.filter((p) => fold(`${p.name} ${p.detail ?? ''}`).includes(f)).slice(0, 8);
			return;
		}
		const n = ++asked;
		loading = true;
		search(q).then(
			(r) => n === asked && ((found = r.slice(0, 8)), (loading = false)),
			() => n === asked && ((found = []), (loading = false))
		);
	});
	$effect(() => {
		void found;
		active = 0;
	});

	const float = anchored(
		() => caret,
		() => popup,
		() => (open = false),
		{ align: 'start', gap: 4 }
	);
	$effect(() => {
		if (open) float.open();
		else float.close();
	});
	$effect(() => () => float.destroy());
	$effect(() => {
		const item =
			open && list ? list.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`) : null;
		if (highlight) glide(highlight, item, viaPointer);
		item?.scrollIntoView({ block: 'nearest' });
	});
	$effect(() => {
		const p = found[active];
		if (open && p && isApple()) announce(p.name);
	});

	/** Puts the invisible caret anchor where the text caret is, using a copy of the text up to it. */
	let measured = $state('');
	let mark: HTMLSpanElement;
	function placeCaret(index: number) {
		measured = value.slice(0, index);
		flushSync();
		caret.style.left = `${mark.offsetLeft}px`;
		caret.style.top = `${mark.offsetTop - area.scrollTop}px`;
		caret.style.blockSize = `${mark.offsetHeight}px`;
	}

	/** Reads the text before the caret: an "@" at a word start followed by name letters opens the list. */
	function check() {
		const pos = area.selectionStart;
		if (pos !== area.selectionEnd) return close();
		const before = value.slice(0, pos);
		// Right after a finished mention: it's a token, not a search.
		if (known.some((p) => before.endsWith(`@${p.name}`))) return close();
		const m = before.match(/(^|\s)@([\p{L}\p{N}_.'-]*(?: [\p{L}\p{N}_.'-]*)?)$/u);
		if (!m || m[2].length > 40) return close();
		// A space only continues a mention while it still matches a name ("@Ibn S" → Ibn Sina).
		if (m[2].includes(' ')) {
			const f = fold(m[2]);
			if (!(search ? found : people).some((p) => fold(p.name).startsWith(f))) return close();
		}
		const start = pos - m[2].length - 1;
		if (start === dismissed) return;
		at = start;
		query = m[2];
		placeCaret(start);
		open = true;
	}
	function close() {
		open = false;
		at = -1;
	}

	function pick(i: number) {
		const p = found[i];
		if (!p || at < 0) return;
		const end = area.selectionStart;
		const text = `@${p.name} `;
		value = value.slice(0, at) + text + value.slice(end);
		if (!known.some((k) => k.id === p.id)) known = [...known, p];
		const caretAt = at + text.length;
		close();
		announce(`${p.name} mentioned`);
		// Synchronously, so a key pressed straight away lands after the name.
		flushSync();
		area.setSelectionRange(caretAt, caretAt);
		area.focus();
	}

	function onkeydown(e: KeyboardEvent) {
		viaPointer = false;
		// A mention is one piece: Backspace right after it takes the whole "@Name".
		if (e.key === 'Backspace' && !open && area.selectionStart === area.selectionEnd) {
			const before = value.slice(0, area.selectionStart);
			const hit = known.find((p) => before.endsWith(`@${p.name}`));
			if (hit) {
				e.preventDefault();
				const from = before.length - hit.name.length - 1;
				value = value.slice(0, from) + value.slice(before.length);
				flushSync();
				area.setSelectionRange(from, from);
				announce(`${hit.name} removed`);
				return;
			}
		}
		if (!open) return;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				active = Math.min(found.length - 1, active + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				active = Math.max(0, active - 1);
				break;
			case 'Enter':
			case 'Tab':
				if (!found.length) return;
				e.preventDefault();
				pick(active);
				break;
			case 'Escape':
				e.preventDefault();
				e.stopPropagation();
				dismissed = at;
				close();
				break;
		}
	}

	// The text again, behind the (see-through) field, with mentions tinted so they read as tokens.
	const parts = $derived.by(() => {
		const names = [...new Set(known.map((p) => p.name))].sort((a, b) => b.length - a.length);
		if (!names.length) return [{ text: value, mention: false }];
		const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const re = new RegExp(`(@(?:${names.map(escape).join('|')}))`, 'gu');
		return value
			.split(re)
			.map((text, i) => ({ text, mention: i % 2 === 1 }))
			.filter((p) => p.text);
	});
</script>

<div class={['field', className]}>
	<label for="{id}-input">{label}</label>
	<div class={['box', error && 'invalid', disabled && 'disabled']}>
		<div class="backdrop text" aria-hidden="true" bind:this={backdrop}>
			{#each parts as p, i (i)}{#if p.mention}<mark>{p.text}</mark
					>{:else}{p.text}{/if}{/each}&#8203;
		</div>
		<div class="measure text" aria-hidden="true">
			{measured}<span bind:this={mark}>&#8203;</span>
		</div>
		<span class="caret" aria-hidden="true" bind:this={caret}></span>
		<!-- A textbox that points at the highlighted suggestion (aria-activedescendant), as a combobox would. -->
		<textarea
			bind:this={area}
			bind:value
			id="{id}-input"
			class="text"
			style:--rows={rows}
			{name}
			{rows}
			{placeholder}
			{disabled}
			autocomplete="off"
			aria-autocomplete="list"
			aria-controls={open ? `${id}-list` : undefined}
			aria-activedescendant={open && found[active] ? optionId(active) : undefined}
			aria-invalid={error ? true : undefined}
			aria-describedby={describedby}
			oninput={check}
			{onkeydown}
			onkeyup={(e) => ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && check()}
			onclick={check}
			onscroll={() => {
				backdrop.scrollTop = area.scrollTop;
				if (open && at >= 0) placeCaret(at);
			}}
			onblur={(e) => !popup.contains(e.relatedTarget as Node | null) && close()}></textarea>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div bind:this={popup} popover="manual" class="popup" onpointerdown={(e) => e.preventDefault()}>
		{#if found.length}
			<div
				bind:this={list}
				id="{id}-list"
				role="listbox"
				aria-label="People"
				class="list"
				{@attach scrollEdges}
				data-fade-over
			>
				<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
				{#each found as p, i (p.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						id={optionId(i)}
						role="option"
						tabindex="-1"
						aria-selected={i === active}
						class="option"
						onpointermove={() => {
							viaPointer = true;
							active = i;
						}}
						onclick={() => pick(i)}
					>
						<Avatar name={p.name} src={p.avatar} size="sm" decorative />
						<span class="who">
							<span>{p.name}</span>
							{#if p.detail}<span class="detail">{p.detail}</span>{/if}
						</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="none">{loading ? 'Searching…' : empty}</p>
		{/if}
		<span class="sr-only" role="status"
			>{open && !loading ? `${found.length} ${found.length === 1 ? 'person' : 'people'}` : ''}</span
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
	}
	/* Field, backdrop and measuring copy share one box model, so their lines break identically. */
	.box {
		position: relative;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
	}
	.text {
		box-sizing: border-box;
		inline-size: 100%;
		margin: 0;
		padding: 0.5rem 0.75rem;
		border: 1px solid transparent;
		font: inherit;
		font-size: max(1rem, 16px);
		line-height: 1.5;
		letter-spacing: normal;
		white-space: pre-wrap;
		overflow-wrap: break-word;
		scrollbar-gutter: stable;
	}
	textarea.text {
		position: relative;
		display: block;
		border-color: var(--ui-field-line);
		border-radius: var(--ui-radius);
		background: transparent;
		color: inherit;
		resize: vertical;
		field-sizing: content;
		min-block-size: calc(var(--rows, 3) * 1.5em + 1rem + 2px);
		max-block-size: 20rem;
	}
	textarea::placeholder {
		color: var(--ui-muted);
		opacity: 1;
	}
	textarea:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.invalid textarea {
		border-color: var(--ui-danger);
	}
	.invalid textarea:focus-visible {
		outline-color: var(--ui-danger);
	}
	.disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
	}
	.backdrop,
	.measure {
		position: absolute;
		inset: 0;
		overflow: hidden;
		color: transparent;
		pointer-events: none;
	}
	.measure {
		inset: 0 0 auto;
		visibility: hidden;
	}
	mark {
		margin-inline: -0.125em;
		padding-inline: 0.125em;
		border-radius: 0.25rem;
		background: color-mix(in srgb, var(--ui-accent) 16%, transparent);
		color: transparent;
	}
	.caret {
		position: absolute;
		inline-size: 1px;
		pointer-events: none;
	}

	.popup {
		position: fixed;
		inset: auto;
		flex-direction: column;
		margin: 0;
		box-sizing: border-box;
		inline-size: 16rem;
		max-inline-size: calc(100vw - 16px);
		max-block-size: min(18rem, calc(100dvh - 16px));
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
		align-items: center;
		gap: 0.625rem;
		min-block-size: 2.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: calc(var(--ui-radius) - 0.25rem);
		cursor: pointer;
	}
	.who {
		display: grid;
		min-inline-size: 0;
	}
	.who > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.detail {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.none {
		margin: 0;
		padding: 0.875rem 0.75rem;
		color: var(--ui-muted);
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
		mark {
			background: transparent;
		}
	}
</style>
