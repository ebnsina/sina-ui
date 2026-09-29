<script lang="ts" module>
	import { Search01Icon } from '@hugeicons/core-free-icons';

	export interface Command {
		id: string;
		label: string;
		/** Heading the command is listed under. */
		group?: string;
		/** Other words it should be found by ("settings" for "Preferences"). */
		keywords?: string[];
		/** Keys to show beside it, e.g. ['⌘', 'P']: display only; bind them yourself. */
		shortcut?: string[];
		icon?: typeof Search01Icon;
		onselect: () => void;
	}
</script>

<script lang="ts">
	import { announce, isApple } from './announce';
	import { scrollEdges } from './scroll-edges';
	import Icon from './Icon.svelte';
	import { glide } from './glide';

	interface Props {
		commands: Command[];
		open?: boolean;
		/** Names the palette for screen readers. */
		label?: string;
		placeholder?: string;
		empty?: string;
		/** Open with ⌘K (Ctrl+K elsewhere) from anywhere on the page. */
		shortcut?: boolean;
	}

	let {
		commands,
		open = $bindable(false),
		label = 'Command palette',
		placeholder = 'Type a command or search…',
		empty = 'Nothing matches',
		shortcut = true
	}: Props = $props();

	const id = $props.id();
	let dialog: HTMLDialogElement;
	let results: HTMLDivElement;
	let highlight: HTMLSpanElement;
	let query = $state('');
	let active = $state(0);
	let viaPointer = false;

	// Accent- and case-insensitive, like Combobox. Rank: label starts with it, then a word in the label
	// starts with it, then anywhere in the label, then keywords. Declared order breaks ties.
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	function rank(c: Command, q: string) {
		const label = fold(c.label);
		const at = label.indexOf(q);
		if (at === 0) return 0;
		if (at > 0) return /[\s\-/]/.test(label[at - 1]) ? 1 : 2;
		return c.keywords?.some((k) => fold(k).includes(q)) ? 3 : -1;
	}
	const matches = $derived.by(() => {
		const q = fold(query.trim());
		if (!q) return commands;
		return commands
			.map((c, i) => ({ c, r: rank(c, q), i }))
			.filter((m) => m.r >= 0)
			.sort((a, b) => a.r - b.r || a.i - b.i)
			.map((m) => m.c);
	});
	// Grouped in the order groups first appear among the matches, so the best match heads the list.
	const groups = $derived.by(() => {
		const map = new Map<string, Command[]>();
		for (const c of matches) map.set(c.group ?? '', [...(map.get(c.group ?? '') ?? []), c]);
		return [...map];
	});
	// The flat order the arrow keys walk, matching what's on screen.
	const flat = $derived(groups.flatMap(([, cs]) => cs));
	const optionId = (c: Command) => `${id}-${c.id}`;

	$effect(() => {
		if (open && !dialog.open) {
			query = '';
			active = 0;
			dialog.showModal();
		} else if (!open && dialog.open) dialog.close();
	});

	// Typing starts again from the best match.
	$effect(() => {
		void query;
		active = 0;
	});

	$effect(() => {
		const c = flat[active];
		const el = open && c ? results.querySelector<HTMLElement>(`#${CSS.escape(optionId(c))}`) : null;
		glide(highlight, el, viaPointer, 140);
		el?.scrollIntoView({ block: 'nearest' });
		// VoiceOver ignores aria-activedescendant; say the highlighted command on Apple devices.
		if (el && isApple()) announce(c.label);
	});

	function run(c: Command | undefined) {
		if (!c) return;
		dialog.close();
		c.onselect();
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.isComposing) return;
		viaPointer = false;
		const n = flat.length;
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			// Wraps round, like every command menu.
			if (n) active = (active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			run(flat[active]);
		}
	}

	let pressedBackdrop = false;
</script>

<svelte:window
	onkeydown={(e) => {
		if (shortcut && e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey) {
			e.preventDefault();
			open = !open;
		}
	}}
/>

<dialog
	bind:this={dialog}
	class="palette"
	aria-label={label}
	onclose={() => (open = false)}
	onpointerdown={(e) => (pressedBackdrop = e.target === dialog)}
	onclick={(e) => {
		if (pressedBackdrop && e.target === dialog) dialog.close();
	}}
