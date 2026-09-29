<script lang="ts">
	import { BookOpen01Icon, Moon02Icon } from '@hugeicons/core-free-icons';
	import Badge from '#lib/ui/Badge.svelte';
</script>

<Badge tone="accent" icon={BookOpen01Icon}>In the reading room</Badge>
<Badge icon={Moon02Icon}>Open after Maghrib</Badge>
<Badge tone="warning" icon={false}>No icon</Badge>
