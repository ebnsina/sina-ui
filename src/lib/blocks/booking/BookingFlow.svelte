<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { announce } from '../../ui/announce';
	import Alert from '../../ui/Alert.svelte';
	import Button from '../../ui/Button.svelte';
	import Stepper from '../../ui/Stepper.svelte';
	import { ms } from '../../ui/motion';

	interface Props {
		/** Names the whole flow ("Book a tour"). */
		label: string;
		/** Each step's name; it's also the step's heading. */
		steps: string[];
		step?: number;
		/** The current step's fields. Choices live in the caller, so going back keeps them. */
		body: Snippet<[number]>;
		/** What's chosen so far, beside the steps (below them on narrow screens). */
		summary?: Snippet;
		/** What the person entered, as [label, value]; with it, a Review step comes last. Empty values are left out. */
		details?: [string, string][];
		/** Checks a step before moving on: set field errors and return false to stay. */
		check?: (step: number) => boolean;
		/** Books it, from the last step. Throw to say it didn't go through. */
		submit: () => Promise<void>;
		submitLabel?: string;
		/** Shown once booked; given a function that starts over. */
		done: Snippet<[() => void]>;
	}

	let {
		label,
		steps,
		step = $bindable(0),
		body,
		summary,
		details,
		check,
		submit,
		submitLabel = 'Book',
		done
	}: Props = $props();

	let finished = $state(false);
	let sending = $state(false);
	let failure = $state('');
	let dir = $state(1);
	let form: HTMLFormElement;
	// Focus follows the step only after someone moves; never on page load.
	let moved = false;
	const all = $derived(details ? [...steps, 'Review'] : steps);
	const last = $derived(all.length - 1);
	const reviewing = $derived(!!details && step === last);

	const focusOnMount = (el: HTMLElement) => {
		if (moved) el.focus();
	};

	function go(to: number) {
		dir = to > step ? 1 : -1;
		moved = true;
		failure = '';
		step = to;
	}

	async function next() {
		failure = '';
		if (check && !check(step)) {
			await tick();
			const invalid = form.querySelector<HTMLElement>(
				'[aria-invalid="true"], [data-invalid] input:not(:disabled)'
			);
			if (invalid) invalid.focus();
			else announce(form.querySelector('.booking-error')?.textContent ?? 'Check this step.');
			return;
		}
		if (step < last) return go(step + 1);
		sending = true;
		try {
			await submit();
			dir = 1;
			moved = true;
			finished = true;
		} catch {
			failure = 'Nothing has been booked yet. Try again in a moment.';
		} finally {
			sending = false;
		}
	}

	function restart() {
		finished = false;
		go(0);
	}
</script>

{#snippet facts()}
	<dl class="booking-facts">
		{#each (details ?? []).filter(([, v]) => v.trim()) as [term, value] (term)}
			<div>
				<dt>{term}</dt>
				<dd>{value}</dd>
			</div>
		{/each}
	</dl>
{/snippet}

{#snippet section(title: string, to: number, content?: Snippet)}
	<section class="section" aria-label={title}>
		<div class="section-head">
			<h4>{title}</h4>
			<Button variant="ghost" size="sm" onclick={() => go(to)}>
				Change<span class="booking-sr"> {title.toLowerCase()}</span>
			</Button>
		</div>
		{@render content?.()}
	</section>
{/snippet}

<form
	bind:this={form}
	class="flow"
	aria-label={label}
	novalidate
	onsubmit={(e) => {
		e.preventDefault();
		if (!sending) next();
	}}
>
	{#if !finished}
		<Stepper
			steps={all.map((s) => ({ label: s }))}
			current={step}
			onstep={go}
			label="{label}: steps"
		/>
	{/if}

	<div class={['cols', summary && !finished && !reviewing && 'with-summary']}>
		<!-- Outgoing and incoming steps share one cell, so they cross without the page jumping. -->
		<div class="stage">
			{#key finished ? -1 : step}
				<div
					class="pane"
					in:fly={{ x: 24 * dir, duration: ms(240), delay: ms(90), easing: cubicOut }}
					out:fly={{ x: -24 * dir, duration: ms(130), easing: cubicOut }}
				>
					{#if finished}
						<div class="done" tabindex="-1" {@attach focusOnMount}>{@render done(restart)}</div>
					{:else}
						<h3 class="heading" tabindex="-1" {@attach focusOnMount}>{all[step]}</h3>
						{#if reviewing}
							<div class="review">
								{@render section('Your booking', 0, summary)}
								{@render section('Your details', steps.length - 1, facts)}
							</div>
						{:else}
							{@render body(step)}
						{/if}
					{/if}
				</div>
			{/key}
		</div>
		{#if summary && !finished && !reviewing}<aside
				class="summary"
				aria-label="{label}: your choices"
			>
				{@render summary()}
			</aside>{/if}
	</div>

	{#if !finished}
		{#if failure}
			<Alert tone="danger" title="That didn’t go through" live>{failure}</Alert>
		{/if}
		<div class="actions">
			{#if step > 0}
				<Button variant="ghost" onclick={() => go(step - 1)}>Back</Button>
			{/if}
			<Button type="submit" loading={sending}>{step === last ? submitLabel : 'Continue'}</Button>
		</div>
	{/if}
</form>

<style>
	.flow {
		container-type: inline-size;
		display: grid;
		gap: 1.5rem;
		inline-size: 100%;
		max-inline-size: 48rem;
		margin-inline: auto;
		padding: 1.25rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		box-sizing: border-box;
		color: var(--ui-fg);
		font: 0.875rem/1.5 var(--ui-font);
	}
	.cols {
		display: grid;
		gap: 1.5rem;
		min-inline-size: 0;
	}
	@container (min-width: 46rem) {
		.cols.with-summary {
			grid-template-columns: minmax(0, 1fr) 15rem;
			align-items: start;
		}
	}
	.stage {
		display: grid;
		min-inline-size: 0;
	}
	.pane {
		grid-area: 1 / 1;
		display: grid;
		align-content: start;
		gap: 1.25rem;
		min-inline-size: 0;
	}
	.heading {
		margin: 0;
		font-size: 1.0625rem;
		font-weight: 600;
		line-height: 1.3;
	}
	.heading:focus,
	.done:focus {
		outline: none;
	}
	.done {
		display: grid;
		gap: 1rem;
		justify-items: start;
	}
	.review {
		display: grid;
		gap: 0.75rem;
	}
	.section {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-block: -0.25rem;
	}
	.section h4 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.summary {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	/* Shared by every variant's fields, so field errors read the same everywhere. */
	.flow :global(.booking-error) {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.8125rem;
	}
	.flow :global(.booking-fields) {
		display: grid;
		gap: 1rem;
	}
	.flow :global(.booking-sr) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.flow :global(dl.booking-facts) {
		display: grid;
		gap: 0.5rem;
		margin: 0;
	}
	.flow :global(.booking-facts div) {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.flow :global(.booking-facts dt) {
		color: var(--ui-muted);
	}
	.flow :global(.booking-facts dd) {
		margin: 0;
		font-weight: 500;
		text-align: end;
		font-variant-numeric: tabular-nums;
	}
</style>
