<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import Alert from '../../ui/Alert.svelte';
	import Button from '../../ui/Button.svelte';
	import type { DateRange } from '../../ui/Calendar.svelte';
	import DateRangePicker from '../../ui/DateRangePicker.svelte';
	import Input from '../../ui/Input.svelte';
	import NumberField from '../../ui/NumberField.svelte';
	import RadioCards from '../../ui/RadioCards.svelte';
	import Skeleton from '../../ui/Skeleton.svelte';
	import Textarea from '../../ui/Textarea.svelte';
	import BookingFlow from './BookingFlow.svelte';
	import { later, reference, roomsLeft, stayPrice } from './booking';

	interface Room {
		id: string;
		name: string;
		description: string;
		/** A night's price, in cents. */
		rate: number;
		sleeps: number;
	}

	interface Props {
		/** The place ("Dar al-Zahra guesthouse"). */
		name: string;
		rooms: Room[];
		/** 0.12 is 12%. */
		taxRate: number;
		currency?: string;
	}

	let { name, rooms, taxRate, currency = 'USD' }: Props = $props();

	let range = $state<DateRange>();
	let adults = $state(2);
	let children = $state(0);
	let room = $state<string>();
	let guest = $state('');
	let email = $state('');
	let requests = $state('');
	let code = $state('');
	let left = $state<Record<string, number>>();
	let failed = $state(false);
	let attempt = $state(0);
	let errors = $state<{ range?: string; room?: string; guest?: string; email?: string }>({});

	const money = $derived(
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			trailingZeroDisplay: 'stripIfInteger'
		})
	);
	const cents = (n: number) => money.format(n / 100);
	const days = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
	const chosen = $derived(rooms.find((r) => r.id === room));
	const price = $derived(
		range && chosen && stayPrice(range.start, range.end, chosen.rate, taxRate)
	);
	const nights = $derived(range ? stayPrice(range.start, range.end, 0, 0).nights : 0);
	const dates = $derived(
		range &&
			`${days.format(range.start.toDate(getLocalTimeZone()))} – ${days.format(range.end.toDate(getLocalTimeZone()))}`
	);

	// What's free depends on the dates: asked again whenever they change.
	$effect(() => {
		void attempt;
		const r = range;
		let live = true;
		left = undefined;
		failed = false;
		if (!r) return;
		later(() =>
			Object.fromEntries(rooms.map((x) => [x.id, roomsLeft(x.id, r.start.toString())]))
		).then(
			(l) => {
				if (!live) return;
				left = l;
				if (room && !l[room]) room = undefined;
			},
			() => live && (failed = true)
		);
		return () => (live = false);
	});

	const options = $derived(
		rooms.map((r) => {
			const n = left?.[r.id] ?? 0;
			const small = r.sleeps < adults + children;
			return {
				value: r.id,
				label: r.name,
				description: n <= 2 && n > 0 ? `${r.description} Only ${n} left.` : r.description,
				detail: `${cents(r.rate)} a night`,
				disabled: small || !n,
				reason: small ? `Sleeps ${r.sleeps}` : n ? undefined : 'Taken for these dates'
			};
		})
	);

	function check(step: number) {
		if (step === 0)
			errors = { range: nights > 0 ? undefined : 'Choose the nights you’ll stay: at least one.' };
		else if (step === 1) errors = { room: room ? undefined : 'Choose a room to continue.' };
		else
			errors = {
				guest: guest.trim() ? undefined : 'Enter the name the booking is under.',
				email: /^\S+@\S+\.\S+$/.test(email)
					? undefined
					: 'Enter an email address like you@example.com.'
			};
		return !Object.values(errors).some(Boolean);
	}
</script>

<BookingFlow
	label="Book a stay at {name}"
	steps={['Dates and guests', 'Room', 'Your details']}
	details={[
		['Name', guest],
		['Email', email],
		['Requests', requests]
	]}
	{check}
	submit={() => later(() => void (code = reference()), 1000)}
	submitLabel="Book the stay"
