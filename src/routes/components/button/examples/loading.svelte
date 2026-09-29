<script lang="ts">
	import Button from '#lib/ui/Button.svelte';

	let copying = $state(false);

	function transcribe() {
		copying = true;
		setTimeout(() => (copying = false), 1500);
	}
</script>

<Button loading={copying} onclick={transcribe}>Transcribe</Button>
