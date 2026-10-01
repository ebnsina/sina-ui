<script lang="ts">
	import { Mic01Icon, MicOff01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Visualizer from '#lib/ui/Visualizer.svelte';

	let stream = $state<MediaStream | null>(null);
	let problem = $state('');
	let asking = $state(false);

	async function start() {
		problem = '';
		asking = true;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (e) {
			problem =
				(e as DOMException).name === 'NotAllowedError'
					? 'Microphone access was turned down. Allow it in your browser’s site settings, then try again.'
					: 'No microphone could be found. Plug one in, then try again.';
		} finally {
			asking = false;
		}
	}
	function stop() {
		for (const t of stream?.getTracks() ?? []) t.stop();
		stream = null;
	}
	// Leaving the page turns the microphone off.
	$effect(() => stop);
</script>

<div class="demo">
	<Visualizer
		source={stream}
		mirror
		label={stream ? 'Your microphone’s sound levels' : undefined}
	/>
	{#if stream}
		<Button variant="secondary" onclick={stop}
			><Icon icon={MicOff01Icon} size={18} />Stop listening</Button
		>
	{:else}
		<Button loading={asking} onclick={start}
			><Icon icon={Mic01Icon} size={18} />Listen to the microphone</Button
		>
	{/if}
	{#if problem}<p role="alert">{problem}</p>{/if}
</div>

<style>
	.demo {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		inline-size: 100%;
		max-inline-size: 28rem;
	}
	p {
		margin: 0;
		color: var(--ui-danger);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
