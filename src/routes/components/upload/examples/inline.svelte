<script lang="ts">
	import FileDrop from '#lib/ui/FileDrop.svelte';
	import UploadList from '#lib/ui/UploadList.svelte';
	import { createUploads } from '#lib/ui/uploads.svelte.js';
	import { pretendSend } from './pretend-send';

	// In an app: createUploads(xhrSend('/api/scans'))
	const uploads = createUploads(pretendSend);
</script>

<div class="stack">
	<FileDrop
		label="Manuscript scans"
		multiple
		hint="Name a file “damaged” to see a failed upload."
		onfiles={(files) => uploads.add(files)}
	/>
	<UploadList {uploads} />
</div>

<style>
	.stack {
		display: grid;
		gap: 0.75rem;
		inline-size: 100%;
		max-inline-size: 28rem;
	}
</style>
