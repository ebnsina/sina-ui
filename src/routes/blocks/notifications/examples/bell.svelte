<script lang="ts">
	import NotificationBell from '#lib/blocks/notifications/NotificationBell.svelte';
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { arrival, sample } from './data';

	let items = $state(sample());
	const wait = () => new Promise((r) => setTimeout(r, 400));
</script>

<!-- A stand-in app header; in your app, put the bell in your own. -->
<div class="header">
	<strong>Bayt al-Ḥikma</strong>
	<NotificationBell
		bind:items
		onopen={(n) => toast(`Opening: ${n.actor.name}`)}
		onread={wait}
		onmute={wait}
	/>
</div>
<Button variant="secondary" size="sm" onclick={() => items.unshift(arrival())}
	>Simulate a new notification</Button
>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		inline-size: min(32rem, 100%);
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
</style>
