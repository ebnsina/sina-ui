<script lang="ts">
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		isSameDay,
		today
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { onDay, type CalendarDef, type CalendarEvent } from './events';

	// Where seven time columns are too thin to read: each day, then its events in order, full width.
	interface Props {
		days: CalendarDate[];
		events: CalendarEvent[];
		calendars: CalendarDef[];
		locale: string;
		onopen: (e: CalendarEvent) => void;
	}

	let { days, events, calendars, locale, onopen }: Props = $props();

	const calOf = (e: CalendarEvent) => calendars.find((c) => c.id === e.calendar);
	const utc = (opts: Intl.DateTimeFormatOptions) =>
		new DateFormatter(locale, { ...opts, timeZone: 'UTC' });
	const dayName = $derived(utc({ weekday: 'long', month: 'long', day: 'numeric' }));
	const time = $derived(utc({ hour: 'numeric', minute: '2-digit' }));

	let mounted = $state(false);
	onMount(() => (mounted = true));
	const todayDate = $derived(mounted ? today(getLocalTimeZone()) : undefined);

	const dayEvents = (day: CalendarDate) =>
		events
			.filter((e) => onDay(e, day))
			.sort((a, b) => Number(!a.allDay) - Number(!b.allDay) || a.start.compare(b.start));
</script>

<div class="agenda">
	{#each days as day (day.toString())}
		{@const list = dayEvents(day)}
		<section class="day" aria-label={dayName.format(day.toDate('UTC'))}>
			<h3 class={[todayDate && isSameDay(day, todayDate) && 'today']}>
				{dayName.format(day.toDate('UTC'))}
			</h3>
			{#if list.length}
				<ul>
					{#each list as e (e.id)}
						<li>
							<button
								type="button"
								class="event"
								style:--c={calOf(e)?.color}
								onclick={() => onopen(e)}
							>
								<span class="when">
									{#if e.allDay}All day{:else}{time.formatRange(
											e.start.toDate('UTC'),
											e.end.toDate('UTC')
										)}{/if}
								</span>
								<span class="title">
									{#if calOf(e)?.icon}<Icon icon={calOf(e)!.icon!} size={14} />{/if}
									{e.title}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="none">Nothing planned</p>
			{/if}
		</section>
	{/each}
</div>

<style>
	.agenda {
		display: grid;
		align-content: start;
		gap: 1rem;
		min-block-size: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.day {
		display: grid;
		gap: 0.375rem;
	}
	h3 {
		margin: 0;
		color: var(--ui-muted);
		font: 600 0.8125rem/1.3 var(--ui-font);
	}
	h3.today {
		color: var(--ui-accent);
	}
	ul {
		display: grid;
		gap: 0.375rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	/* A tinted row with its calendar's colour down the leading edge. */
	.event {
		display: grid;
		gap: 0.125rem;
		inline-size: 100%;
		min-block-size: 2.75rem;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-inline-start: 3px solid var(--c);
		border-radius: calc(var(--ui-radius) - 2px);
		background: color-mix(in srgb, var(--c) 10%, transparent);
		color: var(--ui-fg);
		font: inherit;
		text-align: start;
		cursor: pointer;
		touch-action: manipulation;
	}
	.event:active {
		background: color-mix(in srgb, var(--c) 18%, transparent);
	}
	.event:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.when {
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}
	.title {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-weight: 500;
	}
	.title :global(svg) {
		flex: none;
		color: var(--c);
	}
	.none {
		margin: 0;
		color: var(--ui-muted);
	}
	@media (hover: hover) and (pointer: fine) {
		.event:hover {
			background: color-mix(in srgb, var(--c) 16%, transparent);
		}
	}
</style>
