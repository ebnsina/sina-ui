<script lang="ts">
	import Clock from '#lib/ui/Clock.svelte';
</script>

<div class="row">
	<Clock variant="digital" label="Your time" />
	<Clock variant="digital" timeZone="Asia/Baghdad" label="Baghdad" seconds={false} />
</div>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 3rem;
	}
</style>
