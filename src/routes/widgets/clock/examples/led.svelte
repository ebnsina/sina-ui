<script lang="ts">
	import Clock from '#lib/ui/Clock.svelte';
</script>

<div class="row">
	<Clock variant="led" label="Your time" />
	<Clock variant="led" timeZone="Asia/Baghdad" label="Baghdad" seconds={false} color="#ff4d3d" />
</div>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}
</style>
