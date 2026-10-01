<script lang="ts">
	import Input from '#lib/ui/Input.svelte';

	let email = $state('khwarizmi@');
	const error = $derived(
		/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
			? undefined
			: 'Enter an email like khwarizmi@baytalhikma.org.'
	);
</script>

<Input label="Email" type="email" autocomplete="email" bind:value={email} {error} />
