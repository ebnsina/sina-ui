<script lang="ts">
	import ForgotPassword from '#lib/blocks/auth/ForgotPassword.svelte';

	// Stands in for your API.
	const send = () => new Promise((r) => setTimeout(r, 800));
</script>

<ForgotPassword onsubmit={send} signInHref="#sign-in" cooldown={30} />
