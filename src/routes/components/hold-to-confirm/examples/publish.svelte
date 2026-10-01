<script lang="ts">
	import HoldToConfirm from '#lib/ui/HoldToConfirm.svelte';

	const publish = () => new Promise((resolve) => setTimeout(resolve, 800));
</script>

<HoldToConfirm onconfirm={publish} variant="primary" duration={1600} done="Published"
	>Hold to publish the translation</HoldToConfirm
>
