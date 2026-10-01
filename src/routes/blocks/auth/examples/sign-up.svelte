<script lang="ts">
	import SignUp from '#lib/blocks/auth/SignUp.svelte';

	// Stands in for your API: one address is already taken, to show the message.
	async function signUp({ email }: { name: string; email: string; password: string }) {
		await new Promise((r) => setTimeout(r, 900));
		if (email.toLowerCase() === 'ibnsina@baytalhikma.org')
			throw Object.assign(new Error(), { code: 'email_taken' });
	}
</script>

<SignUp
	onsubmit={signUp}
	termsHref="#sign-up"
	signInHref="#sign-in"
	description="A reader’s card for the House of Wisdom."
/>
