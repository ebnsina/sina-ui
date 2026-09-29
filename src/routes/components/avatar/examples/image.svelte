<script lang="ts">
	import Avatar from '#lib/ui/Avatar.svelte';
</script>

<Avatar
	name="Ebn Sina"
	src="https://avatars.githubusercontent.com/u/26293733?v=4&size=64"
	size="lg"
/>
<!-- A broken image falls back to the initials. -->
<Avatar name="Fāṭima al-Fihrī" src="/demo/missing.png" size="lg" />
