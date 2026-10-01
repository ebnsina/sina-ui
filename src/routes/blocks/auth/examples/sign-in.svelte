<script lang="ts">
	import { GoogleIcon } from '@hugeicons/core-free-icons';
	import SignIn from '#lib/blocks/auth/SignIn.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	// Stands in for your API. The demo password is "astrolabe"; anything else is refused with a code.
	async function signIn({ password }: { email: string; password: string; remember: boolean }) {
		await new Promise((r) => setTimeout(r, 800));
		if (password !== 'astrolabe') throw Object.assign(new Error(), { code: 'invalid_credentials' });
	}
</script>

<SignIn
	onsubmit={signIn}
	providers={[{ id: 'google', label: 'Google', icon: GoogleIcon }]}
	onprovider={(id) => toast(`This would go to ${id} to sign in.`)}
	forgotHref="#forgot"
	signUpHref="#sign-up"
	description="Welcome back to Bayt al-Hikma."
/>
