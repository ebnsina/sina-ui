<script lang="ts">
	import { getLocalTimeZone, now, today, type CalendarDate } from '@internationalized/date';
	import { onMount } from 'svelte';
	import Button from '../../ui/Button.svelte';
	import Calendar from '../../ui/Calendar.svelte';
	import Input from '../../ui/Input.svelte';
	import RadioCards from '../../ui/RadioCards.svelte';
	import BookingFlow from './BookingFlow.svelte';
	import SlotPicker from './SlotPicker.svelte';
	import { fullyBooked, later, nextDay, reference, startTimes, taken, type Hours } from './booking';

	interface Service {
		id: string;
		name: string;
		description: string;
		minutes: number;
		/** In cents. */
		price: number;
	}

	interface Props {
		/** The place ("The bimaristan of al-Nuri"). */
		place: string;
		hours: Hours;
		services: Service[];
		/** The people who see clients; "Anyone available" is offered first. */
		providers: { id: string; name: string; role: string }[];
		currency?: string;
	}

	let { place, hours, services, providers, currency = 'USD' }: Props = $props();

	const ANYONE = 'anyone';
	let service = $state<string>();
	let provider = $state(ANYONE);
	let date = $state<CalendarDate>();
	let slot = $state<string>();
	let guest = $state('');
	let email = $state('');
	let code = $state('');
	let errors = $state<{ service?: string; slot?: string; guest?: string; email?: string }>({});

	const money = $derived(
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			trailingZeroDisplay: 'stripIfInteger'
		})
	);
	const z = $derived(hours.timeZone);
	const chosen = $derived(services.find((s) => s.id === service));
	const who = $derived(providers.find((p) => p.id === provider));
	const length = $derived(chosen?.minutes ?? 30);
	const opens = (d: CalendarDate) => startTimes(d, z, hours, 30, length).length > 0;
	const free = (d: CalendarDate) => opens(d) && !fullyBooked(d);
	const day = (d: CalendarDate) =>
		new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(
			d.toDate(z)
		);
	const time = (iso: string) =>
		new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: z }).format(
			new Date(iso)
		);
	// Free with one person, or with anyone who is.
	const busy = (id: string, p: string) =>
		p === ANYONE ? providers.every((x) => taken(id, x.id)) : taken(id, p);

	onMount(() => {
		const t = today(getLocalTimeZone());
		date = free(t) ? t : nextDay(t, free);
	});

	const load = $derived.by(() => {
		const [d, p, m] = [date, provider, length];
		return () =>
			later(() =>
				!d || fullyBooked(d)
					? []
					: startTimes(d, z, hours, 30, m)
							.filter((t) => t.compare(now(z)) > 0)
							.map((t) => ({ id: t.toAbsoluteString(), label: time(t.toAbsoluteString()) }))
							.filter((s) => !busy(s.id, p))
			);
	});
	const following = $derived(date && nextDay(date, free));

	function check(step: number) {
		if (step === 0) errors = { service: service ? undefined : 'Choose what you’re coming in for.' };
		else if (step === 2) errors = { slot: slot ? undefined : 'Choose a time to continue.' };
		else if (step === 3)
			errors = {
				guest: guest.trim() ? undefined : 'Enter your name.',
				email: /^\S+@\S+\.\S+$/.test(email)
					? undefined
					: 'Enter an email address like you@example.com.'
			};
		return !Object.values(errors).some(Boolean);
	}

	// "Anyone available" is settled when it's booked: the first person free at that time.
	const assigned = $derived(who ?? (slot ? providers.find((p) => !taken(slot!, p.id)) : undefined));
</script>

<BookingFlow
	label="Book at {place}"
	steps={['Service', 'With whom', 'Time', 'Your details']}
	details={[
		['Name', guest],
		['Email', email]
	]}
	{check}
	submit={() => later(() => void (code = reference()), 900)}
	submitLabel="Book appointment"
>
	{#snippet body(step)}
		{#if step === 0}
			<RadioCards
				legend="What are you coming in for?"
				layout="list"
				options={services.map((s) => ({
					value: s.id,
					label: s.name,
					description: `${s.description} ${s.minutes} min.`,
					detail: money.format(s.price / 100)
				}))}
				bind:value={service}
				error={errors.service}
			/>
		{:else if step === 1}
			<RadioCards
				legend="Who would you like to see?"
				options={[
					{
						value: ANYONE,
						label: 'Anyone available',
						description: 'The most times to choose from.'
					},
					...providers.map((p) => ({ value: p.id, label: p.name, description: p.role }))
				]}
				bind:value={provider}
			/>
		{:else if step === 2}
			<div class="pick">
				<Calendar
					label="Day"
					bind:value={date}
					min={today(getLocalTimeZone())}
					isUnavailable={(d) => !opens(d)}
				/>
				{#if date}
					<SlotPicker
						legend={day(date)}
						{load}
						bind:value={slot}
						error={errors.slot}
						next={following && { label: day(following), go: () => (date = following) }}
					/>
				{/if}
			</div>
		{:else}
			<div class="booking-fields">
				<Input label="Name" bind:value={guest} autocomplete="name" error={errors.guest} />
				<Input
					label="Email"
					type="email"
					bind:value={email}
					autocomplete="email"
					hint="For the confirmation and a reminder the day before."
					error={errors.email}
				/>
			</div>
		{/if}
	{/snippet}

	{#snippet summary()}
		<strong>{place}</strong>
		<dl class="booking-facts">
			<div>
				<dt>Service</dt>
				<dd>{chosen?.name ?? 'Not chosen'}</dd>
			</div>
			<div>
				<dt>With</dt>
				<dd>{who?.name ?? 'Anyone available'}</dd>
			</div>
			<div>
				<dt>When</dt>
				<dd>{slot && date ? `${day(date)}, ${time(slot)}` : 'Not chosen'}</dd>
			</div>
			{#if chosen}
				<div>
					<dt>Length</dt>
					<dd>{chosen.minutes} min</dd>
				</div>
				<div>
					<dt>Price</dt>
					<dd>{money.format(chosen.price / 100)}</dd>
				</div>
			{/if}
		</dl>
	{/snippet}

	{#snippet done(restart)}
		<h3 class="title">You’re booked in</h3>
		<p>
			{chosen?.name} with {assigned?.name}, {date && day(date)} at {slot && time(slot)}. Reference
			<strong class="code">{code}</strong>.
		</p>
		<p class="muted">Need to change it? Reply to the confirmation sent to {email}.</p>
		<Button
			variant="secondary"
			onclick={() => {
				slot = undefined;
				service = undefined;
				restart();
			}}>Book another</Button
		>
	{/snippet}
</BookingFlow>

<style>
	.pick {
		display: grid;
		gap: 1.25rem;
		align-items: start;
	}
	@container (min-width: 36rem) {
		.pick {
			grid-template-columns: auto minmax(0, 1fr);
		}
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
