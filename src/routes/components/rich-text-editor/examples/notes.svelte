<script lang="ts">
	import RichTextEditor from '#lib/ui/RichTextEditor.svelte';

	let html = $state(
		'<h2>Kitab al-Manazir</h2><p>Ibn al-Haytham, <strong>Cairo</strong>, c. 1027. Seven books on <em>how we see</em>.</p><ul><li>Book I: the theory of vision</li><li>Books IV–VI: reflection and mirrors</li></ul><blockquote><p>Light travels in straight lines.</p></blockquote>'
	);
</script>

<div class="demo">
	<RichTextEditor label="Catalog note" bind:html />
</div>

<style>
	.demo {
		inline-size: min(40rem, 100%);
	}
</style>
