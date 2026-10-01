<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import SignaturePad from '#lib/ui/SignaturePad.svelte';

	let pad = $state<SignaturePad>();
	let empty = $state(true);
	let result = $state('');
	let tried = $state(false);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		tried = true;
		if (empty) return;
		const svg = pad?.toSVG() ?? '';
		result = svg
			? `Sent as SVG (${new Intl.NumberFormat().format(svg.length)} characters) and PNG.`
			: 'Sent as PNG.';
	}
</script>

<form class="demo" onsubmit={submit} novalidate>
	<SignaturePad
		bind:this={pad}
		bind:empty
		label="Witness"
		signer="Thābit ibn Qurra"
		name="witness"
	/>
	{#if tried && empty}<p class="error">Sign above, or type your name instead.</p>{/if}
	<Button type="submit">Witness the copy</Button>
	<p class="status" role="status">{result}</p>
</form>

<style>
	.demo {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		inline-size: min(28rem, 100%);
	}
	.demo > :global(.signature) {
		justify-self: stretch;
	}
	.error,
	.status {
		margin: 0;
		font-size: 0.875rem;
	}
	.error {
		color: var(--ui-danger);
	}
	.status {
		color: var(--ui-muted);
	}
</style>
