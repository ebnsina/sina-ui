<script lang="ts">
	import RichTextEditor from '#lib/ui/RichTextEditor.svelte';

	let html = $state('');
</script>

<div class="demo">
	<RichTextEditor
		label="Note for the copyists"
		placeholder="What should they know before they start?"
		maxLength={280}
		bind:html
	/>
	<details>
		<summary>HTML it sends</summary>
		<pre><code>{html || '(empty)'}</code></pre>
	</details>
</div>

<style>
	.demo {
		display: grid;
		gap: 0.75rem;
		inline-size: min(40rem, 100%);
	}
	summary {
		color: var(--ui-muted);
		font-size: 0.875rem;
		cursor: pointer;
	}
	pre {
		margin: 0.5rem 0 0;
		padding: 0.75rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
		font-size: 0.8125rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