>
	<div class="search">
		<Icon icon={Search01Icon} size={18} />
		<input
			bind:value={query}
			type="text"
			role="combobox"
			aria-expanded="true"
			aria-controls="{id}-list"
			aria-autocomplete="list"
			aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
			aria-label={label}
			autocomplete="off"
			spellcheck="false"
			{placeholder}
			{onkeydown}
		/>
		<kbd>Esc</kbd>
	</div>

	<!-- One height whatever the matches, so the palette never jumps while typing. -->
	<div class="results" bind:this={results} {@attach scrollEdges} data-fade>
		<span class="highlight" aria-hidden="true" bind:this={highlight}></span>
		<div id="{id}-list" role="listbox" aria-label="Commands">
			{#each groups as [name, cs] (name)}
				<div role="group" aria-labelledby={name ? `${id}-g-${name}` : undefined}>
					{#if name}<div id="{id}-g-{name}" class="heading" aria-hidden="true">{name}</div>{/if}
					{#each cs as c (c.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							id={optionId(c)}
							role="option"
							tabindex="-1"
							aria-selected={flat[active] === c}
							class="option"
							onpointermove={() => {
								viaPointer = true;
								active = flat.indexOf(c);
							}}
							onpointerdown={(e) => e.preventDefault()}
							onclick={() => run(c)}
						>
							{#if c.icon}<span class="icon"><Icon icon={c.icon} size={18} /></span>{/if}
							<span class="label">{c.label}</span>
							{#if c.shortcut}
								<span class="keys" aria-hidden="true">
									{#each c.shortcut as k, i (i)}<kbd>{k}</kbd>{/each}
								</span>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
		{#if !flat.length}<p class="empty">{empty}</p>{/if}
	</div>
	<p role="status" class="sr-only">
		{query.trim() ? `${flat.length} ${flat.length === 1 ? 'result' : 'results'}` : ''}
	</p>
</dialog>

<style>
	/* Up high and quick: a command palette is used many times a day. */
	.palette {
		box-sizing: border-box;
		inline-size: min(36rem, 100vw - 2rem);
		max-block-size: min(28rem, 100dvh - 4rem);
		margin: 12vh auto auto;
		padding: 0;
		overflow: hidden;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.75);
		background: var(--ui-surface-overlay);
		color: var(--ui-fg);
		font: 0.9375rem/1.4 var(--ui-font);
		box-shadow: var(--ui-shadow-overlay);
	}
	.palette::backdrop {
		background: var(--ui-backdrop);
	}
	.palette,
	.palette::backdrop {
		opacity: 0;
		transition-property: opacity, scale, overlay, display;
		transition-duration: 180ms;
		transition-timing-function: var(--ui-ease-out);
		transition-behavior: allow-discrete;
	}
	.palette {
		scale: 0.97;
	}
	.palette[open],
	.palette[open]::backdrop {
		opacity: 1;
	}
	.palette[open] {
		scale: 1;
	}
	@starting-style {
		.palette[open],
		.palette[open]::backdrop {
			opacity: 0;
		}
		.palette[open] {
			scale: 0.97;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.palette,
		.palette[open] {
			scale: 1;
		}
	}
	.palette[open] {
		display: flex;
		flex-direction: column;
	}

	.search {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0 1rem;
		color: var(--ui-muted);
		box-shadow: 0 1px 0 var(--ui-line);
	}
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: 3.25rem;
		margin: 0;
		padding: 0;
		border: 0;
		outline: none;
		background: none;
		color: var(--ui-fg);
		font: inherit;
		font-size: max(1rem, 16px);
	}
	input::placeholder {
		color: var(--ui-muted);
		opacity: 1;
	}
	.results {
		position: relative;
		/* A fixed 20rem that may only shrink on short screens: never with the number of matches. */
		flex: 0 1 20rem;
		overflow: auto;
		overscroll-behavior: contain;
		padding: 0.375rem;
	}
	.heading {
		padding: 0.625rem 0.625rem 0.25rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 500;
	}
	.option {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-sizing: border-box;
		min-block-size: 2.5rem;
		padding: 0.375rem 0.625rem;
		border-radius: var(--ui-radius);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.option {
			min-block-size: 2.75rem;
		}
	}
	.icon {
		display: grid;
		color: var(--ui-muted);
	}
	.label {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.keys {
		display: flex;
		gap: 0.25rem;
	}
	kbd {
		display: inline-grid;
		place-items: center;
		min-inline-size: 1.375rem;
		block-size: 1.375rem;
		padding: 0 0.3rem;
		box-sizing: border-box;
		border-radius: calc(var(--ui-radius) * 0.6);
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font: 500 0.75rem/1 var(--ui-font);
	}
	/* One highlight glides between commands (see glide.ts). */
	.highlight {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}
	.empty {
		margin: 0;
		padding: 2.5rem 1rem;
		color: var(--ui-muted);
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
	@media (forced-colors: active) {
		.option[aria-selected='true'] {
			outline: 2px solid Highlight;
		}
	}
</style>
