<script lang="ts">
	import PhoneInput from '#lib/ui/PhoneInput.svelte';

	let value = $state('');
</script>

<PhoneInput
	label="Phone"
	country="BD"
	preferred={['BD', 'MY', 'SA', 'TR']}
	hint="We'll text you when your manuscript is ready to collect."
	bind:value
/>
<p class="out">{value ? `Saved as ${value}` : 'Nothing saved yet'}</p>

<style>
	.out {
		margin: 0.75rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
</style>
