<script lang="ts">
	import Progress from '#lib/ui/Progress.svelte';
</script>

<!-- No value: an arc turns until the work is done. -->
<Progress shape="circle" label="Binding" size={48} showValue={false} />
