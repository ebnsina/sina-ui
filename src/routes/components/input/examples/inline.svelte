<script lang="ts">
	import InlineEdit from '#lib/ui/InlineEdit.svelte';

	let title = $state('Kitab al-Manazir (Book of Optics)');
</script>

<div class="demo">
	<InlineEdit label="Title" bind:value={title} required maxlength={80} />
</div>

<style>
	.demo {
		inline-size: min(24rem, 100%);
	}
</style>
