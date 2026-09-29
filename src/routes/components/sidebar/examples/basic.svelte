<script lang="ts">
	import {
		Book02Icon,
		BookOpen01Icon,
		Calendar03Icon,
		Home01Icon,
		Location01Icon
	} from '@hugeicons/core-free-icons';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';

	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#home', icon: Home01Icon },
				{ label: 'Catalogue', href: '#catalogue', icon: BookOpen01Icon },
				{ label: 'My loans', href: '#loans', icon: Book02Icon },
				{ label: 'Bookings', href: '#bookings', icon: Calendar03Icon }
			]
		},
		{
			title: 'Reading rooms',
			items: [
				{ label: 'Baghdad', href: '#baghdad', icon: Location01Icon },
				{ label: 'Córdoba', href: '#cordoba', icon: Location01Icon },
				{ label: 'Fez', href: '#fez', icon: Location01Icon }
			]
		}
	];
	let current = $state('#catalogue');
	const title = $derived(groups.flatMap((g) => g.items).find((i) => i.href === current)?.label);
</script>

<!-- A framed app for the example; in your app, give the layout the whole window. -->
<div class="frame">
	<SidebarLayout label="Library" {groups} {current} onselect={(item) => (current = item.href)}>
		{#snippet header(collapsed)}
			<span class="brand">
				<span class="mark" aria-hidden="true">B</span>
				{#if !collapsed}<strong>Bayt al-Ḥikma</strong>{/if}
			</span>
		{/snippet}
		<div class="page">
			<h4>{title}</h4>
			<p>
				Press ⌘B or Ctrl+B to collapse the sidebar to icons. Make the window narrow for the menu.
			</p>
		</div>
	</SidebarLayout>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 28rem;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 0 0 1px var(--ui-line);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.mark {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		border-radius: calc(var(--ui-radius) * 0.75);
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-weight: 600;
	}
	.page {
		padding: 1.25rem 1.5rem;
	}
	h4 {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
	}
</style>
