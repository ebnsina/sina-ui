<script lang="ts">
	import Breadcrumb from '#lib/ui/Breadcrumb.svelte';
</script>

<!-- Two on one page need different names; a site normally has just one. -->
<Breadcrumb
	label="Breadcrumb, collapsed example"
	items={[
		{ label: 'Library', href: '#collapsed' },
		{ label: 'Sciences', href: '#collapsed' },
		{ label: 'Medicine', href: '#collapsed' },
		{ label: 'Ibn Sīnā', href: '#collapsed' },
		{ label: 'The Canon of Medicine', href: '#collapsed' },
		{ label: 'Book One: General Principles' }
	]}
/>
