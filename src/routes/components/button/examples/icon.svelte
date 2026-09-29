<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { Share08Icon } from '@hugeicons/core-free-icons';
</script>

<Button square variant="secondary" aria-label="Share manuscript">
	<Icon icon={Share08Icon} />
</Button>
<Button variant="secondary">
	<Icon icon={Share08Icon} /> Send to Córdoba
</Button>
