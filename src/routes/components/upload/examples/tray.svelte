<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import UploadTray from '#lib/ui/UploadTray.svelte';
	import { createUploads } from '#lib/ui/uploads.svelte.js';
	import { pretendSend } from './pretend-send';

	const uploads = createUploads(pretendSend);
	let input: HTMLInputElement;

	// Sample files, so the tray can be tried without choosing any.
	const sample = (name: string, kb: number) =>
		new File([new Uint8Array(kb * 1000)], name, { type: 'image/png' });
</script>

<div class="row">
	<Button onclick={() => input.click()}>Upload scans</Button>
	<Button
		variant="secondary"
		onclick={() =>
			uploads.add([
				sample('folio-1r.png', 2400),
				sample('folio-1v.png', 1800),
				sample('folio-2r-damaged.png', 3100),
				sample('binding.png', 900)
			])}
	>
		Try with sample files
	</Button>
	<input
		bind:this={input}
		type="file"
		multiple
		hidden
		onchange={(e) => e.currentTarget.files && uploads.add(e.currentTarget.files)}
	/>
</div>
<!-- Fixed to the bottom-right of the window, over the page. -->
<UploadTray {uploads} />

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}
</style>
