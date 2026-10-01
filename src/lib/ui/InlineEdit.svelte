<script lang="ts">
	import { Cancel01Icon, Edit02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { tick } from 'svelte';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';

	interface Props {
		/** What the text is, e.g. "Title". Names the field for screen readers; shown unless hideLabel. */
		label: string;
		hideLabel?: boolean;
		value?: string;
		/** Shown, muted, when there's no value yet. */
		placeholder?: string;
		type?: 'text' | 'email' | 'url';
		required?: boolean;
		maxlength?: number;
		/** Return a message to keep the field open with it, or nothing when it's fine. */
		validate?: (value: string) => string | undefined;
		/** Save the new value. If it throws, the field stays open and says so. */
		onsave?: (value: string) => Promise<unknown> | unknown;
		class?: string;
	}

	let {
		label,
		hideLabel = false,
		value = $bindable(''),
		placeholder = 'Empty',
		type = 'text',
		required = false,
		maxlength,
		validate,
		onsave,
		class: className
	}: Props = $props();

	const id = $props.id();
	let editing = $state(false);
	let saving = $state(false);
	let saved = $state(false);
	let draft = $state('');
	let error = $state<string>();
	let input = $state<HTMLInputElement>();
	let view = $state<HTMLButtonElement>();
	let form = $state<HTMLFormElement>();
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(savedTimer));

	async function edit() {
		draft = value;
		error = undefined;
		editing = true;
		await tick();
		input?.focus();
		input?.select();
	}
	/** focusBack: false when focus already moved on (a click elsewhere), so it isn't pulled back. */
	async function close(focusBack = true) {
		editing = false;
		error = undefined;
		await tick();
		if (focusBack) view?.focus();
	}
	async function save(focusBack = true) {
		if (saving) return;
		const next = draft.trim();
		if (next === value) return close(focusBack);
		error =
			required && !next ? `Enter a ${label.toLowerCase()}.` : next ? validate?.(next) : undefined;
		if (error) return focusBack && input?.focus();
		saving = true;
		try {
			await onsave?.(next);
			value = next;
			saving = false;
			saved = true;
			clearTimeout(savedTimer);
			savedTimer = setTimeout(() => (saved = false), 1400);
			announce('Saved');
			await close(focusBack);
		} catch {
			saving = false;
			error = 'Couldn’t save. Try again.';
			if (focusBack) input?.focus();
		}
	}
</script>

<div class={['inline-edit', className]}>
	{#if !hideLabel}<span class="label" id="{id}-label">{label}</span>{/if}

	{#if editing}
		<!-- Enter saves, Escape puts it back; moving focus out saves too, unless it went to Cancel. -->
		<form
			bind:this={form}
			class="edit"
			novalidate
			onsubmit={(e) => {
				e.preventDefault();
				save();
			}}
			onfocusout={(e) => {
				const to = e.relatedTarget as Node | null;
				// Closing removes the field, which fires this too: only a real move away while editing saves.
				if (editing && !saving && !form?.contains(to)) save(false);
			}}
		>
			<input
				bind:this={input}
				bind:value={draft}
				{type}
				{maxlength}
				aria-label={label}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? `${id}-error` : undefined}
				readonly={saving}
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						e.stopPropagation();
						close();
					}
				}}
			/>
			<span class="actions">
				<Button type="submit" variant="ghost" size="sm" square aria-label="Save">
					{#if saving}<Spinner size={16} />{:else}<Icon icon={Tick02Icon} size={16} />{/if}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					square
					aria-label="Cancel"
					onpointerdown={(e: PointerEvent) => e.preventDefault()}
					onclick={() => close()}><Icon icon={Cancel01Icon} size={16} /></Button
				>
			</span>
		</form>
		{#if error}<p id="{id}-error" class="error">{error}</p>{/if}
	{:else}
		<button
			bind:this={view}
			type="button"
			class={['view', !value && 'empty']}
			title={value || undefined}
			aria-labelledby={hideLabel ? undefined : `${id}-label ${id}-text ${id}-hint`}
			aria-label={hideLabel ? `${label}: ${value || placeholder}, edit` : undefined}
			onclick={edit}
		>
			<span class="text" id="{id}-text">{value || placeholder}</span>
			<span class="sr" id="{id}-hint">, edit</span>
			<span class="pencil" aria-hidden="true">
				{#if saved}<span class="tick"><Icon icon={Tick02Icon} size={16} /></span>
				{:else}<Icon icon={Edit02Icon} size={16} />{/if}
			</span>
		</button>
	{/if}
</div>

<style>
	.inline-edit {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		inline-size: 100%;
		gap: 0.25rem;
		min-inline-size: 0;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.label {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
	}
	/* Text and field share one box (same padding, height and radius), so switching never shifts a line. */
	.view,
	.edit {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-block-size: 2.5rem;
		margin-inline: -0.625rem;
		border: 1px solid transparent;
		border-radius: var(--ui-radius-control);
	}
	.view {
		padding: 0 0.625rem;
		background: none;
		color: inherit;
		font: inherit;
		/* Same size as the field, which is 16px at least: iOS Safari zooms into anything smaller. */
		font-size: max(1rem, 16px);
		text-align: start;
		cursor: text;
		transition: background-color var(--ui-dur-press) ease;
	}
	.text {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty .text {
		color: var(--ui-muted);
	}
	.pencil {
		display: grid;
		flex: none;
		color: var(--ui-muted);
		opacity: 0;
		translate: -0.25rem 0;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur) var(--ui-ease-out);
	}
	@media (hover: hover) {
		.view:hover {
			background: var(--ui-subtle);
		}
		.view:hover .pencil {
			opacity: 1;
			translate: 0 0;
		}
	}
	.view:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.view:focus-visible .pencil,
	.pencil:has(.tick) {
		opacity: 1;
		translate: 0 0;
	}
	/* Touch has no hover: the pencil stays visible so the text reads as editable. */
	@media (hover: none) {
		.pencil {
			opacity: 1;
			translate: 0 0;
		}
	}
	.tick {
		display: grid;
		color: var(--ui-accent);
		animation: pop var(--ui-dur-spring) var(--ui-ease-spring);
	}
	@keyframes pop {
		from {
			scale: 0.5;
			opacity: 0;
		}
	}

	/* The field: its border fades in where the text was. */
	.edit {
		padding: 0 0.25rem 0 0.625rem;
		border-color: var(--ui-field-line);
		background: var(--ui-surface);
		transition:
			border-color var(--ui-dur) var(--ui-ease-out),
			background-color var(--ui-dur) var(--ui-ease-out);
	}
	@starting-style {
		.edit {
			border-color: transparent;
			background: transparent;
		}
	}
	.edit:focus-within {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.edit:has([aria-invalid='true']) {
		border-color: var(--ui-danger);
	}
	input {
		flex: 1;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		outline: none;
		background: none;
		color: inherit;
		font: inherit;
		font-size: max(1rem, 16px);
	}
	input[readonly] {
		color: var(--ui-muted);
	}
	/* Save and Cancel arrive a beat after the field, one after the other. */
	.actions {
		display: flex;
		flex: none;
		gap: 0.125rem;
	}
	.actions > :global(*) {
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			scale var(--ui-dur-spring) var(--ui-ease-spring);
	}
	.actions > :global(:nth-child(2)) {
		transition-delay: 40ms;
	}
	@starting-style {
		.actions > :global(*) {
			opacity: 0;
			scale: 0.8;
		}
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.error {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.8125rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.pencil,
		.actions > :global(*) {
			translate: 0 0;
			scale: 1;
		}
		.tick {
			animation: none;
		}
	}
</style>
