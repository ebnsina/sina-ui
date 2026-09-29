<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { tick } from 'svelte';
	import * as v from 'valibot';
	import Alert from '#lib/ui/Alert.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Checkbox from '#lib/ui/Checkbox.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Select from '#lib/ui/Select.svelte';

	const Loan = v.object({
		name: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter your name.')),
		email: v.pipe(
			v.string(),
			v.nonEmpty('Enter your email address.'),
			v.email('Enter an email address like ali@baytalhikma.org.')
		),
		manuscript: v.pipe(v.string(), v.nonEmpty('Choose a manuscript.')),
		rules: v.pipe(v.boolean(), v.value(true, 'Agree to the reading-room rules to borrow.'))
	});

	let el: HTMLFormElement;
	let sent = $state<string>();

	const form = createForm(() => ({
		defaultValues: { name: '', email: '', manuscript: '', rules: false },
		validators: {
			onChange: Loan,
			// Stands in for your API; it answers with an error code the form maps to a message.
			onSubmitAsync: async ({ value }) => {
				await new Promise((ok) => setTimeout(ok, 1000));
				if (value.manuscript === 'canon')
					return {
						fields: { manuscript: 'Every copy of the Canon is out. Choose another manuscript.' }
					};
			}
		},
		onSubmit: ({ value }) => {
			sent = `We'll write to ${value.email} when it's ready to collect.`;
		},
		// Take the person to the first problem, as the simple version does.
		onSubmitInvalid: async () => {
			await tick();
			el.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		}
	}));

	const submitting = form.useSelector((s) => s.isSubmitting);
	const attempted = form.useSelector((s) => s.submissionAttempts > 0);

	// Shown once the field has been left or the form sent: no errors while someone is still typing.
	type Meta = { isBlurred: boolean; errors: unknown[] };
	const errorOf = (meta: Meta) =>
		meta.isBlurred || attempted.current
			? meta.errors.map((e) => (typeof e === 'string' ? e : (e as { message: string }).message))[0]
			: undefined;
</script>

<form
	bind:this={el}
	class="form"
	novalidate
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	{#if sent}<Alert tone="success" title="Request sent" live>{sent}</Alert>{/if}

	<form.Field name="name">
		{#snippet children(field)}
			<Input
				label="Name"
				name={field.name}
				autocomplete="name"
				value={field.state.value}
				oninput={(e) => field.handleChange(e.currentTarget.value)}
				onblur={field.handleBlur}
				error={errorOf(field.state.meta)}
			/>
		{/snippet}
	</form.Field>
	<form.Field name="email">
		{#snippet children(field)}
			<Input
				label="Email"
				name={field.name}
				type="email"
				autocomplete="email"
				value={field.state.value}
				oninput={(e) => field.handleChange(e.currentTarget.value)}
				onblur={field.handleBlur}
				error={errorOf(field.state.meta)}
			/>
		{/snippet}
	</form.Field>
	<form.Field name="manuscript">
		{#snippet children(field)}
			<Select
				label="Manuscript"
				name={field.name}
				placeholder="Choose a manuscript"
				value={field.state.value}
				onchange={(e) => field.handleChange(e.currentTarget.value)}
				onblur={field.handleBlur}
				hint="Try The Canon of Medicine to see an error from the server."
				error={errorOf(field.state.meta)}
			>
				<option value="canon">The Canon of Medicine</option>
				<option value="optics">Book of Optics</option>
				<option value="jabr">The Compendious Book on Calculation</option>
			</Select>
		{/snippet}
	</form.Field>
	<form.Field name="rules">
		{#snippet children(field)}
			<Checkbox
				name={field.name}
				checked={field.state.value}
				onchange={(e) => field.handleChange(e.currentTarget.checked)}
				onblur={field.handleBlur}
				error={errorOf(field.state.meta)}
			>
				I agree to the reading-room rules
			</Checkbox>
		{/snippet}
	</form.Field>

	<div class="actions">
		<Button
			type="button"
			variant="ghost"
			onclick={() => {
				form.reset();
				sent = undefined;
			}}>Clear</Button
		>
		<Button type="submit" loading={submitting.current}>Send request</Button>
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
