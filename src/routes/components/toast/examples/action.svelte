<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import { toast } from '#lib/ui/toast/index.js';

	let loans = $state(3);

	function withdraw() {
		loans -= 1;
		toast('Loan withdrawn.', { action: { label: 'Undo', onclick: () => (loans += 1) } });
	}
</script>

<Button variant="danger" onclick={withdraw} disabled={loans === 0}>Withdraw a loan</Button>
<p class="count" role="status">{loans} loans active</p>

<style>
	.count {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
