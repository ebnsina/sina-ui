<script lang="ts">
	import Alert from '../../ui/Alert.svelte';
	import Button from '../../ui/Button.svelte';
	import { scrollEdges } from '../../ui/scroll-edges';
	import type { Slot } from './booking';

	interface Props {
		legend: string;
		/** Fetches the times; called again whenever it changes (a new day, zone or length). */
		load: () => Promise<Slot[]>;
		/** The chosen slot's id. */
		value?: string;
		/** Offered when a day has nothing left: jumps to the next day that does. */
		next?: { label: string; go: () => void };
		error?: string;
	}

	let { legend, load, value = $bindable(), next, error }: Props = $props();

	const id = $props.id();
	let slots = $state<Slot[]>();
	let failed = $state(false);
	let attempt = $state(0);

	$effect(() => {
		void attempt;
		let live = true;
		slots = undefined;
		failed = false;
		load().then(
			(s) => {
				if (!live) return;
				slots = s;
				// A choice from another day or zone doesn't carry over.
				if (!s.some((x) => x.id === value && !x.taken)) value = undefined;
			},
			() => live && (failed = true)
		);
		return () => (live = false);
	});

	const open = $derived(slots?.filter((s) => !s.taken).length ?? 0);
</script>

<fieldset
	class="slots"
	aria-describedby={error ? `${id}-error` : undefined}
	data-invalid={error ? '' : undefined}
>
	<legend>{legend}</legend>
	<!-- One live region that stays put, so each change is heard. -->
	<p class="booking-sr" role="status">
		{failed
			? ''
			: !slots
				? 'Loading times'
				: open
					? `${open} times available`
					: 'Nothing left this day'}
	</p>
	{#if failed}
		<Alert tone="danger" title="Times didn’t load">
			Check your connection and try again.
			{#snippet actions()}
				<Button size="sm" variant="secondary" onclick={() => attempt++}>Try again</Button>
			{/snippet}
		</Alert>
	{:else if !slots}
		<div class="grid" aria-hidden="true">
			{#each { length: 6 }, i (i)}<span class="slot ghost"></span>{/each}
		</div>
	{:else if !open}
		<div class="empty">
			<p>Nothing left this day.</p>
			{#if next}
				<Button size="sm" variant="secondary" onclick={next.go}>Next available: {next.label}</Button
				>
			{/if}
		</div>
	{:else}
		<div class="grid" {@attach scrollEdges} data-fade>
			{#each slots as s (s.id)}
				<label class={['slot', s.taken && 'taken']}>
					<input type="radio" name={id} value={s.id} bind:group={value} disabled={s.taken} />
					<span>{s.label}</span>
					{#if s.taken}<span class="booking-sr">, booked</span>{/if}
				</label>
			{/each}
		</div>
	{/if}
	{#if error}<p id="{id}-error" class="booking-error">{error}</p>{/if}
</fieldset>

<style>
	.slots {
		display: grid;
		gap: 0.75rem;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-block-end: 0.75rem;
		padding: 0;
		font-weight: 500;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
		gap: 0.5rem;
		max-block-size: 15rem;
		overflow: auto;
		scrollbar-width: none;
	}
	.slot {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 2.5rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--ui-dur) var(--ui-ease-out),
			color var(--ui-dur) var(--ui-ease-out),
			scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.slot:hover {
		background: var(--ui-hover);
	}
	.slot:active:not(.taken) {
		scale: 0.97;
	}
	.slot:has(input:checked) {
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.slot:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 2px;
	}
	.slot.taken {
		color: var(--ui-muted);
		text-decoration: line-through;
		cursor: not-allowed;
	}
	.slot.taken:hover {
		background: var(--ui-subtle);
	}
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}
	.ghost {
		animation: pulse 1.2s ease-in-out infinite alternate;
	}
	@keyframes pulse {
		to {
			opacity: 0.5;
		}
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.empty p {
		margin: 0;
		color: var(--ui-muted);
	}
	@media (prefers-reduced-motion: reduce) {
		.slot,
		.ghost {
			transition: none;
			animation: none;
		}
	}
</style>
