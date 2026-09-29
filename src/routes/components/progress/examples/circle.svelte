<script lang="ts">
	import Progress from '#lib/ui/Progress.svelte';

	const copied = 164;
	const pages = 214;
</script>

<div class="rings">
	<Progress shape="circle" label="Pages copied" value={copied} max={pages} />
	<Progress shape="circle" label="Proofread" value={38} />
	<Progress shape="circle" label="Binding" size={48} showValue={false} />
</div>

<style>
	.rings {
		display: flex;
		align-items: end;
		gap: 2rem;
	}
</style>
