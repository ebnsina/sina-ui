<script lang="ts">
	import Avatar from '#lib/ui/Avatar.svelte';
</script>

<div class="person">
	<Avatar name="Thābit ibn Qurra" decorative />
	<div>
		<strong>Thābit ibn Qurra</strong>
		<span>Translator, Baghdad</span>
	</div>
</div>

<style>
	.person {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.person div {
		display: grid;
	}
	.person span {
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
