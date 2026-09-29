<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Separator from '#lib/ui/Separator.svelte';
</script>

<div class="stack">
	<Button variant="secondary">Continue with your library card</Button>
	<Separator>or</Separator>
	<Input label="Email" type="email" autocomplete="email" />
	<Button>Send sign-in link</Button>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
		inline-size: min(100%, 22rem);
	}
</style>
