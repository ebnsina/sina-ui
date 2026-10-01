<script lang="ts">
	import AnnouncementBar from '#lib/ui/AnnouncementBar.svelte';
</script>

<div class="stage">
	<AnnouncementBar
		label="Closure notice"
		tone="warning"
		persist="sinaui-demo-flood-notice"
		messages={[{ text: 'Books on the lower shelves are being moved before the river rises.' }]}
	/>
	<div class="page" aria-hidden="true">
		<span class="line"></span><span class="line short"></span>
	</div>
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
</style>
