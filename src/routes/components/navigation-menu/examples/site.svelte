<script lang="ts">
	import {
		Calculator01Icon,
		Medicine02Icon,
		MapsIcon,
		Telescope01Icon
	} from '@hugeicons/core-free-icons';
	import Icon from '#lib/ui/Icon.svelte';
	import * as Nav from '#lib/ui/navigation-menu/index.js';

	const collections = [
		{
			icon: Medicine02Icon,
			title: 'Medicine',
			text: 'The Canon, al-Razi’s notebooks and the surgeons of Córdoba.'
		},
		{
			icon: Telescope01Icon,
			title: 'Astronomy',
			text: 'Star tables from Raqqa, Maragheh and Samarkand.'
		},
		{
			icon: Calculator01Icon,
			title: 'Mathematics',
			text: 'Al-Jabr, and the algebra that grew from it.'
		},
		{
			icon: MapsIcon,
			title: 'Geography',
			text: 'Al-Idrisi’s world map, drawn for Roger II in Palermo.'
		}
	];
	const scholars = [
		'Al-Khwarizmi',
		'Ibn Sina',
		'Ibn al-Haytham',
		'Al-Biruni',
		'Fatima al-Fihri',
		'Al-Jazari'
	];
</script>

<Nav.Root label="Main">
	<Nav.Item label="Collections">
		<ul class="cards">
			{#each collections as c (c.title)}
				<li>
					<a href="#site" class="card">
						<span class="icon"><Icon icon={c.icon} size={18} /></span>
						<span class="title">{c.title}</span>
						<span class="text">{c.text}</span>
					</a>
				</li>
			{/each}
		</ul>
	</Nav.Item>
	<Nav.Item label="Scholars">
		<ul class="names">
			{#each scholars as s (s)}<li><a href="#site">{s}</a></li>{/each}
		</ul>
	</Nav.Item>
	<Nav.Link href="#site">Visit</Nav.Link>
	<Nav.Link href="#site" current>About</Nav.Link>
</Nav.Root>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 15rem));
		gap: 0.25rem;
	}
	@media (max-width: 36rem) {
		.cards {
			grid-template-columns: minmax(0, 17rem);
		}
	}
	.card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.125rem 0.75rem;
		padding: 0.75rem;
		border-radius: var(--ui-radius);
		color: inherit;
		text-decoration: none;
		transition: background-color var(--ui-dur-press) ease;
	}
	.card:hover,
	.names a:hover {
		background: var(--ui-subtle);
	}
	.card:focus-visible,
	.names a:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: -2px;
	}
	.icon {
		display: grid;
		grid-row: span 2;
		place-items: center;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		border-radius: var(--ui-radius);
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
	}
	.title {
		font-weight: 600;
	}
	.text {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		line-height: 1.45;
	}
	.names {
		display: grid;
		grid-template-columns: repeat(2, max-content);
		gap: 0.125rem 0.5rem;
	}
	.names a {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: var(--ui-radius);
		color: inherit;
		text-decoration: none;
		white-space: nowrap;
	}
</style>
