<script lang="ts">
	import Inbox from '#lib/blocks/notifications/Inbox.svelte';
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import { older, sample } from './data';

	let items = $state(sample());
	let loading = $state(false);
	let error = $state<string>();
	let failNext = $state(false);
	let pages = $state(0);
	const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));

	// Stand-ins for your API. "Fail the next save" shows what happens when saving goes wrong.
	async function save() {
		await wait(400);
		if (failNext) {
			failNext = false;
			throw new Error('offline');
		}
	}
	async function reload(fail = false) {
		loading = true;
		error = undefined;
		await wait(900);
		loading = false;
		if (fail) error = 'The library’s server didn’t answer. Check your connection and try again.';
		else items = sample();
	}
</script>

<div class="page">
	<Inbox
		title="All notifications"
		bind:items
		{loading}
		{error}
		onretry={() => reload()}
		onopen={(n) => toast(`Opening: ${n.actor.name}`)}
		onread={save}
		onmute={save}
		more={pages < 2}
		onmore={async () => {
			await wait(700);
			items.push(...older());
			pages++;
		}}
	/>
	<div class="controls">
		<Button variant="secondary" size="sm" onclick={() => (failNext = true)} disabled={failNext}
			>{failNext ? 'The next save will fail' : 'Fail the next save'}</Button
		>
		<Button variant="ghost" size="sm" onclick={() => reload()}>Reload</Button>
		<Button variant="ghost" size="sm" onclick={() => reload(true)}>Reload with an error</Button>
	</div>
</div>

<style>
	.page {
		display: grid;
		gap: 1rem;
		inline-size: min(36rem, 100%);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
