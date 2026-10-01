<script lang="ts">
	import { RefreshIcon } from '@hugeicons/core-free-icons';
	import AnnouncementBar from '#lib/ui/AnnouncementBar.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let key = $state(0);
	let shown = $state(true);
	const closes = Date.now() + 5 * 3600_000 + 42 * 60_000;
</script>

<div class="stage">
	{#key key}
		<AnnouncementBar
			label="Reading room hours"
			tone="accent"
			ondismiss={() => setTimeout(() => (shown = false), 360)}
			messages={[
				{
					text: 'The reading room stays open late tonight.',
					countdown: { to: closes, label: 'Closes in' },
					link: 'See the hours',
					href: '#countdown'
				}
			]}
		/>
	{/key}
	<div class="page" aria-hidden="true">
		<span class="line"></span><span class="line short"></span>
	</div>
	{#if !shown}
		<span class="again">
			<Button
				variant="secondary"
				size="sm"
				onclick={() => {
					key++;
					shown = true;
				}}><Icon icon={RefreshIcon} size={14} /> Show again</Button
			>
		</span>
	{/if}
</div>

<style>
	/* A stand-in page: the bar sits across its top, the page closes up when it goes. */
	.stage {
		position: relative;
		display: flex;
		flex-direction: column;
		inline-size: min(40rem, 100%);
		block-size: 9.5rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.page {
		display: grid;
		align-content: start;
		gap: 0.625rem;
		padding: 1.25rem;
	}
	.line {
		block-size: 0.5rem;
		inline-size: 42%;
		border-radius: 999px;
		background: var(--ui-subtle);
	}
	.short {
		inline-size: 26%;
	}
	.again {
		position: absolute;
		inset-block-start: 0.875rem;
		inset-inline-end: 0.875rem;
		animation: in var(--ui-dur) var(--ui-ease-out) both;
	}
	@keyframes in {
		from {
			opacity: 0;
			scale: 0.95;
		}
	}
</style>
