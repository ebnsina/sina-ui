<script lang="ts">
	import OtpInput from '#lib/ui/OtpInput.svelte';

	let pickup = $state('');
</script>

<OtpInput
	label="Pickup code"
	bind:value={pickup}
	length={4}
	mode="text"
	hint="Letters and digits, on your loan slip."
/>
