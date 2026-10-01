<script lang="ts">
	import { onMount } from 'svelte';
	import Messaging from '#lib/blocks/messaging/Messaging.svelte';
	import { createMock } from '#lib/blocks/messaging/mock.js';

	const api = createMock({ empty: true });
	onMount(() => () => api.stop());
</script>

<div class="frame"><Messaging {api} label="New workspace" /></div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 30rem;
	}
</style>
