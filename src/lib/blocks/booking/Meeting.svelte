<script lang="ts">
	import {
		getLocalTimeZone,
		now,
		parseAbsolute,
		today,
		type CalendarDate
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import { Calendar03Icon } from '@hugeicons/core-free-icons';
	import Avatar from '../../ui/Avatar.svelte';
	import Button from '../../ui/Button.svelte';
	import Calendar from '../../ui/Calendar.svelte';
	import Icon from '../../ui/Icon.svelte';
	import Input from '../../ui/Input.svelte';
	import Segmented from '../../ui/Segmented.svelte';
	import Select from '../../ui/Select.svelte';
	import Textarea from '../../ui/Textarea.svelte';
	import BookingFlow from './BookingFlow.svelte';
	import SlotPicker from './SlotPicker.svelte';
	import {
		download,
		fullyBooked,
		ics,
		later,
		nextDay,
		startTimes,
		taken,
		type Hours
	} from './booking';

	interface Props {
		/** What's being booked ("Reading-room tour"). */
		title: string;
		host: { name: string; role: string };
		/** When the host takes meetings, in the host's own time zone. */
		hours: Hours;
		location: string;
		/** Lengths on offer, in minutes. */
		lengths?: number[];
	}

	let { title, host, hours, location, lengths = [15, 30, 60] }: Props = $props();

	// The visitor's zone is only known in the browser; until then, the host's.
	// svelte-ignore state_referenced_locally
	let zone = $state(hours.timeZone);
	// svelte-ignore state_referenced_locally
	let length = $state(String(lengths[1] ?? lengths[0]));
	let date = $state<CalendarDate>();
	let slot = $state<string>();
	let name = $state('');
	let email = $state('');
	let notes = $state('');
	let errors = $state<{ slot?: string; name?: string; email?: string }>({});
	const zones = Intl.supportedValuesOf('timeZone');

	const opens = (d: CalendarDate) => startTimes(d, zone, hours, +length).length > 0;
	const free = (d: CalendarDate) => opens(d) && !fullyBooked(d);
	const day = (d: CalendarDate) =>
		new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(
			d.toDate(zone)
		);
	const when = $derived(
		slot
			? new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'short',
					timeZone: zone
				}).format(new Date(slot))
			: undefined
	);

	onMount(() => {
		zone = getLocalTimeZone();
		const t = today(zone);
		date = free(t) ? t : nextDay(t, free);
	});

	const load = $derived.by(() => {
		const [d, z, m] = [date, zone, +length];
		return () =>
			later(() =>
				!d || fullyBooked(d)
					? []
					: startTimes(d, z, hours, m)
							.filter((t) => t.compare(now(z).add({ hours: 1 })) > 0)
							.map((t) => ({
								id: t.toAbsoluteString(),
								label: new Intl.DateTimeFormat('en-US', {
									hour: 'numeric',
									minute: '2-digit',
									timeZone: z
								}).format(t.toDate())
							}))
							.filter((s) => !taken(s.id, String(m)))
			);
	});
	const following = $derived(date && nextDay(date, free));

	function check(step: number) {
		errors =
			step === 0
				? { slot: slot ? undefined : 'Pick a time to continue.' }
				: {
						name: name.trim() ? undefined : 'Enter your name.',
						email: /^\S+@\S+\.\S+$/.test(email)
							? undefined
							: 'Enter an email address like you@example.com.'
					};
		return !Object.values(errors).some(Boolean);
	}

	function addToCalendar() {
		if (!slot) return;
		download(
			'booking.ics',
			ics({
				title: `${title} with ${host.name}`,
				start: parseAbsolute(slot, zone),
				minutes: +length,
				location,
				description: notes
			})
		);
	}
</script>

<BookingFlow
	label="Book a {title.toLowerCase()}"
	steps={['Pick a time', 'Your details']}
	details={[
		['Name', name],
		['Email', email],
		['To prepare', notes]
	]}
	{check}
	submit={() => later(() => undefined, 900)}
	submitLabel="Book it"
>
	{#snippet body(step)}
		{#if step === 0}
			<Segmented
				label="How long"
				options={lengths.map((m) => ({ value: String(m), label: `${m} min` }))}
				bind:value={length}
			/>
			<div class="pick">
				<Calendar
					label="Day"
					bind:value={date}
					min={today(zone)}
					isUnavailable={(d) => !opens(d)}
				/>
				<div class="times">
					<Select label="Time zone" bind:value={zone}>
						{#each zones as z (z)}<option value={z}>{z.replaceAll('_', ' ')}</option>{/each}
					</Select>
					{#if date}
						<SlotPicker
							legend={day(date)}
							{load}
							bind:value={slot}
							error={errors.slot}
							next={following && {
								label: day(following),
								go: () => (date = following)
							}}
						/>
					{:else}
						<p class="hint">Pick a day to see its times.</p>
					{/if}
				</div>
			</div>
		{:else}
			<div class="booking-fields">
				<Input label="Name" bind:value={name} autocomplete="name" error={errors.name} />
				<Input
					label="Email"
					type="email"
					bind:value={email}
					autocomplete="email"
					hint="The confirmation and any changes go here."
					error={errors.email}
				/>
				<Textarea label="Anything to prepare? (optional)" bind:value={notes} rows={3} />
			</div>
		{/if}
	{/snippet}

	{#snippet summary()}
		<div class="host">
			<Avatar name={host.name} />
			<span><strong>{host.name}</strong><br /><span class="muted">{host.role}</span></span>
		</div>
		<dl class="booking-facts">
			<div>
				<dt>What</dt>
				<dd>{title}</dd>
			</div>
			<div>
				<dt>How long</dt>
				<dd>{length} min</dd>
			</div>
			<div>
				<dt>Where</dt>
				<dd>{location}</dd>
			</div>
		</dl>
		<p class="muted">{when ?? 'No time chosen yet.'}</p>
	{/snippet}

	{#snippet done(restart)}
		<h3 class="title">You’re booked</h3>
		<p>
			{title} with {host.name}, {when}. A confirmation is on its way to <strong>{email}</strong>.
		</p>
		<div class="row">
			<Button variant="secondary" onclick={addToCalendar}>
				<Icon icon={Calendar03Icon} /> Add to calendar
			</Button>
			<Button
				variant="ghost"
				onclick={() => {
					slot = undefined;
					restart();
				}}>Book another time</Button
			>
		</div>
	{/snippet}
</BookingFlow>

<style>
	.pick {
		display: grid;
		gap: 1.25rem;
		align-items: start;
	}
	@container (min-width: 40rem) {
		.pick {
			grid-template-columns: auto minmax(0, 1fr);
		}
	}
	.times {
		display: grid;
		gap: 1rem;
		min-inline-size: 0;
	}
	.hint,
	.muted {
		margin: 0;
		color: var(--ui-muted);
	}
	.host {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.title {
		margin: 0;
		font-size: 1.25rem;
	}
	p {
		margin: 0;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
