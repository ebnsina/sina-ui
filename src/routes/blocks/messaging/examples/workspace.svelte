<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Messaging from '#lib/blocks/messaging/Messaging.svelte';
	import { createMock } from '#lib/blocks/messaging/mock.js';

	const api = createMock();
	// Stops the demo's pretend replies when the example goes away.
	onMount(() => () => api.stop());
	let failing = $state(false);
	let reset: ReturnType<typeof setTimeout> | undefined;
	onMount(() => () => clearTimeout(reset));
</script>

<div class="demo">
	<div class="frame"><Messaging {api} label="Bayt al-Hikma" initial="crew" /></div>
	<Button
		variant="secondary"
		size="sm"
		onclick={() => {
			api.failNext();
			failing = true;
			clearTimeout(reset);
			reset = setTimeout(() => (failing = false), 1500);
		}}>{failing ? 'The next request will fail' : 'Fail the next request'}</Button
	>
</div>

<style>
	.demo {
		display: grid;
		justify-items: start;
		gap: 1rem;
		inline-size: 100%;
	}
	.frame {
		inline-size: 100%;
		block-size: min(40rem, 85dvh);
	}
</style>
