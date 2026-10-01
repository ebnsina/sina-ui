<script lang="ts">
	import VerifyCode from '#lib/blocks/auth/VerifyCode.svelte';

	// Stands in for your API. The demo code is 314159; any other is refused with a code.
	async function check(code: string) {
		await new Promise((r) => setTimeout(r, 700));
		if (code !== '314159') throw Object.assign(new Error(), { code: 'invalid_code' });
	}
	const resend = () => new Promise((r) => setTimeout(r, 600));
</script>

<VerifyCode onsubmit={check} onresend={resend} sentTo="maryam@baytalhikma.org" cooldown={30} />
