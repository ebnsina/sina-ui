<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';
</script>

<!-- Add <Toaster /> once, in your root layout. -->
<Button
	variant="secondary"
	onclick={() =>
		toast.error('The Córdoba library is closed for the night.', {
			description: 'Requests reopen at dawn prayer.'
		})}
>
	Send to Córdoba
</Button>
