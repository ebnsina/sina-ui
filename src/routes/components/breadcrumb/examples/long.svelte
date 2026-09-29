<script lang="ts">
	import Breadcrumb from '#lib/ui/Breadcrumb.svelte';
</script>

<!-- Two on one page need different names; a site normally has just one. -->
<Breadcrumb
	label="Breadcrumb, long names example"
	items={[
		{ label: 'Astronomy', href: '#long' },
		{ label: 'Al-Bīrūnī: collected works and letters', href: '#long' },
		{ label: 'The Mas‘ūdic Canon on Astronomy and the Stars' }
	]}
/>
