<script lang="ts">
	import OtpInput from '#lib/ui/OtpInput.svelte';

	let code = $state('');
	let error = $state<string>();
	let verified = $state(false);

	// The error goes as soon as they start typing again.
	$effect(() => {
		if (code) error = undefined;
	});

	// Stands in for your server; 314159 is the right code here.
	function check(entered: string) {
		verified = entered === '314159';
		error = verified ? undefined : "That code isn't right. Check the message and try again.";
		if (!verified) code = '';
	}
</script>

<OtpInput
	label="Verification code"
	bind:value={code}
	groups={[3, 3]}
	name="code"
	hint="We sent a 6-digit code to your phone. (Try 314159.)"
	{error}
	oncomplete={check}
/>
{#if verified}<p class="ok" role="status">Verified. Welcome back to the reading room.</p>{/if}

<style>
	.ok {
		margin: 0.75rem 0 0;
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
		font-weight: 500;
	}
</style>
