<script lang="ts">
	import { asset } from '$app/paths';
	import Chat from '#lib/ui/Chat.svelte';
	import { conversation, me, users, wait } from './data';

	let messages = $state(
		conversation([
			[
				'maryam',
				'Here’s the tile pattern for the observatory floor.',
				{
					attachments: [
						{
							name: 'star-tile.svg',
							size: 4_812,
							type: 'image/svg+xml',
							url: asset('demo/star-tile.svg'),
							width: 1,
							height: 1
						}
					]
				}
			],
			['hunayn', 'Beautiful. And the reading room?'],
			[
				'maryam',
				'',
				{
					attachments: [
						{
							name: 'reading-room.jpg',
							size: 218_430,
							type: 'image/jpeg',
							url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/A_Library_in_Golden_Islamic_Age.jpg/960px-A_Library_in_Golden_Islamic_Age.jpg',
							width: 960,
							height: 1280
						}
					]
				}
			],
			[
				'maryam',
				'And the measurements, as promised.',
				{
					attachments: [
						{
							name: 'baghdad-plate-measurements.txt',
							size: 96,
							type: 'text/plain',
							url: `data:text/plain,${encodeURIComponent('Baghdad plate\nLatitude 33° 20′\nAltitude circles every 2°\nQibla bearing 196°\n')}`
						}
					]
				}
			]
		])
	);
</script>

<div class="frame">
	<Chat bind:messages {users} {me} label="Plans from Maryam al-Asturlabi" send={() => wait(900)} />
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 32rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		overflow: hidden;
	}
</style>
