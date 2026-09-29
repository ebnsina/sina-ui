<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';
</script>

<!-- Add <Toaster /> once, in your root layout. -->
<Button variant="secondary" onclick={() => toast('Manuscript added to your reading list.')}>
	Default
</Button>
<Button
	variant="secondary"
	onclick={() =>
		toast.success('Copy commissioned', {
			description: 'A scribe in Baghdad will finish it within the season.'
		})}
>
	Success
</Button>
<Button
	variant="secondary"
	onclick={() =>
		toast.error('The Córdoba library is closed for the night.', {
			description: 'Requests reopen at dawn prayer.'
		})}
>
	Error
</Button>
