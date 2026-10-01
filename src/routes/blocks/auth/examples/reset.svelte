<script lang="ts">
	import ResetPassword from '#lib/blocks/auth/ResetPassword.svelte';

	// Stands in for your API, which also checks the reset token from the link.
	const save = () => new Promise((r) => setTimeout(r, 900));
</script>

<ResetPassword onsubmit={save} signInHref="#sign-in" />
