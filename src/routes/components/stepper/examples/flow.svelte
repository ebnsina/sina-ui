<script lang="ts">
	import { fly } from 'svelte/transition';
	import Button from '#lib/ui/Button.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Stepper from '#lib/ui/Stepper.svelte';

	const steps = [
		{ label: 'Reader', description: 'Who is borrowing' },
		{ label: 'Manuscript', description: 'What to copy' },
		{ label: 'Collection', description: 'When and where' },
		{ label: 'Review', description: 'Check and send' }
	];
	let current = $state(0);
	let direction = $state(1);
	let heading = $state<HTMLHeadingElement>();

	function go(to: number) {
		direction = to > current ? 1 : -1;
		current = to;
		// Screen readers hear the new step's heading; keyboard users carry on from there.
		requestAnimationFrame(() => heading?.focus());
	}
</script>

<div class="flow">
	<Stepper {steps} {current} onstep={go} label="Borrowing request" />

	<!-- The step's content slides in from the side it's coming from. -->
	<div class="panel">
		{#key current}
			<section in:fly={{ x: 24 * direction, duration: 250 }}>
				<h3 bind:this={heading} tabindex="-1">{steps[current].label}</h3>
				{#if current === 0}
					<Input label="Name" value="Maryam al-Ijliya" />
				{:else if current === 1}
					<Input label="Manuscript" value="Book of Optics" />
				{:else if current === 2}
					<Input label="Reading room" value="Bayt al-Ḥikma, Baghdad" />
				{:else}
					<p>Maryam al-Ijliya · Book of Optics · Bayt al-Ḥikma, Baghdad</p>
				{/if}
			</section>
		{/key}
	</div>

	<div class="actions">
		<Button variant="ghost" disabled={current === 0} onclick={() => go(current - 1)}>Back</Button>
		{#if current < steps.length - 1}
			<Button onclick={() => go(current + 1)}>Continue</Button>
		{:else}
			<Button onclick={() => go(0)}>Send request</Button>
		{/if}
	</div>
</div>

<style>
	.flow {
		display: grid;
		gap: 1.5rem;
		inline-size: 100%;
		/* Fields and buttons share one column, so Continue lines up with the field's edge. */
		max-inline-size: 36rem;
	}
	/* Clips the slide, with room around it so focus rings inside aren't cut off. */
	.panel {
		display: grid;
		overflow: clip;
		padding: 6px;
		margin: -6px;
	}
	section {
		grid-area: 1 / 1;
		display: grid;
		gap: 0.75rem;
	}
	h3 {
		margin: 0;
		font-size: 1rem;
	}
	h3:focus {
		outline: none;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
