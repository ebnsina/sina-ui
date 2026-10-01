<script lang="ts">
	import { getLocalTimeZone, now, today, type CalendarDate } from '@internationalized/date';
	import { onMount } from 'svelte';
	import Button from '../../ui/Button.svelte';
	import DatePicker from '../../ui/DatePicker.svelte';
	import Input from '../../ui/Input.svelte';
	import NumberField from '../../ui/NumberField.svelte';
	import RadioCards from '../../ui/RadioCards.svelte';
	import Textarea from '../../ui/Textarea.svelte';
	import BookingFlow from './BookingFlow.svelte';
	import SlotPicker from './SlotPicker.svelte';
	import { fullyBooked, later, nextDay, reference, startTimes, taken, type Hours } from './booking';

	interface Props {
		/** The restaurant ("Bab Touma kitchen"). */
		name: string;
		/** When tables can be booked, in the restaurant's time zone; the last seating is 90 minutes before close. */
		hours: Hours;
		/** Where people can sit, with how many each area seats at one table. */
		areas: { value: string; label: string; description: string; seats: number }[];
		/** Larger parties are asked to call. */
		maxParty?: number;
		phone: string;
	}

	let { name, hours, areas, maxParty = 8, phone }: Props = $props();

	let party = $state(2);
	let date = $state<CalendarDate>();
	let slot = $state<string>();
	// svelte-ignore state_referenced_locally
	let area = $state<string | undefined>(areas[0]?.value);
	let guest = $state('');
	let tel = $state('');
	let requests = $state('');
	let code = $state('');
	let errors = $state<{
		date?: string;
		slot?: string;
		area?: string;
		guest?: string;
		tel?: string;
	}>({});

	// Times are the restaurant's own: someone booking from abroad still sees local dinner times.
	const z = $derived(hours.timeZone);
	const opens = (d: CalendarDate) => startTimes(d, z, hours, 30, 90).length > 0;
	const free = (d: CalendarDate) => opens(d) && !fullyBooked(d);
	const day = (d: CalendarDate) =>
		new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(
			d.toDate(z)
		);
	const time = (iso: string) =>
		new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: z }).format(
			new Date(iso)
		);

	onMount(() => {
		const t = today(getLocalTimeZone());
		date = free(t) ? t : nextDay(t, free);
	});

	const load = $derived.by(() => {
		const [d, n] = [date, party];
		return () =>
			later(() =>
				!d
					? []
					: startTimes(d, z, hours, 30, 90)
							.filter((t) => t.compare(now(z)) > 0)
							.map((t) => {
								const id = t.toAbsoluteString();
								// Bigger tables run out first.
								return {
									id,
									label: time(id),
									taken: fullyBooked(d) || taken(id, n > 4 ? 'big' : '')
								};
							})
			);
	});
	const following = $derived(date && nextDay(date, free));
	const options = $derived(
		areas.map((a) => ({
			...a,
			disabled: a.seats < party,
			reason: a.seats < party ? `Tables here seat up to ${a.seats}` : undefined
		}))
	);
	$effect(() => {
		if (options.find((o) => o.value === area)?.disabled)
			area = options.find((o) => !o.disabled)?.value;
	});

	function check(step: number) {
		errors =
			step === 0
				? {
						date: date ? undefined : 'Choose a day.',
						slot: slot ? undefined : 'Choose a time to continue.',
						area: area ? undefined : 'Choose where you’d like to sit.'
					}
				: {
						guest: guest.trim() ? undefined : 'Enter the name for the table.',
						tel:
							tel.replace(/\D/g, '').length >= 7
								? undefined
								: 'Enter a phone number we can call if plans change.'
					};
		return !Object.values(errors).some(Boolean);
	}
</script>

<BookingFlow
	label="Book a table at {name}"
	steps={['Table', 'Your details']}
	details={[
		['Name', guest],
		['Phone', tel],
		['Requests', requests]
	]}
	{check}
	submit={() => later(() => void (code = reference()), 900)}
	submitLabel="Book the table"
>
	{#snippet body(step)}
		{#if step === 0}
			<div class="booking-fields">
				<div class="row">
					<NumberField
						label="Guests"
						bind:value={party}
						min={1}
						max={maxParty}
						hint="More than {maxParty}? Call {phone}."
					/>
					<DatePicker
						label="Day"
						bind:value={date}
						min={today(getLocalTimeZone())}
						isUnavailable={(d) => !opens(d)}
						error={errors.date}
					/>
				</div>
				{#if date}
					<SlotPicker
						legend="Times on {day(date)}"
						{load}
						bind:value={slot}
						error={errors.slot}
						next={following && { label: day(following), go: () => (date = following) }}
					/>
				{/if}
				<RadioCards legend="Where to sit" {options} bind:value={area} error={errors.area} />
			</div>
		{:else}
			<div class="booking-fields">
				<Input
					label="Name for the table"
					bind:value={guest}
					autocomplete="name"
					error={errors.guest}
				/>
				<Input
					label="Phone"
					type="tel"
					bind:value={tel}
					autocomplete="tel"
					hint="Only to reach you if something changes."
					error={errors.tel}
				/>
				<Textarea
					label="Anything we should know? (optional)"
					bind:value={requests}
					rows={3}
					placeholder="Allergies, a birthday, a high chair…"
				/>
			</div>
		{/if}
	{/snippet}

	{#snippet done(restart)}
		<h3 class="title">Your table is booked</h3>
		<p>
			{party}
			{party === 1 ? 'guest' : 'guests'}, {areas
				.find((a) => a.value === area)
				?.label.toLowerCase()},
			{date && day(date)} at {slot && time(slot)}. Reference <strong class="code">{code}</strong>.
		</p>
		<p class="muted">We hold the table for 15 minutes. Running late? Call {phone}.</p>
		<Button
			variant="secondary"
			onclick={() => {
				slot = undefined;
				restart();
			}}>Book another table</Button
		>
	{/snippet}
</BookingFlow>

<style>
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 1rem;
		align-items: start;
	}
	p {
		margin: 0;
	}
	.muted {
		color: var(--ui-muted);
	}
	.title {
		margin: 0;
		font-size: 1.25rem;
	}
	.code {
		font-family: var(--ui-font-mono);
		letter-spacing: 0.05em;
	}
</style>