>
	{#snippet body(step)}
		{#if step === 0}
			<div class="booking-fields">
				<DateRangePicker
					label="Check in and out"
					bind:value={range}
					min={today(getLocalTimeZone())}
					error={errors.range}
				/>
				<div class="guests">
					<NumberField label="Adults" bind:value={adults} min={1} max={6} />
					<NumberField label="Children" bind:value={children} min={0} max={4} hint="Under 12" />
				</div>
			</div>
		{:else if step === 1}
			{#if failed}
				<Alert tone="danger" title="Rooms didn’t load">
					Check your connection and try again.
					{#snippet actions()}
						<Button size="sm" variant="secondary" onclick={() => attempt++}>Try again</Button>
					{/snippet}
				</Alert>
			{:else if !left}
				<div class="loading" aria-busy="true" aria-label="Loading rooms">
					{#each rooms as r (r.id)}<Skeleton height="4.5rem" />{/each}
				</div>
			{:else if options.every((o) => o.disabled)}
				<Alert tone="warning" title="Nothing free for these dates">
					Try other nights, or fewer guests per room.
				</Alert>
			{:else}
				<RadioCards
					legend="Rooms for {nights} {nights === 1 ? 'night' : 'nights'}"
					layout="list"
					{options}
					bind:value={room}
					error={errors.room}
				/>
			{/if}
		{:else}
			<div class="booking-fields">
				<Input
					label="Name on the booking"
					bind:value={guest}
					autocomplete="name"
					error={errors.guest}
				/>
				<Input
					label="Email"
					type="email"
					bind:value={email}
					autocomplete="email"
					hint="The confirmation goes here."
					error={errors.email}
				/>
				<Textarea
					label="Requests (optional)"
					bind:value={requests}
					rows={3}
					placeholder="A late arrival, a cot, a quiet room…"
				/>
			</div>
		{/if}
	{/snippet}

	{#snippet summary()}
		<strong>{name}</strong>
		<dl class="booking-facts">
			<div>
				<dt>Dates</dt>
				<dd>{dates ?? 'Not chosen'}</dd>
			</div>
			<div>
				<dt>Guests</dt>
				<dd>
					{adults}
					{adults === 1 ? 'adult' : 'adults'}{children
						? `, ${children} ${children === 1 ? 'child' : 'children'}`
						: ''}
				</dd>
			</div>
			{#if chosen && price}
				<div>
					<dt>Room</dt>
					<dd>{chosen.name}</dd>
				</div>
				<div>
					<dt>{cents(chosen.rate)} × {price.nights}</dt>
					<dd>{cents(price.subtotal)}</dd>
				</div>
				<div>
					<dt>Taxes</dt>
					<dd>{cents(price.taxes)}</dd>
				</div>
				<div class="total">
					<dt>Total</dt>
					<dd>{cents(price.total)}</dd>
				</div>
			{/if}
		</dl>
		{#if !chosen}<p class="muted">Choose a room to see the total.</p>{/if}
	{/snippet}

	{#snippet done(restart)}
		<h3 class="title">Your stay is booked</h3>
		<p>
			{chosen?.name}, {dates}. Your reference is <strong class="code">{code}</strong>; the
			confirmation is on its way to <strong>{email}</strong>.
		</p>
		{#if price}<p class="muted">Paid at the desk on arrival: {cents(price.total)}.</p>{/if}
		<Button
			variant="secondary"
			onclick={() => {
				room = undefined;
				range = undefined;
				restart();
			}}>Book another stay</Button
		>
	{/snippet}
</BookingFlow>

<style>
	.guests {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1rem;
	}
	.loading {
		display: grid;
		gap: 0.5rem;
	}
	.muted {
		color: var(--ui-muted);
	}
	p {
		margin: 0;
	}
	.title {
		margin: 0;
		font-size: 1.25rem;
	}
	.total {
		padding-block-start: 0.25rem;
		font-size: 1rem;
	}
	.code {
		font-family: var(--ui-font-mono);
		letter-spacing: 0.05em;
	}
</style>
