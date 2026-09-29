<script lang="ts">
	import Alert from '#lib/ui/Alert.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Checkbox from '#lib/ui/Checkbox.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Select from '#lib/ui/Select.svelte';
	import { createForm } from '#lib/ui/form.svelte.js';

	let sent = $state<string>();

	const form = createForm({
		messages: {
			name: { valueMissing: 'Enter your name.' },
			email: {
				valueMissing: 'Enter your email address.',
				typeMismatch: 'Enter an email address like ali@baytalhikma.org.'
			},
			manuscript: { valueMissing: 'Choose a manuscript.' },
			days: {
				valueMissing: 'Enter how many days you need it.',
				rangeUnderflow: 'Borrow it for at least 1 day.',
				rangeOverflow: 'Loans last 90 days at most.'
			},
			rules: { valueMissing: 'Agree to the reading-room rules to borrow.' }
		},
		async onsubmit(data) {
			// Stands in for your API; it answers with an error code the form maps to a message.
			await new Promise((ok) => setTimeout(ok, 1000));
			if (data.get('manuscript') === 'canon')
				return { manuscript: 'Every copy of the Canon is out. Choose another manuscript.' };
			sent = `We'll write to ${data.get('email')} when it's ready to collect.`;
		}
	});
</script>

<form class="form" {@attach form.attach}>
	{#if form.errors.form}
		<Alert tone="danger" title="The request wasn't sent" live>{form.errors.form}</Alert>
	{/if}
	{#if sent}<Alert tone="success" title="Request sent" live>{sent}</Alert>{/if}

	<Input label="Name" name="name" autocomplete="name" required error={form.errors.name} />
	<Input
		label="Email"
		name="email"
		type="email"
		autocomplete="email"
		required
		error={form.errors.email}
	/>
	<Select
		label="Manuscript"
		name="manuscript"
		placeholder="Choose a manuscript"
		required
		hint="Try The Canon of Medicine to see an error from the server."
		error={form.errors.manuscript}
	>
		<option value="canon">The Canon of Medicine</option>
		<option value="optics">Book of Optics</option>
		<option value="jabr">The Compendious Book on Calculation</option>
	</Select>
	<Input
		label="Days"
		name="days"
		type="number"
		inputmode="numeric"
		min="1"
		max="90"
		value="40"
		required
		error={form.errors.days}
	/>
	<Checkbox name="rules" required error={form.errors.rules}>
		I agree to the reading-room rules
	</Checkbox>

	<div class="actions">
		<Button type="reset" variant="ghost" onclick={() => (sent = undefined)}>Clear</Button>
		<Button type="submit" loading={form.submitting}>Send request</Button>
	</div>
</form>

<style>
	.form {
		display: grid;
		gap: 1rem;
		inline-size: 100%;
		max-inline-size: 26rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap-reverse;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
