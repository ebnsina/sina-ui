<script lang="ts">
	import AvatarGroup from '#lib/ui/AvatarGroup.svelte';

	const circle = [{ name: 'Thabit ibn Qurra' }, { name: 'Hunayn ibn Ishaq' }, { name: 'Al-Kindi' }];
</script>

<AvatarGroup people={circle} size="sm" label="Translators" />
