<script lang="ts">
	import Avatar from '#lib/ui/Avatar.svelte';
	import HoverCard from '#lib/ui/HoverCard.svelte';
</script>

<!-- A div, not a p: a paragraph can't contain the card (the browser would split it). -->
<div class="text">
	The theory of vision was rewritten by
	<HoverCard>
		{#snippet trigger(props)}
			<a href="#basic" {...props}>Ibn al-Haytham</a>
		{/snippet}
		<div class="person">
			<Avatar name="Ibn al-Haytham" decorative />
			<div>
				<strong>Ibn al-Haytham</strong>
				<span class="dates">c. 965 – c. 1040 · Basra and Cairo</span>
			</div>
		</div>
		<p class="about">
			Showed that we see because light enters the eye, and tested it by experiment in his Book of
			Optics.
		</p>
		<p class="more">
			Holdings: 4 manuscripts, Bayt al-Ḥikma reading room · <a href="#basic">Read more</a>
		</p>
	</HoverCard>
	in the early 11th century.
</div>

<style>
	.text {
		text-align: center;
	}
	.person {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.person div {
		display: grid;
	}
	.dates,
	.more {
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.about {
		margin: 0.75rem 0 0.5rem;
	}
	.more {
		margin: 0;
	}
</style>
