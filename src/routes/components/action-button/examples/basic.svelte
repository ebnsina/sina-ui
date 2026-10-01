<script lang="ts">
	import ActionButton from '#lib/ui/ActionButton.svelte';

	const send = () => new Promise((resolve) => setTimeout(resolve, 1200));
</script>

<ActionButton action={send} done="Sent">Send to the copyists</ActionButton>
