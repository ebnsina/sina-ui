<script lang="ts">
	import PasswordInput from '#lib/ui/PasswordInput.svelte';

	let password = $state('');
</script>

<PasswordInput
	label="New password"
	bind:value={password}
	isNew
	hint="At least 12 characters, mixing letters, numbers and symbols."
/>
